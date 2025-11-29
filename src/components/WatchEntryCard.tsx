'use client';

import { useState } from 'react';
import Image from 'next/image';
import { IWatchEntry } from '@/types/WatchEntry';
import { useDeleteEntry } from '@/hooks/useWatchHistory';
import WatchEntryForm from './WatchEntryForm';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

export default function WatchEntryCard({ entry }: { entry: IWatchEntry }) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const deleteEntry = useDeleteEntry();

    const handleDelete = async () => {
        if (entry._id) {
            console.log('Confirmed delete for ID:', entry._id);
            await deleteEntry.mutateAsync(entry._id);
            setIsDeleteOpen(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500/20 text-green-400 hover:bg-green-500/30';
            case 'watching': return 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30';
            case 'plan_to_watch': return 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30';
            case 'dropped': return 'bg-red-500/20 text-red-400 hover:bg-red-500/30';
            default: return 'bg-zinc-500/20 text-zinc-400 hover:bg-zinc-500/30';
        }
    };

    return (
        <>
            <div className="group relative aspect-2/3 bg-zinc-900 rounded-xl overflow-hidden shadow-lg transition-transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/20">
                {entry.posterPath ? (
                    <Image
                        src={`https://image.tmdb.org/t/p/w500${entry.posterPath}`}
                        alt={entry.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-zinc-600 p-4 text-center text-sm">
                        {entry.title}
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-2 left-2 z-10">
                    <Badge className={`${getStatusColor(entry.status)} border-0 backdrop-blur-sm`}>
                        {entry.status.replace(/_/g, ' ')}
                    </Badge>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end">
                    <div className="absolute top-2 right-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-100">
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsEditOpen(true); }} className="hover:bg-zinc-800 cursor-pointer">
                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsDeleteOpen(true); }} className="text-red-400 hover:bg-red-900/20 hover:text-red-300 cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <h4 className="font-bold text-white text-sm leading-tight mb-1 pr-6">
                        {entry.title}
                    </h4>
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                            <span className="capitalize">{entry.mediaType}</span>
                            {entry.rating && (
                                <span className="flex items-center gap-1 text-yellow-400">
                                    ★ {entry.rating}
                                </span>
                            )}
                        </div>
                        {entry.mediaType === 'tv' && (entry.progress || entry.totalEpisodes) && (
                            <div className="text-xs text-zinc-400">
                                Ep: {entry.progress || 0} {entry.totalEpisodes ? `/ ${entry.totalEpisodes}` : ''}
                            </div>
                        )}
                        <div className="text-xs text-zinc-500">
                            {new Date(entry.watchedAt).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            <WatchEntryForm
                initialData={entry}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="bg-zinc-950 border-zinc-800 text-zinc-100">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                            This action cannot be undone. This will permanently delete the entry for
                            <span className="font-bold text-white"> {entry.title}</span>.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white border-0">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
