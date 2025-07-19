import React, { useEffect, useState } from 'react';
import { getProducts } from '../../api/products';

const ProductList = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div>
      <h2>Products</h2>
      <ul>
        {products.map(({ id, name, price }) => (
          <li key={id}>{name} - ${price}</li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;