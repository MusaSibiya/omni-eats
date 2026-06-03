import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Return success even if user not found for security
            return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' });
        }

        // Generate token
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: { email },
            data: {
                resetToken: token,
                resetTokenExpiry: expiry,
            },
        });

        // Send actual email
        await sendPasswordResetEmail(email, token);

        return NextResponse.json({ message: 'Reset link sent successfully.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
