import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: '/login',
        newUser: '/register',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const role = auth?.user?.role;

            const isOnDashboard = nextUrl.pathname.startsWith('/orders');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnRestaurantDashboard = nextUrl.pathname.startsWith('/restaurant-dashboard');
            const isOnDriverDashboard = nextUrl.pathname.startsWith('/driver-dashboard');
            const isOnCheckout = nextUrl.pathname.startsWith('/checkout');

            // Admin routes - only for ADMIN role
            if (isOnAdmin) {
                if (isLoggedIn && auth?.user?.role === 'ADMIN') return true;
                return Response.redirect(new URL('/', nextUrl)); // Redirect non-admins to home
            }

            // Restaurant dashboard - for RESTAURANT_OWNER and ADMIN roles
            if (isOnRestaurantDashboard) {
                if (isLoggedIn && (auth?.user?.role === 'RESTAURANT_OWNER' || auth?.user?.role === 'ADMIN')) {
                    return true;
                }
                return Response.redirect(new URL('/', nextUrl)); // Redirect unauthorized users
            }

            // Driver dashboard - only for DRIVER and ADMIN roles
            if (isOnDriverDashboard) {
                if (isLoggedIn && (auth?.user?.role === 'DRIVER' || auth?.user?.role === 'ADMIN')) return true;
                return Response.redirect(new URL('/', nextUrl));
            }

            // Protected user routes
            if (isOnDashboard || isOnCheckout) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }

            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            // Handle manual session updates
            if (trigger === 'update' && session?.role) {
                token.role = session.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    providers: [], // Add providers with an empty array for now
    debug: true,
    trustHost: true,
    session: { strategy: 'jwt' },
    secret: process.env.AUTH_SECRET,
};
