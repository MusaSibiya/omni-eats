'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';

export default function AdminSearch({ placeholder = 'Search...' }: { placeholder?: string }) {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        const params = new URLSearchParams(searchParams.toString());
        if (term) {
            params.set('query', term);
        } else {
            params.delete('query');
        }

        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', position: 'relative' }}>
            <svg 
                width="18" 
                height="18" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ position: 'absolute', left: '12px', color: '#6b7280' }}
            >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '10px 12px 10px 40px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #e5e7eb)',
                    background: 'var(--surface-primary, #ffffff)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.2s'
                }}
            />
            {isPending && <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: '#6b7280' }}>Searching...</span>}
        </div>
    );
}
