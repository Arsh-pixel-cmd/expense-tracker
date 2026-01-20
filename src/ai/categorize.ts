import type { Category } from "@/lib/types";

/**
 * Simple AI-like categorization with safety.
 * Can be replaced later with real API (OpenAI, Gemini, etc.)
 */
export async function autoCategorizeExpense(
  merchant: string,
  categories: Category[]
): Promise<string> {
  const text = (merchant ?? "").toLowerCase();

  // 🚑 HARD SAFETY
  if (!text) return "Others";

  // 🔹 RULE-BASED (FAST + FREE)
  const rules: Record<string, string> = {
    food: "Food",
    restaurant: "Food",
    mcdonald: "Food",
    kfc: "Food",
    grocery: "Groceries",
    amazon: "Shopping",
    flipkart: "Shopping",
    electricity: "Utilities",
    power: "Utilities",
    rent: "Rent",
    uber: "Transport",
    ola: "Transport",
    fuel: "Fuel",
    petrol: "Fuel",
  };

  for (const keyword in rules) {
    if (text.includes(keyword)) {
      return rules[keyword];
    }
  }

  // 🔹 MATCH EXISTING CATEGORIES (AI-like)
  for (const cat of categories ?? []) {
    if ((cat.name ?? "").toLowerCase().includes(text)) {
      return cat.name;
    }
  }

  // 🔹 FALLBACK
  return "Others";
}
