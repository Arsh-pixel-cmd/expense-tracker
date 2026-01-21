
export interface Transaction {
  id: number;
  created_at: string;
  user_id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  status: "completed" | "pending";
  type: "credit" | "debit";
  note?: string;
  groupId?: string;
  groupExpenseId?: string;
  payment_method?: string;
}

export interface Category {
  id: number;
  created_at: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  bg_color: string;
  groups: string[];
}

export interface Budget {
  id?: string;
  categoryName: string;
  amount: number;
  spent?: number;
}

export type BudgetSettings = {
  budgets: Record<string, number>;
};

export interface Settings {
  user_id: string;
  notifications: boolean;
  dark_mode: boolean;
  auto_categ: boolean;
  language: string;
  currency: "USD" | "EUR" | "GBP" | "INR";
}

export interface GroupMember {
  uid: string;
  displayName: string;
  photoURL: string;
}

export interface Group {
  id: string;
  created_at: string;
  name: string;
  owner_id: string;
  member_ids: string[];
  members: GroupMember[];
  invite_code: string;
}

export interface GroupExpense {
  id: string;
  created_at: string;
  group_id: string;
  title: string;
  amount: number;
  paid_by: string;
  split_between: string[];
  groupName?: string;
}
