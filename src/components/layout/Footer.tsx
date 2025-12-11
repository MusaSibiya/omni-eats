import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.grid}>
                    {/* Brand Column */}
                    <div className={styles.brandCol}>
                        <div className={styles.logo}>
                            OMNI <span>EATS</span>
                        </div>
                        <p className={styles.tagline}>
                            Experience the future of dining. Premium food delivery for the modern connoisseur.
                        </p>
                    </div>

                    {/* Links Column 1 */}
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Discover</h4>
                        <nav className={styles.links}>
                            <Link href="/restaurants" className={styles.link}>Restaurants</Link>
                            <Link href="/cuisines" className={styles.link}>Cuisines</Link>
                            <Link href="/chefs" className={styles.link}>Featured Chefs</Link>
                            <Link href="/deals" className={styles.link}>Exclusive Deals</Link>
                        </nav>
                    </div>

                    {/* Links Column 2 */}
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Company</h4>
                        <nav className={styles.links}>
                            <Link href="/about" className={styles.link}>About Us</Link>
                            <Link href="/careers" className={styles.link}>Careers</Link>
                            <Link href="/partners" className={styles.link}>For Partners</Link>
                            <Link href="/contact" className={styles.link}>Contact</Link>
                        </nav>
                    </div>

                    {/* Links Column 3 */}
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Legal</h4>
                        <nav className={styles.links}>
                            <Link href="/terms" className={styles.link}>Terms of Service</Link>
                            <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
                            <Link href="/cookies" className={styles.link}>Cookie Policy</Link>
                        </nav>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} Omni Eats. All rights reserved.</p>
                    <div className={styles.socials}>
                        <a href="#" className={styles.socialIcon} aria-label="Twitter">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                        </a>
                        <a href="#" className={styles.socialIcon} aria-label="Instagram">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                        <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};
