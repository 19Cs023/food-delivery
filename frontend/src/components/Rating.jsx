import { useEffect, useMemo, useState } from 'react';
import './Ratings.css';
import axios from 'axios';
import { getAuth } from '../utils/auth'; // adjust path

const API_BASE = 'http://localhost:5000';
const MAX_REVIEW_LENGTH = 500;

const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

function timeAgo(dateString) {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?';
}

function Stars({ value, size = 'md', onHover, onSelect, interactive = false }) {
  const [hovered, setHovered] = useState(0);
  const display = interactive ? hovered || value : value;

  return (
    <div
      className={`stars stars--${size} ${interactive ? 'stars--interactive' : ''}`}
      onMouseLeave={() => interactive && setHovered(0)}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Choose a rating' : `${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star ${n <= display ? 'star--filled' : ''}`}
          onMouseEnter={() => {
            if (!interactive) return;
            setHovered(n);
            onHover?.(n);
          }}
          onClick={() => interactive && onSelect?.(n)}
          role={interactive ? 'radio' : undefined}
          aria-checked={interactive ? n === value : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault();
              onSelect?.(n);
            }
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function DistributionBar({ ratings }) {
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: ratings.filter((r) => r.rating === star).length,
  }));
  const total = ratings.length || 1;

  return (
    <div className="distribution">
      {counts.map(({ star, count }) => (
        <div className="distribution__row" key={star}>
          <span className="distribution__label">{star}★</span>
          <div className="distribution__track">
            <div
              className="distribution__fill"
              style={{ width: `${(count / total) * 100}%` }}
            />
          </div>
          <span className="distribution__count">{count}</span>
        </div>
      ))}
    </div>
  );
}

const Rating = ({ productId }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [review, setReview] = useState('');
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formError, setFormError] = useState(null);


  useEffect(() => {
    let cancelled = false;

    const getRatings = async () => {
      setLoading(true);
      setError(null);
      try {
        // axios resolves straight to `.data` and throws on non-2xx,
        // so there's no `.ok` check or extra await needed here.
        const { data } = await axios.get(`${API_BASE}/api/ratings/product/${productId}`);
        if (!cancelled) setRatings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching ratings:', err);
        if (!cancelled) setError('Could not load reviews right now.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    getRatings();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const average = useMemo(() => {
    if (!ratings.length) return 0;
    return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
  }, [ratings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (selectedRating === 0) {
      setFormError('Select a star rating before submitting.');
      return;
    }

    const auth = getAuth();
    if (!auth?.token) {
      setFormError('You need to be signed in to leave a review.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/ratings/product/${productId}`,
        {
          user: auth.user._id,
          product: productId,
          rating: selectedRating,
          review,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      setRatings((prev) => [data, ...prev]);
      setSelectedRating(0);
      setReview('');
    } catch (err) {
      console.error('Error submitting rating:', err);
      setFormError('Something went wrong submitting your review. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rating-widget">
      <header className="rating-widget__summary">
        <div className="summary__score">
          <span className="summary__number">{average.toFixed(1)}</span>
          <Stars value={Math.round(average)} size="sm" />
          <span className="summary__count">
            {ratings.length} {ratings.length === 1 ? 'review' : 'reviews'}
          </span>
        </div>
        <DistributionBar ratings={ratings} />
      </header>

      <form className="rating-form" onSubmit={handleSubmit}>
        <h3 className="rating-form__title">Write a review</h3>

        <div className="rating-form__field">
          <Stars
            value={selectedRating}
            size="lg"
            interactive
            onSelect={setSelectedRating}
          />
          <span className="rating-form__hint">
            {selectedRating ? STAR_LABELS[selectedRating - 1] : 'Tap a star to rate'}
          </span>
        </div>

        <div className="rating-form__field">
          <label className="rating-form__label" htmlFor="review-text">
            Your review
          </label>
          <textarea
            id="review-text"
            className="rating-form__textarea"
            placeholder="What did you like or dislike?"
            value={review}
            maxLength={MAX_REVIEW_LENGTH}
            onChange={(e) => setReview(e.target.value)}
          />
          <span className="rating-form__counter">
            {review.length}/{MAX_REVIEW_LENGTH}
          </span>
        </div>

        {formError && <p className="rating-form__error">{formError}</p>}

        <button className="rating-form__submit" type="submit" disabled={submitting}>
          {submitting ? <span className="spinner" /> : 'Post review'}
        </button>
      </form>

      <div className="ratings-list">
        {loading ? (
          <div className="ratings-list__skeleton">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : error ? (
          <p className="ratings-list__error">{error}</p>
        ) : ratings.length === 0 ? (
          <div className="empty-state">
            <p>No reviews yet.</p>
            <span>Be the first to share what you think.</span>
          </div>
        ) : (
          ratings.map((r) => (
            <article className="review-card" key={r._id}>
              <div className="review-card__avatar">{initials(r.user?.name)}</div>
              <div className="review-card__body">
                <div className="review-card__header">
                  <span className="review-card__name">{r.user?.name ?? 'Anonymous'}</span>
                  <span className="review-card__date">{timeAgo(r.createdAt)}</span>
                </div>
                <Stars value={r.rating} size="sm" />
                {r.review && <p className="review-card__text">{r.review}</p>}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Rating;