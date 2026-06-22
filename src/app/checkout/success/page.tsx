import React, { Suspense } from 'react';
import CheckoutSuccessClient from './CheckoutSuccessClient';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ padding: '4rem', textAlign: 'center' }}>Loading...</div>}>
      <CheckoutSuccessClient />
    </Suspense>
  );
}
