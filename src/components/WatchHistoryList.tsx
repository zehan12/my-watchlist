'use client';

import { useState, useMemo } from 'react';
import { WatchEntry } from '@/db';
import WatchEntryCard from '@/components/WatchEntryCard';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface WatchHistoryListProps {
    initialHistory: WatchEntry[];
}

export default function WatchHistoryList({ initialHistory }: WatchHistoryListProps) {
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [yearFilter, setYearFilter] = useState<string>('all');

    // Extract available years from history
    const availableYears = useMemo(() => {
        const years = new Set(initialHistory.map(entry => new Date(entry.watchedAt).getFullYear()));
        return Array.from(years).sort((a, b) => b - a);
    }, [initialHistory]);

    // Filter and Group History
    const { sortedYears, groupedHistory } = useMemo(() => {
        let filtered = initialHistory;

        if (statusFilter !== 'all') {
            filtered = filtered.filter(entry => entry.status === statusFilter);
        }

        if (yearFilter !== 'all') {
            const year = parseInt(yearFilter);
            filtered = filtered.filter(entry => new Date(entry.watchedAt).getFullYear() === year);
        }

        const grouped = filtered.reduce((acc, entry) => {
            const date = new Date(entry.watchedAt);
            const year = date.getFullYear();
            const month = date.toLocaleString('default', { month: 'long' });

            if (!acc[year]) acc[year] = {};
            if (!acc[year][month]) acc[year][month] = [];

            acc[year][month].push(entry);
            return acc;
        }, {} as Record<number, Record<string, WatchEntry[]>>);

        const years = Object.keys(grouped)
            .map(Number)
            .sort((a, b) => b - a);

        return { sortedYears: years, groupedHistory: grouped };
    }, [initialHistory, statusFilter, yearFilter]);

    return (
        <div className="space-y-8">
            {/* Filters */}
            <div className="flex gap-4 mb-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
                <div className="w-48">
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block uppercase tracking-wider">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="watching">Watching</SelectItem>
                            <SelectItem value="plan_to_watch">Plan to Watch</SelectItem>
                            <SelectItem value="dropped">Dropped</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-48">
                    <label className="text-xs text-zinc-500 font-medium mb-1.5 block uppercase tracking-wider">Year</label>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="bg-zinc-900 border-zinc-700 text-zinc-200">
                            <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-zinc-700 text-zinc-200">
                            <SelectItem value="all">All Years</SelectItem>
                            {availableYears.map(year => (
                                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List */}
            {initialHistory.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    <p className="text-xl">No movies or series tracked yet.</p>
                    <p className="mt-2">Click the + button to add your first watch!</p>
                </div>
            ) : sortedYears.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">
                    <p className="text-xl">No entries match your filters.</p>
                </div>
            ) : (
                <div className="space-y-16">
                    {sortedYears.map((year) => (
                        <div key={year}>
                            <h2 className="text-3xl font-bold text-zinc-700 mb-8 border-b border-zinc-800 pb-2">
                                {year}
                            </h2>
                            <div className="space-y-12">
                                {Object.entries(groupedHistory[year]).map(([month, entries]) => (
                                    <div key={month}>
                                        <h3 className="text-xl font-semibold text-zinc-400 mb-4 pl-2 border-l-4 border-blue-600">
                                            {month}
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                            {entries.map((entry) => (
                                                <WatchEntryCard key={entry.id} entry={entry} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
