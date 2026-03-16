
'use client'
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flame, X } from "lucide-react";
import { useSupabase } from "@/lib/supabase/provider";
import { useCollection, useDoc } from "@/hooks/use-supabase";
import { LocalNotifications } from '@capacitor/local-notifications';
import type {
  Transaction,
  Category,
  Budget,
  BudgetSettings,
  Settings,
} from "@/lib/types";
import { getCurrencySymbol } from "@/lib/currency";

const NOTIFICATION_THRESHOLD = 0.8; // 80%
const VALID_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR'];
const STORAGE_KEY = 'budget_dismissed_alerts';
const NOTIFIED_KEY = 'budget_notified_amounts';

// Persist dismissed alerts in localStorage so they survive navigation and app restarts
const loadDismissed = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveDismissed = (data: Record<string, number>) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
};

// Track which spending amounts have already triggered a system notification
const loadNotified = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveNotified = (data: Record<string, number>) => {
  try {
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(data));
  } catch {}
};

export const BudgetNotifier = () => {
  const { session, supabase } = useSupabase();
  const user = session?.user;
  const [triggeredBudget, setTriggeredBudget] = useState<Budget | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Record<string, number>>(loadDismissed);
  const hasFixedCurrency = useRef(false);

  const { data: budgetSettings } = useDoc<BudgetSettings>(
    user ? `budgets?user_id=eq.${user.id}` : null
  );

  const { data: categories } = useCollection<Category>(
    user ? `categories?user_id=eq.${user.id}` : null
  );

  const { data: expenses } = useCollection<Transaction>(
    user ? `transactions?select=*&user_id=eq.${user.id}` : null
  );

  const { data: settings, mutate: mutateSettings } = useDoc<Settings>(
    user ? `settings?select=*&user_id=eq.${user.id}` : null
  );

  // AUTO-FIX: If the database has an invalid/unsupported currency, correct it to INR
  useEffect(() => {
    if (!user || !settings || !supabase || hasFixedCurrency.current) return;
    if (settings.currency && !VALID_CURRENCIES.includes(settings.currency)) {
      hasFixedCurrency.current = true;
      supabase
        .from('settings')
        .update({ currency: 'INR' })
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (!error) {
            mutateSettings();
          }
        });
    }
  }, [user, settings, supabase, mutateSettings]);

  // Use the corrected currency or force INR if invalid
  const effectiveCurrency = useMemo(() => {
    if (!settings?.currency || !VALID_CURRENCIES.includes(settings.currency)) {
      return 'INR';
    }
    return settings.currency;
  }, [settings]);

  const currencySymbol = useMemo(
    () => getCurrencySymbol(effectiveCurrency),
    [effectiveCurrency]
  );

  const activeBudgets = useMemo<Budget[]>(() => {
    if (!budgetSettings?.budgets || !categories || !expenses) {
      return [];
    }

    return Object.entries(budgetSettings.budgets).map(
      ([categoryId, limit]) => {
        const category = categories.find(
          (c) => String(c.id) === categoryId
        );

        if (!category || limit <= 0) {
          return {
            id: categoryId,
            categoryName: "Unknown",
            amount: limit,
            spent: 0,
          };
        }

        const spent =
          expenses
            .filter(
              (e) =>
                e.type === "debit" &&
                e.category === category.name
            )
            .reduce((sum, e) => sum + e.amount, 0) ?? 0;

        return {
          id: categoryId,
          categoryName: category.name,
          amount: limit,
          spent,
        };
      }
    );
  }, [budgetSettings, categories, expenses]);

  // Check budgets and show alert ONLY when spending has increased since last dismiss
  useEffect(() => {
    const checkPermissions = async () => {
      if (settings?.notifications) {
        const status = await LocalNotifications.checkPermissions();
        if (status.display === 'prompt') {
          await LocalNotifications.requestPermissions();
        }
      }
    };
    checkPermissions();

    // Find a budget where:
    // 1. Spending is at or above the threshold
    // 2. Current spending is HIGHER than what was dismissed (meaning new transaction added)
    const next = activeBudgets.find((b) => {
      const spent = b.spent ?? 0;
      const dismissedSpent = dismissedAlerts[b.categoryName] ?? -1;
      return (
        b.amount > 0 &&
        spent / b.amount >= NOTIFICATION_THRESHOLD &&
        spent > dismissedSpent
      );
    });

    if (next) {
      setTriggeredBudget(next);

      // Send system notification ONLY if spending increased since last notification
      if (settings?.notifications === true) {
        const notifiedAmounts = loadNotified();
        const lastNotifiedSpent = notifiedAmounts[next.categoryName] ?? 0;

        if (next.spent > lastNotifiedSpent) {
          const spentAmount = next.spent || 0;
          const rawPercent = (spentAmount / (next.amount || 1)) * 100;
          const percentRaw = Math.min(100, Math.round(rawPercent));

          LocalNotifications.schedule({
            notifications: [
              {
                title: 'Budget Alert 🚨',
                body: `You've used ${percentRaw}% of your ${next.categoryName} budget.`,
                id: Math.floor(Math.random() * 100000),
                schedule: { at: new Date(Date.now() + 1000) },
                smallIcon: 'ic_stat_notification',
                actionTypeId: "",
                extra: null
              }
            ]
          }).catch(err => console.error("Error scheduling notification", err));

          // Mark this spending level as notified
          notifiedAmounts[next.categoryName] = next.spent;
          saveNotified(notifiedAmounts);
        }
      }
    } else {
      setTriggeredBudget(null);
    }
  }, [activeBudgets, dismissedAlerts, settings]);

  const handleDismiss = useCallback(() => {
    if (!triggeredBudget) return;

    const newDismissed = {
      ...dismissedAlerts,
      [triggeredBudget.categoryName]: triggeredBudget.spent || 0,
    };
    setDismissedAlerts(newDismissed);
    saveDismissed(newDismissed); // Persist to localStorage
    setTriggeredBudget(null);
  }, [triggeredBudget, dismissedAlerts]);

  if (!triggeredBudget) return null;

  const spent = triggeredBudget.spent ?? 0;
  const amount = triggeredBudget.amount;
  const rawPercent = Math.round((spent / amount) * 100);
  const progressPercent = Math.min(100, rawPercent); // Cap progress bar at 100%
  const isOverBudget = spent > amount;
  const overAmount = isOverBudget ? spent - amount : 0;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-24 left-4 right-4 z-[100] mx-auto max-w-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
      >
        {/* Glass card */}
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.12] bg-white/[0.06] backdrop-blur-2xl shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
          <div className="p-4">
            {/* Close */}
            <button
              onClick={handleDismiss}
              className="absolute right-3 top-3 h-7 w-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-white/60" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-9 w-9 rounded-xl bg-red-500/20 flex items-center justify-center">
                <Flame className="h-4.5 w-4.5 text-red-400" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/90 tracking-wide">
                  {isOverBudget ? 'Over Budget' : 'Budget Warning'}
                </p>
                <p className="text-[11px] text-white/40">{triggeredBudget.categoryName}</p>
              </div>
            </div>

            {/* Amount row */}
            <div className="flex items-baseline gap-1.5 mb-3">
              <span className="text-2xl font-bold text-white">
                {currencySymbol}{amount.toFixed(0)}
              </span>
              <span className="text-sm text-white/40">budget</span>
              {isOverBudget && (
                <span className="text-sm font-semibold text-red-400 ml-auto">
                  -{currencySymbol}{overAmount.toFixed(0)} over
                </span>
              )}
            </div>

            {/* Progress */}
            <div className="space-y-1.5">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    isOverBudget
                      ? 'bg-red-400'
                      : progressPercent >= 90
                      ? 'bg-amber-400'
                      : 'bg-blue-400'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-white/35 font-medium">
                <span>{progressPercent}% used</span>
                <span>{isOverBudget ? `${currencySymbol}${spent.toFixed(0)} spent` : 'Limit'}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
