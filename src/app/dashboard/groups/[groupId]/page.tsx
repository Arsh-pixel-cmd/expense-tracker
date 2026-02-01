
'use client';

import {
  useCollection,
  useDoc,
} from '@/hooks/use-supabase';
import { useSupabase } from '@/lib/supabase/provider';
import { getCurrencySymbol, CurrencyIcon, convertAmount } from '@/lib/currency';
import type { Group, GroupExpense, Settings } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeft, Copy, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AddGroupExpenseDialog } from '@/components/AddGroupExpenseDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/PageHeader';



const GroupDetail = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const { session, supabase } = useSupabase();
  const user = session?.user;
  const router = useRouter();

  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const { data: group, isLoading } = useDoc<Group>(
    groupId ? `groups?id=eq.${groupId}` : null
  );

  const { data: expenses } = useCollection<GroupExpense>(
    groupId ? `group_expenses?group_id=eq.${groupId}&order=created_at.desc` : null
  );

  const { data: settings } = useDoc<Settings>(
    user ? `settings?user_id=eq.${user.id}` : null
  );

  const currencySymbol = useMemo(
    () => getCurrencySymbol(settings?.currency),
    [settings]
  );

  const balances = useMemo(() => {
    if (!group?.member_ids || !expenses) return {};

    const result: Record<string, number> = {};

    group.member_ids.forEach((uid) => {
      result[uid] = 0;
    });

    expenses.forEach((exp) => {
      if (!exp.split_between?.length) return;

      const share = exp.amount / exp.split_between.length;

      exp.split_between.forEach((uid) => {
        result[uid] -= share;
      });

      result[exp.paid_by] += exp.amount;
    });

    return result;
  }, [group, expenses]);

  const isOwner = user && group && user.id === group.owner_id;

  const handleDeleteGroup = async () => {
    if (!isOwner || !group) return;

    try {
      const { error } = await supabase.from('groups').delete().eq('id', group.id);
      if (error) throw error;
      toast.success(`Group "${group.name}" deleted`);
      router.push('/dashboard/groups');
    } catch {
      toast.error('Failed to delete group');
    }
  };

  const handleCopyInviteCode = () => {
    if (!group?.invite_code) return;
    navigator.clipboard.writeText(group.invite_code);
    toast.success('Invite code copied');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-10">
        <PageHeader title="Group Not Found" />
        <Button asChild>
          <Link href="/dashboard/groups">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Groups
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <AddGroupExpenseDialog
        isOpen={isExpenseDialogOpen}
        setIsOpen={setIsExpenseDialogOpen}
        group={group}
      />

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/groups">
              <ChevronLeft className="h-6 w-6" />
            </Link>
          </Button>
          <PageHeader
            title={group.name}
            subtitle={`${group.members?.length || 1} member(s)`}
          />
        </div>
        <Button onClick={() => setIsExpenseDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Balances</CardTitle>
              <CardDescription>Who owes and who gets money</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {group.members && group.members.length > 0 && group.members.map((member: any) => {
                const balance = balances[member.uid] || 0;
                const settled = Math.abs(balance) < 1;

                return (
                  <div
                    key={member.uid}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.photoURL} />
                        <AvatarFallback>
                          {member.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-semibold">
                          {member.displayName}
                          {member.uid === user?.id && ' (You)'}
                        </p>
                        <p
                          className={`text-xs ${settled
                            ? 'text-muted-foreground'
                            : balance > 0
                              ? 'text-success'
                              : 'text-destructive'
                            }`}
                        >
                          {settled
                            ? 'Settled'
                            : balance > 0
                              ? `Gets back ${currencySymbol}${convertAmount(balance, 'USD', settings?.currency || 'USD').toFixed(2)}`
                              : `Has to pay ${currencySymbol}${convertAmount(Math.abs(balance), 'USD', settings?.currency || 'USD').toFixed(2)}`}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`font-bold flex items-center ${balance > 0 ? 'text-success' : 'text-destructive'
                        }`}
                    >
                      {settled ? (
                        <>
                          <CurrencyIcon currency={settings?.currency} className="h-4 w-4 mr-1" />
                          0.00
                        </>
                      ) : (
                        <>
                          {balance > 0 ? '+' : '-'}
                          <CurrencyIcon currency={settings?.currency} className="h-4 w-4 mx-1" />
                          {convertAmount(Math.abs(balance), 'USD', settings?.currency || 'USD').toFixed(2)}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Group Expenses</CardTitle>
              <CardDescription>Latest expenses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {expenses?.length ? (
                expenses.map((exp) => {
                  const payer = group.members?.find(
                    (m: any) => m.uid === exp.paid_by
                  );
                  const date = formatDistanceToNow(
                    new Date(exp.created_at),
                    { addSuffix: true }
                  );

                  return (
                    <div
                      key={exp.id}
                      className="flex justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{exp.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Paid by {(payer as any)?.displayName} • {date}
                        </p>
                      </div>
                      <div className="font-semibold flex items-center">
                        <CurrencyIcon currency={settings?.currency} className="h-4 w-4 mr-1" />
                        {convertAmount(exp.amount, 'USD', settings?.currency || 'USD').toFixed(2)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  No expenses yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Invite Code</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Input readOnly value={group.invite_code} />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyInviteCode}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="border-destructive">
              <CardContent className='pt-6'>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Group
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this group?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteGroup}
                        className="bg-destructive"
                      >
                        Yes, delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div >
    </>
  );
};

export default GroupDetail;
