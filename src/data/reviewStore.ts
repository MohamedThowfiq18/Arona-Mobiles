import { Testimonial } from '../types';
import { SAMPLE_REVIEWS } from './reviews';

const STORAGE_KEY = 'arona_customer_reviews_v1';

/**
 * Get reviews from localStorage or fallback to default sample reviews
 */
export function getStoredReviews(): Testimonial[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read reviews from localStorage:', error);
  }
  
  // Save initial default reviews
  saveReviews(SAMPLE_REVIEWS);
  return SAMPLE_REVIEWS;
}

/**
 * Save reviews to localStorage and dispatch custom update event
 */
export function saveReviews(reviews: Testimonial[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new Event('arona_reviews_updated'));
  } catch (error) {
    console.error('Failed to save reviews to localStorage:', error);
  }
}

/**
 * Add a new customer review
 */
export function addReview(review: Omit<Testimonial, 'id' | 'date' | 'verifiedPurchase'>): Testimonial[] {
  const newReview: Testimonial = {
    ...review,
    id: 'rev-' + Date.now(),
    date: 'Just now',
    verifiedPurchase: true
  };

  const current = getStoredReviews();
  const updated = [newReview, ...current];
  saveReviews(updated);
  return updated;
}
