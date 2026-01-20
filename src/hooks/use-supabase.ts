
'use client'

import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { getErrorMessage } from '@/lib/error'

const supabase = createClient()

const operatorMap: Record<string, string> = {
    eq: 'eq',
    neq: 'neq',
    gt: 'gt',
    gte: 'gte',
    lt: 'lt',
    lte: 'lte',
    like: 'like',
    ilike: 'ilike',
    is: 'is',
    in: 'in',
    cs: 'contains',
    cd: 'containedBy',
    ov: 'overlaps',
};

const parseValue = (operator: string, val: string) => {
    if (['in', 'cs', 'cd', 'ov'].includes(operator)) {
        // Handle {a,b,c} or (a,b,c) formats
        if ((val.startsWith('{') && val.endsWith('}')) || (val.startsWith('(') && val.endsWith(')'))) {
            return val.slice(1, -1).split(',').map(v => v.trim());
        }
    }
    return val;
};

const fetcher = async (query: string | null) => {
    if (!query) return [];
    const [table, rawParams] = query.split('?');
    const params = new URLSearchParams(rawParams);

    let queryBuilder = supabase.from(table).select(params.get('select') || '*');

    params.forEach((value, key) => {
        if (key === 'select' || key === 'order') return;

        const [postgrestOp, ...fieldValueParts] = value.split('.');
        const rawValue = fieldValueParts.join('.');

        const mappedMethod = operatorMap[postgrestOp];

        if (mappedMethod && rawValue !== undefined) {
            const actualValue = parseValue(postgrestOp, rawValue);
            // @ts-ignore
            queryBuilder = queryBuilder[mappedMethod](key, actualValue);
        } else {
            queryBuilder = queryBuilder.eq(key, value);
        }
    });

    if (params.has('order')) {
        const [field, direction] = params.get('order')!.split('.');
        queryBuilder = queryBuilder.order(field as any, { ascending: direction === 'asc' });
    }

    const { data, error } = await queryBuilder;

    if (error) {
        console.error("Supabase fetcher error:", error)
        toast.error("Data fetching error", { description: error.message })
        throw error
    }
    return data || [];
}


export function useCollection<T>(query: string | null) {
    const { data, error, mutate, isLoading } = useSWR<any>(query, () => fetcher(query), { revalidateOnFocus: true })
    return { data: (data as T[]) || [], error, mutate, isLoading }
}

export function useDoc<T>(query: string | null) {
    const { data: collectionData, error, mutate, isLoading } = useSWR<any>(query, () => fetcher(query), { revalidateOnFocus: true });

    const data = collectionData && (collectionData as any[]).length > 0 ? (collectionData[0] as T) : null;

    return { data, error, mutate, isLoading };
}

export const addDocument = async (table: string, document: any) => {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not authenticated");

    const documentWithUser = { ...document };

    // Only add user_id if it's not already there and if the table isn't 'groups'
    // (Groups use owner_id instead of user_id)
    if (table !== 'groups' && !documentWithUser.user_id) {
        documentWithUser.user_id = user.id;
    }

    if (table === 'groups') {
        documentWithUser.owner_id = user.id;
    }

    const { data, error } = await supabase
        .from(table)
        .insert(documentWithUser)
        .select()
        .single();

    if (error) {
        toast.error(`Failed to add to ${table}`, { description: getErrorMessage(error) });
        throw error;
    }
    return data;
};

export const updateDocument = async (table: string, id: string | number, updates: any) => {
    const { data, error } = await supabase
        .from(table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        toast.error(`Failed to update ${table}`, { description: getErrorMessage(error) });
        throw error;
    }
    return data;
};

export const deleteDocument = async (table: string, id: string | number) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (error) {
        toast.error("Failed to delete item", { description: getErrorMessage(error) })
        throw error
    }
    toast.success("Item deleted successfully")
}

export const setDocument = async (table: string, document: any) => {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from(table)
        .upsert({ ...document, user_id: user.id }, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) {
        toast.error(`Failed to save to ${table}`, { description: getErrorMessage(error) });
        throw error;
    }
    return data;
};
