import React, { useEffect, useState } from 'react';
import { getAdmins } from '../../api/admin';

const AdminList = () => {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getAdmins();
        setAdmins(data);
      } catch {
        setError('Failed to load admins');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading admins...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Admins</h2>
      <ul>
        {admins.map(({ id, username, role }) => (
          <li key={id}>
            {username} - <i>{role}</i>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminList;