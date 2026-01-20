
'use client';

import { ReactNode, createContext, useContext } from "react";
import { useSupabase } from "@/lib/supabase/provider";
import { addDocument, deleteDocument, updateDocument, setDocument } from "@/hooks/use-supabase";
import { autoCategorizeExpense } from "@/ai/categorize";
import type { Transaction, Settings, Category } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { useSWRConfig } from "swr";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/error";
import { formatDate } from "@/lib/utils";

export interface AppContextType {
  addTransaction: (
    transaction: Omit<Transaction, "id" | "date" | "created_at" | "user_id">,
    autoCategorize: boolean
  ) => Promise<void>;
  deleteTransaction: (id: number) => void;
  addCategory: (category: Omit<Category, "id" | "user_id" | "created_at">) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const { session } = useSupabase();
  const user = session?.user;
  const supabase = createClient();
  const { mutate } = useSWRConfig();

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "date" | "created_at" | "user_id">,
    autoCategorize: boolean
  ) => {
    if (!user) return;

    let finalCategoryName = transaction.category;

    if (autoCategorize) {
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id);

      if (catError) { console.error(catError); }

      const predicted = await autoCategorizeExpense(
        transaction.merchant,
        categories || []
      );

      finalCategoryName = predicted || "General";

      const { data: existingCat, error: existError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', finalCategoryName)
        .maybeSingle();

      if (existError) { console.error(existError); }

      if (!existingCat) {
        await addDocument("categories", {
          name: finalCategoryName,
          icon: "FolderTree",
          color: "text-primary",
          bg_color: "bg-primary/10",
          groups: [],
        });
      }
    }

    await addDocument("transactions", {
      ...transaction,
      category: finalCategoryName,
      date: formatDate(new Date()),
    });
    mutate(`transactions?user_id=eq.${user.id}`);
    mutate(`categories?user_id=eq.${user.id}`);
  };

  const deleteTransaction = async (id: number) => {
    if (!user) return;
    await deleteDocument("transactions", id);
    mutate(`transactions?user_id=eq.${user.id}`);
  };

  const addCategory = async (category: Omit<Category, "id" | "user_id" | "created_at">) => {
    if (!user) return;
    await addDocument("categories", category);
    mutate(`categories?user_id=eq.${user.id}`);
  };

  const deleteCategory = async (id: number) => {
    if (!user) return;
    const { error } = await supabase.rpc('delete_category_and_reassign_transactions', { category_id_to_delete: id });

    if (error) {
      console.error('Failed to delete category:', error);
      toast.error('Failed to delete category.', { description: error.message });
    } else {
      toast.success('Category deleted and transactions reassigned.');
      mutate(`transactions?user_id=eq.${user.id}`);
      mutate(`categories?user_id=eq.${user.id}`);
    }
  };

  const updateSettings = async (settings: Partial<Settings>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('settings')
        .upsert({ ...settings, user_id: user.id }, { onConflict: 'user_id' });

      if (error) throw error;

      mutate(`settings?user_id=eq.${user.id}`);
      toast.success("Settings updated successfully!");

    } catch (error) {
      toast.error("Failed to update settings.", {
        description: getErrorMessage(error),
      });
      console.error("Settings update error:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        addTransaction,
        deleteTransaction,
        addCategory,
        deleteCategory,
        updateSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
