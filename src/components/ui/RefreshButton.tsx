'use client';

import { useRouter } from 'next/navigation';

export function RefreshButton({ className }: { className?: string }) {
    const router = useRouter();

    return (
        <button onClick={() => router.refresh()} className={className}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Refresh
        </button>
    );
}
