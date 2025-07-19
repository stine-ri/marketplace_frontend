import React, { useEffect, useState } from 'react';
import { getReviews } from '../../api/reviews';

const ReviewList = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getReviews();
        setReviews(data);
      } catch {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Reviews</h2>
      <ul>
        {reviews.map(({ id, rating, comment }) => (
          <li key={id}>
            <b>Rating:</b> {rating} / 5<br />
            <i>{comment}</i>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewList;