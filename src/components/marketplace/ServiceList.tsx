import React, { useEffect, useState } from 'react';
import { getServices } from '../../api/services';

const ServiceList = () => {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getServices();
        setServices(data);
      } catch {
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading services...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Services</h2>
      <ul>
        {services.map(({ id, name }) => (
          <li key={id}>{name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ServiceList;