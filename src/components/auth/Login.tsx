import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false); 
  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
 const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await login(formData.email, formData.password);
      
      // Debug: Log the user object to see what role is returned
      console.log('Logged in user:', user);
      console.log('User role:', user?.role);
      console.log("Token being used:", localStorage.getItem('token'));

      // Redirect based on role with better error handling
      if (user?.role) {
        switch (user.role.toLowerCase()) { // Convert to lowercase for consistency
          case 'admin':
            console.log('Navigating to admin dashboard');
            navigate('/admin/dashboard');
            break;
          case 'service_provider':
          case 'provider': // Alternative role name
            console.log('Navigating to provider dashboard');
            navigate('/provider/dashboard');
            break;
          case 'client':
          case 'customer': // Alternative role name
            console.log('Navigating to client dashboard');
            navigate('/client/dashboard');
            break;
          default:
            console.log('Unknown role, navigating to home');
            navigate('/');
        }
      } else {
        console.log('No role found, navigating to home');
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      // error already handled in context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Sign in to your account</h2>
        {error && (
          <div className="text-red-500 text-center p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center mt-6"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <div className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Register now
          </button>
        </div>
      </div>
    </div>
  );
}