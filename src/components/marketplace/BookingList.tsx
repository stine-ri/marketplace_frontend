import React, { useEffect, useState } from 'react';
import { getBookings } from '../../api/bookings';

const BookingList = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getBookings();
        setBookings(data);
      } catch {
        setError('Failed to load bookings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Bookings</h2>
      <ul>
        {bookings.map(({ id, booking_date, service_id }) => (
          <li key={id}>
            Service ID: {service_id}, Date: {new Date(booking_date).toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BookingList;