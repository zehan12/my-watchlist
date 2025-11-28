'use client';

import { useState } from 'react';
import WatchEntryForm from './WatchEntryForm';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function AddEntryButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 p-0"
            >
                <Plus className="h-6 w-6" />
            </Button>
            <WatchEntryForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
