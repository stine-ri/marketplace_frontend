import React, { useEffect, useState } from 'react';
import { getOrders } from '../../api/orders';

const OrderList = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading orders...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Orders</h2>
      <ul>
        {orders.map(({ id, total_amount, status }) => (
          <li key={id}>
            Order #{id} - ${total_amount} - <b>{status}</b>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderList;