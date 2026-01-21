
'use client';

import { addDocument, useCollection, useDoc } from '@/hooks/use-supabase';
import { useSupabase } from '@/lib/supabase/provider';
import { getCurrencySymbol } from '@/lib/currency';
import type { Group, GroupExpense, Settings } from '@/lib/types';
import {
  ArrowRight,
  Plus,
  Users,
  Activity,
  Mail,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/PageHeader';

const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 8).toUpperCase();


const getErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : 'Something went wrong';

const Groups = () => {
  const { session, supabase } = useSupabase();
  const user = session?.user;

  const [newGroupName, setNewGroupName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const {
    data: groups,
    isLoading: isLoadingGroups,
    mutate: mutateGroups,
  } = useCollection<Group>(
    user ? `groups?member_ids=cs.%7B${user.id}%7D&order=created_at.desc` : null
  );

  const { data: recentExpenses } = useCollection<GroupExpense>(
    user ? `group_expenses?order=created_at.desc&limit=5` : null,
  );


  const { data: settings } = useDoc<Settings>(
    user ? `settings?user_id=eq.${user.id}` : null,
  );

  const currencySymbol = useMemo(
    () => getCurrencySymbol(settings?.currency),
    [settings],
  );

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newGroupName.trim()) return;

    setIsCreating(true);
    const invite = generateInviteCode();

    try {
      const newGroup: Omit<Group, 'id' | 'created_at'> = {
        name: newGroupName.trim(),
        owner_id: user.id,
        member_ids: [user.id],
        invite_code: invite,
        members: [{
          uid: user.id,
          displayName: user.user_metadata.full_name || 'User',
          photoURL: user.user_metadata.avatar_url || ''
        }]
      };

      await addDocument('groups', newGroup);

      mutateGroups();
      setCreateDialogOpen(false);
      toast.success(`Group "${newGroupName.trim()}" created!`, {
        description: `Invite code: ${invite}`,
        action: {
          label: 'Copy',
          onClick: () => navigator.clipboard.writeText(invite),
        }
      });
      setNewGroupName('');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;

    setIsJoining(true);

    try {
      const { data: groupData, error } = await supabase
        .from('groups')
        .select('*')
        .eq('invite_code', inviteCode.trim().toUpperCase())
        .single();

      if (error || !groupData) {
        toast.error('Invalid invite code');
        setIsJoining(false);
        return;
      }

      if (groupData.member_ids.includes(user.id)) {
        toast.info('Already a member');
        setIsJoining(false);
        return;
      }

      const updatedMembers = [
        ...(groupData.members || []),
        {
          uid: user.id,
          displayName: user.user_metadata.full_name ?? 'Anonymous',
          photoURL: user.user_metadata.avatar_url ?? '',
        },
      ];

      const { error: updateError } = await supabase
        .from('groups')
        .update({
          member_ids: [...groupData.member_ids, user.id],
          members: updatedMembers
        })
        .eq('id', groupData.id);

      if (updateError) throw updateError;

      mutateGroups();
      toast.success(`Joined ${groupData.name}`);
      setJoinDialogOpen(false);
      setInviteCode('');
    } catch (err) {
      console.error('Join group error:', err);
      toast.error(getErrorMessage(err));
    } finally {
      setIsJoining(false);
    }
  };

  const recentExpensesWithGroupNames = useMemo(() => {
    if (!recentExpenses || !groups) return [];
    const groupMap = new Map(groups.map(g => [g.id, g.name]));
    return recentExpenses
      .filter(expense => groupMap.has(expense.group_id))
      .map(expense => ({
        ...expense,
        groupName: groupMap.get(expense.group_id) || 'Unknown Group'
      }));
  }, [recentExpenses, groups]);


  return (
    <>
      <PageHeader
        title="Groups"
        subtitle="Create and manage your personal groups"
      />

      <div className="flex justify-center gap-4 mb-20">
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-12 px-8 text-base">
              <Plus className="mr-2 h-5 w-5" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Give your new group a name to get started.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="e.g., Flatmates, Trip to Bali"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  disabled={isCreating}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isCreating || !newGroupName.trim()}
              >
                {isCreating ? 'Creating...' : 'Create Group'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={joinDialogOpen} onOpenChange={setJoinDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base">
              Join Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Join a Group</DialogTitle>
              <DialogDescription>
                Enter an invite code to join an existing group.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invite-code">Invite Code</Label>
                <Input
                  id="invite-code"
                  placeholder="Enter 6-character code"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  disabled={isJoining}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isJoining || !inviteCode.trim()}
              >
                {isJoining ? 'Joining...' : 'Join Group'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2.2fr_1fr] gap-16 items-start">
        <div className="space-y-6">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-4 tracking-wider">
            YOUR GROUPS
          </h2>
          {isLoadingGroups ? (
            <div className="text-center py-10 text-muted-foreground">
              Loading groups...
            </div>
          ) : (groups?.length ?? 0) === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[260px] rounded-xl border border-dashed bg-muted/30">
              <Users className="h-14 w-14 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No groups yet</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs text-center">
                Create a group to start tracking shared expenses with friends.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {groups?.map((group) => (
                <Card
                  key={group.id}
                  className="rounded-2xl border hover:border-primary/40 transition-all"
                >
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-4 rounded-xl">
                      <Users className="h-8 w-8" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="text-lg font-semibold leading-none">
                        {group.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {group.members?.length ?? 0} members
                      </p>
                    </div>
                    <Link href={`/dashboard/groups/${group.id}`} passHref>
                      <Button variant="outline" size="default">
                        Open
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-8 sticky top-24">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground mb-4 tracking-wider">
            STATS & ACTIVITY
          </h2>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">
                Your Groups
              </p>
              <p className="font-bold text-2xl">{groups?.length ?? 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentExpensesWithGroupNames.length > 0 ? (
                recentExpensesWithGroupNames.map((expense) => {
                  const isNetCredit =
                    expense.paid_by === user?.id &&
                    expense.split_between.length > 1;

                  return (
                    <div
                      key={expense.id}
                      className="flex items-center gap-4 text-sm"
                    >
                      {isNetCredit ? (
                        <TrendingUp className="h-5 w-5 text-success" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-destructive" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium truncate">{expense.title}</p>
                        <p className="text-xs text-muted-foreground">
                          in {expense.groupName}
                        </p>
                      </div>
                      <div className={`font-semibold`}>
                        {currencySymbol}
                        {expense.amount.toFixed(2)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-sm text-muted-foreground py-12 flex flex-col items-center justify-center">
                  <Activity className="h-8 w-8 mx-auto mb-3 text-muted-foreground/70" />
                  <p>No recent group activity.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Invites</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground py-12 flex flex-col items-center justify-center">
              <Mail className="h-8 w-8 mx-auto mb-3 text-muted-foreground/70" />
              <p>No pending invites.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Groups;
