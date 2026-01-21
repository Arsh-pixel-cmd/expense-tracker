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
    pizza: "Food",
    burger: "Food",
    cafe: "Food",
    coffee: "Food",
    grocery: "Groceries",
    mart: "Groceries",
    market: "Groceries",
    amazon: "Shopping",
    flipkart: "Shopping",
    myntra: "Shopping",
    zara: "Shopping",
    cloth: "Shopping",
    electricity: "Utilities",
    power: "Utilities",
    bill: "Utilities",
    water: "Utilities",
    gas: "Utilities",
    recharge: "Utilities",
    wifi: "Utilities",
    rent: "Rent",
    uber: "Transport",
    ola: "Transport",
    taxi: "Transport",
    cab: "Transport",
    fuel: "Fuel",
    petrol: "Fuel",
    diesel: "Fuel",
    pump: "Fuel",
    movie: "Entertainment",
    cinema: "Entertainment",
    netflix: "Entertainment",
    spotify: "Entertainment",
    prime: "Entertainment",
    gym: "Health",
    fitness: "Health",
    doctor: "Health",
    medicine: "Health",
    salary: "Income",
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
