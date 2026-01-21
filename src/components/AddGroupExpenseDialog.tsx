'use client';
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Group } from "@/lib/types";
import { useSupabase } from "@/lib/supabase/provider";
import { formatDate } from "@/lib/utils";

interface AddGroupExpenseDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  group: Group;
}

export const AddGroupExpenseDialog = ({
  isOpen,
  setIsOpen,
  group,
}: AddGroupExpenseDialogProps) => {
  const { session, supabase } = useSupabase();
  const user = session?.user;
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !group.id) return;

    const numericAmount = Number(amount);
    if (!title.trim() || numericAmount <= 0) {
      toast.error("Invalid title or amount");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare splits for RPC
      const shareAmount = numericAmount / group.member_ids.length;
      const splits = group.member_ids.map(memberId => ({
        user_id: memberId,
        amount: shareAmount,
        category: "Group Expense",
        date: formatDate(new Date()),
        merchant: `${title.trim()} (${group.name})`,
        type: memberId === user.id ? "credit" : "debit",
        note: memberId === user.id
          ? "You paid a group expense"
          : `Your share paid by ${user.user_metadata.full_name || "member"}`
      }));

      const { data, error } = await supabase.rpc('add_group_expense', {
        p_title: title.trim(),
        p_amount: numericAmount,
        p_paid_by: user.id,
        p_group_id: group.id,
        p_splits: splits
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.message || "Failed to add expense");
      }

      toast.success("Group expense added");
      setIsOpen(false);
      setTitle("");
      setAmount("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Split equally among all members
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddExpense} className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              Add
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
