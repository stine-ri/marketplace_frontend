import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

type Role = 'admin' | 'service_provider' | 'client';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    contact_phone: '',
    address: '',
    role: 'client' as Role,
    password: '',
    confirmPassword: ''
  });
  
  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        contact_phone: formData.contact_phone,
        address: formData.address,
        role: formData.role,
        password: formData.password
      });
      navigate('/login'); // Redirect to login after registration
    } catch (err) {
      // Error handled in auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Create your account</h2>
        {error && (
          <div className="text-red-500 text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full name</label>
            <input
              name="full_name"
              type="text"
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone number</label>
            <input
              name="contact_phone"
              type="tel"
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.contact_phone}
              onChange={handleChange}
              placeholder="0712345678"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <input
              name="address"
              type="text"
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Main St, Nairobi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Account type</label>
            <select
              name="role"
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="client">Client</option>
              <option value="service_provider">Service Provider</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}