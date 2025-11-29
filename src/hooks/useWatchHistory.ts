'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IWatchEntry } from '@/types/WatchEntry';

async function fetchWatchHistory(): Promise<IWatchEntry[]> {
    const res = await fetch('/api/entries');
    if (!res.ok) {
        throw new Error('Failed to fetch watch history');
    }
    return res.json();
}

export function useWatchHistory() {
    return useQuery({
        queryKey: ['watchHistory'],
        queryFn: fetchWatchHistory,
    });
}

export function useAddEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => {
            // We can call the server action directly or via API
            // Since we have server actions, let's use them if possible, 
            // but mixing server actions and client-side query cache requires manual invalidation.
            // Let's import the server action dynamically or pass it?
            // Actually, we can just call the server action function here if it's imported.
            // But we can't import server actions into this client-side hook file easily if it's not 'use client' (it is not marked yet).
            // Let's mark this file 'use client'.
            const { addWatchEntry } = await import('@/app/actions');
            return addWatchEntry(data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
        },
    });
}

export function useUpdateEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { updateWatchEntry } = await import('@/app/actions');
            return updateWatchEntry(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
        },
    });
}

export function useDeleteEntry() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const { deleteWatchEntry } = await import('@/app/actions');
            return deleteWatchEntry(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['watchHistory'] });
        },
    });
}
