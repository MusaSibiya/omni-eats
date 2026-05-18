import { prisma } from './prisma';

/**
 * Check if a user is a restaurant owner
 */
export async function isRestaurantOwner(userId: string, restaurantId: string): Promise<boolean> {
    const restaurant = await prisma.restaurant.findUnique({
        where: { id: restaurantId },
        select: { ownerId: true }
    });

    return restaurant?.ownerId === userId;
}

/**
 * Check if a user can manage a restaurant (owner or admin)
 */
export async function canManageRestaurant(userId: string, restaurantId: string, userRole: string): Promise<boolean> {
    if (userRole === 'ADMIN') {
        return true;
    }

    return await isRestaurantOwner(userId, restaurantId);
}

/**
 * Check if a user can manage an order (restaurant owner of the ordered items or admin)
 */
export async function canManageOrder(userId: string, orderId: string, userRole: string): Promise<boolean> {
    if (userRole === 'ADMIN') {
        return true;
    }

    // Get the order with its items and restaurant info
    const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
            items: {
                include: {
                    menuItem: {
                        include: {
                            restaurant: {
                                select: { ownerId: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!order) {
        return false;
    }

    // Check if user owns any of the restaurants for the ordered items
    const restaurantOwnerIds = order.items.map(item => item.menuItem.restaurant.ownerId);
    return restaurantOwnerIds.includes(userId);
}

/**
 * Get all restaurants owned by a user
 */
export async function getUserRestaurants(userId: string) {
    return await prisma.restaurant.findMany({
        where: { ownerId: userId },
        include: {
            menuItems: true,
            _count: {
                select: {
                    reviews: true,
                    favorites: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

/**
 * Check if user has a specific role
 */
export function hasRole(userRole: string, requiredRole: string | string[]): boolean {
    if (Array.isArray(requiredRole)) {
        return requiredRole.includes(userRole);
    }
    return userRole === requiredRole;
}
