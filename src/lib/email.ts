import { Resend } from 'resend';

// Lazy initialization - only create Resend instance when needed
let resend: Resend | null = null;

function getResend() {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
}

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}`;

    try {
        const resendInstance = getResend();
        if (!resendInstance) {
            console.warn('Resend API key missing, skipping email send');
            return { success: false, error: 'Email service not configured' };
        }

        await resendInstance.emails.send({
            from: 'Sotobe Eats <onboarding@resend.dev>',
            to: email,
            subject: 'Reset your password',
            html: `
                <h1>Password Reset</h1>
                <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
                <a href="${resetUrl}">Reset Password</a>
                <p>If you did not request this, please ignore this email.</p>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error('Email sending failed:', error);
        return { success: false, error };
    }
}
