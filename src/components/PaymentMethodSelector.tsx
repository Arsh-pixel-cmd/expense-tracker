'use client';

import { Check, CreditCard, Banknote, Smartphone, Wallet, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file for classnames

export type PaymentMethod = 'cash' | 'card' | 'gpay' | 'phonepe' | 'paytm' | 'other';

interface PaymentMethodSelectorProps {
    value: string;
    onChange: (method: PaymentMethod) => void;
}

const METHODS: { id: PaymentMethod; label: string; icon: any; color: string; bg: string }[] = [
    {
        id: 'cash',
        label: 'Cash',
        icon: Banknote,
        color: 'text-green-600',
        bg: 'bg-green-100 dark:bg-green-900/20'
    },
    {
        id: 'gpay',
        label: 'GPay',
        icon: Wallet,
        color: 'text-blue-600',
        bg: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
        id: 'phonepe',
        label: 'PhonePe',
        icon: Smartphone,
        color: 'text-purple-600',
        bg: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
        id: 'paytm',
        label: 'Paytm',
        icon: Smartphone,
        color: 'text-cyan-600',
        bg: 'bg-cyan-100 dark:bg-cyan-900/20'
    },
    {
        id: 'card',
        label: 'Card',
        icon: CreditCard,
        color: 'text-indigo-600',
        bg: 'bg-indigo-100 dark:bg-indigo-900/20'
    },
    {
        id: 'other',
        label: 'Other',
        icon: MoreHorizontal,
        color: 'text-gray-600',
        bg: 'bg-gray-100 dark:bg-gray-800'
    },
];

export const PaymentMethodSelector = ({ value, onChange }: PaymentMethodSelectorProps) => {
    return (
        <div className="grid grid-cols-3 gap-3">
            {METHODS.map((method) => {
                const isSelected = value === method.id;
                const Icon = method.icon;

                return (
                    <button
                        key={method.id}
                        type="button"
                        onClick={() => onChange(method.id)}
                        className={cn(
                            "relative flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200",
                            isSelected
                                ? `border-[color:var(--highlight-color)] bg-[color:var(--highlight-bg)]`
                                : "border-transparent bg-muted/50 hover:bg-muted"
                        )}
                        style={isSelected ? {
                            '--highlight-color': method.color.replace('text-', ''), // Hacky way to dynamic colors, better to use specific classes
                            // Actually let's just use specific border classes based on selection state
                            borderColor: isSelected ? 'currentColor' : undefined
                        } as any : {}}
                    >
                        <div className={cn(
                            "p-2 rounded-full mb-2 transition-colors",
                            method.bg,
                            method.color
                        )}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">
                            {method.label}
                        </span>

                        {isSelected && (
                            <div className="absolute top-2 right-2">
                                <div className="bg-primary text-primary-foreground rounded-full p-0.5">
                                    <Check className="w-3 h-3" />
                                </div>
                            </div>
                        )}

                        {/* Active Border Overlay for cleaner styling */}
                        {isSelected && (
                            <div className={cn(
                                "absolute inset-0 rounded-xl border-2 pointer-events-none",
                                method.color.replace('text-', 'border-')
                            )} />
                        )}
                    </button>
                );
            })}
        </div>
    );
};
