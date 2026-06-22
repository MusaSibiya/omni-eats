import React, { Suspense } from 'react';
import RegisterClient from './RegisterClient';

export default function RegisterPage() {
    return (
        <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>}>
            <RegisterClient />
        </Suspense>
    );
}
