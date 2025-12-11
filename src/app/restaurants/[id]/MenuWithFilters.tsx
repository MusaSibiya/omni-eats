'use client';

import { useState } from 'react';
import { MenuItemCard } from '@/components/features/MenuItemCard';
import styles from './page.module.css';

interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    category: string | null;
    imageUrl: string | null;
    restaurantId?: string;
}

interface MenuWithFiltersProps {
    menuItems: MenuItem[];
}

export function MenuWithFilters({ menuItems }: MenuWithFiltersProps) {
    const [categorySearches, setCategorySearches] = useState<Record<string, string>>({});
    const [selectedCategories, setSelectedCategories] = useState<string[]>([
        'Starters', 'Mains', 'Desserts', 'Sides', 'Drinks'
    ]);
    const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
    const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
    const [showFilters, setShowFilters] = useState(true);

    const updateCategorySearch = (category: string, query: string) => {
        setCategorySearches(prev => ({
            ...prev,
            [category]: query
        }));
    };

    // Group menu items by category
    const categoriesMap = new Map<string, MenuItem[]>();

    menuItems.forEach((item) => {
        const category = item.category || 'Other';
        if (!categoriesMap.has(category)) {
            categoriesMap.set(category, []);
        }
        categoriesMap.get(category)?.push(item);
    });

    const categories = Array.from(categoriesMap.entries()).map(([name, items]) => ({
        name,
        items,
    }));

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const toggleDietary = (dietary: string) => {
        setSelectedDietary(prev =>
            prev.includes(dietary)
                ? prev.filter(d => d !== dietary)
                : [...prev, dietary]
        );
    };

    const togglePriceRange = (range: string) => {
        setSelectedPriceRanges(prev =>
            prev.includes(range)
                ? prev.filter(r => r !== range)
                : [...prev, range]
        );
    };

    // Filter items based on all selected filters
    const filterItems = (items: MenuItem[], category: string) => {
        return items.filter(item => {
            // Category-specific search filter
            const searchQuery = categorySearches[category] || '';
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesSearch =
                    item.name.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query);
                if (!matchesSearch) return false;
            }

            // Dietary filter (placeholder - would need item tags in DB)
            if (selectedDietary.length > 0) {
                // TODO: Add dietary tags to menu items in database
                // For now, we'll skip dietary filtering
            }

            // Price range filter
            if (selectedPriceRanges.length > 0) {
                const price = item.price;
                const matchesPrice = selectedPriceRanges.some(range => {
                    if (range === 'Under R50') return price < 50;
                    if (range === 'R50 - R100') return price >= 50 && price <= 100;
                    if (range === 'Over R100') return price > 100;
                    return true;
                });
                if (!matchesPrice) return false;
            }

            return true;
        });
    };

    const filteredCategories = categories
        .filter(cat => selectedCategories.includes(cat.name))
        .map(cat => ({
            ...cat,
            items: filterItems(cat.items, cat.name)
        }))
        .filter(cat => cat.items.length > 0);

    return (
        <div className={styles.menuContainer}>
            {/* Filter Sidebar */}
            <div className={styles.filterSidebar}>
                <button
                    className={styles.filterToggle}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="4" y1="12" x2="20" y2="12"></line>
                        <line x1="4" y1="18" x2="16" y2="18"></line>
                    </svg>
                    {showFilters ? 'Hide Filters' : 'Show Filters'}
                </button>

                {showFilters && (
                    <div className={styles.filterContent}>
                        <h3 className={styles.filterTitle}>Categories</h3>
                        <div className={styles.filterOptions}>
                            {['Starters', 'Mains', 'Desserts', 'Sides', 'Drinks'].map((category) => {
                                const hasItems = categories.some(cat => cat.name === category);
                                return (
                                    <label key={category} className={styles.filterOption}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => toggleCategory(category)}
                                            className={styles.filterCheckbox}
                                            disabled={!hasItems}
                                        />
                                        <span className={`${styles.filterLabel} ${!hasItems ? styles.disabled : ''}`}>
                                            {category}
                                            {hasItems && ` (${categoriesMap.get(category)?.length || 0})`}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        {/* Additional Filters Section */}
                        <div className={styles.filterDivider}></div>

                        <h3 className={styles.filterTitle}>Dietary</h3>
                        <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    className={styles.filterCheckbox}
                                    checked={selectedDietary.includes('Vegetarian')}
                                    onChange={() => toggleDietary('Vegetarian')}
                                />
                                <span className={styles.filterLabel}>Vegetarian</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    className={styles.filterCheckbox}
                                    checked={selectedDietary.includes('Vegan')}
                                    onChange={() => toggleDietary('Vegan')}
                                />
                                <span className={styles.filterLabel}>Vegan</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    className={styles.filterCheckbox}
                                    checked={selectedDietary.includes('Gluten-Free')}
                                    onChange={() => toggleDietary('Gluten-Free')}
                                />
                                <span className={styles.filterLabel}>Gluten-Free</span>
                            </label>
                        </div>

                        <div className={styles.filterDivider}></div>

                        <h3 className={styles.filterTitle}>Price Range</h3>
                        <div className={styles.filterOptions}>
                            <label className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    className={styles.filterCheckbox}
                                    checked={selectedPriceRanges.includes('Under R50')}
                                    onChange={() => togglePriceRange('Under R50')}
                                />
                                <span className={styles.filterLabel}>Under R50</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    className={styles.filterCheckbox}
                                    checked={selectedPriceRanges.includes('R50 - R100')}
                                    onChange={() => togglePriceRange('R50 - R100')}
                                />
                                <span className={styles.filterLabel}>R50 - R100</span>
                            </label>
                            <label className={styles.filterOption}>
                                <input
                                    type="checkbox"
                                    className={styles.filterCheckbox}
                                    checked={selectedPriceRanges.includes('Over R100')}
                                    onChange={() => togglePriceRange('Over R100')}
                                />
                                <span className={styles.filterLabel}>Over R100</span>
                            </label>
                        </div>
                    </div>
                )}
            </div>

            {/* Menu Content */}
            <div className={styles.menuContent}>
                {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                        <section key={cat.name} id={`category-${cat.name}`}>
                            <div className={styles.categoryHeader}>
                                <h2 className={styles.categoryTitle}>{cat.name}</h2>
                                <div className={styles.categorySearch}>
                                    <svg className={styles.categorySearchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <path d="m21 21-4.35-4.35"></path>
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder={`Search ${cat.name}...`}
                                        value={categorySearches[cat.name] || ''}
                                        onChange={(e) => updateCategorySearch(cat.name, e.target.value)}
                                        className={styles.categorySearchInput}
                                    />
                                    {categorySearches[cat.name] && (
                                        <button
                                            className={styles.categoryClearSearch}
                                            onClick={() => updateCategorySearch(cat.name, '')}
                                            aria-label="Clear search"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className={styles.itemsGrid}>
                                {cat.items.map((item) => (
                                    <MenuItemCard
                                        key={item.id}
                                        item={{ ...item, price: Number(item.price) }}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className={styles.noResults}>
                        <p>No menu items match your filters</p>
                        <button
                            onClick={() => setSelectedCategories(['Starters', 'Mains', 'Desserts', 'Sides', 'Drinks'])}
                            className={styles.resetBtn}
                        >
                            Reset Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
