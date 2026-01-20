'use client';

import { createContext, useContext } from "react";
import type { Transaction, Settings, Category } from "@/lib/types";

export interface AppContextType {
  addTransaction: (
    transaction: Omit<Transaction, "id" | "date" | "created_at" | "user_id">,
    autoCategorize: boolean
  ) => Promise<void>;

  deleteTransaction: (id: number) => void;
  addCategory: (category: Omit<Category, "id" | "user_id" | "created_at">) => void;
  updateSettings: (settings: Partial<Settings>) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * ✅ Hook used by components
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
};
