'use client';

import { useState } from 'react';
import { createReview } from '@/lib/reviewActions';
import styles from './ReviewForm.module.css';

interface ReviewFormProps {
    restaurantId: string;
}

export function ReviewForm({ restaurantId }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage('');

        const formData = new FormData(e.currentTarget);
        const result = await createReview(restaurantId, formData);

        if (result.error) {
            setMessage(result.error);
        } else {
            setMessage('Review submitted successfully!');
            // Safely reset form
            const form = e.currentTarget;
            if (form) {
                form.reset();
            }
            setRating(0);
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.title}>Write a Review</h3>

            <div className={styles.ratingSection}>
                <label>Your Rating</label>
                <div className={styles.stars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            className={`${styles.star} ${star <= (hoveredRating || rating) ? styles.filled : ''
                                }`}
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoveredRating(star)}
                            onMouseLeave={() => setHoveredRating(0)}
                        >
                            ★
                        </button>
                    ))}
                </div>
                <input type="hidden" name="rating" value={rating} required />
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="comment">Your Review</label>
                <textarea
                    id="comment"
                    name="comment"
                    rows={4}
                    placeholder="Share your experience..."
                    className={styles.textarea}
                    required
                />
            </div>

            {message && (
                <div className={message.includes('success') ? styles.success : styles.error}>
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className={styles.submitBtn}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}
