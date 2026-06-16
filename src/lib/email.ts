import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
    const resetUrl = `${process.env.NEXT_PUBLIC_URL}/reset-password?token=${token}`;

    try {
        await resend.emails.send({
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
