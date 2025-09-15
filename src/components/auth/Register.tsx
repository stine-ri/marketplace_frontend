import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaExternalLinkAlt } from 'react-icons/fa';
import TermsAndConditions from '../NewFeature/Terms';

// Define public roles that users can register as
type PublicRole = 'client' | 'service_provider' | 'product_seller';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    contact_phone: '',
    address: '',
    role: 'client' as PublicRole,
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
  };



  const isFormValid = () => {
    return (
      formData.full_name.trim() !== '' &&
      formData.email.trim() !== '' &&
      formData.contact_phone.trim() !== '' &&
      formData.address.trim() !== '' &&
      formData.password.length >= 8 &&
      formData.password === formData.confirmPassword &&
      acceptedTerms
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    if (!formData.full_name.trim()) {
      alert("Please enter your full name");
      return;
    }
    if (!formData.email.trim()) {
      alert("Please enter your email");
      return;
    }
    if (!formData.contact_phone.trim()) {
      alert("Please enter your phone number");
      return;
    }
    if (!formData.address.trim()) {
      alert("Please enter your address");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    if (formData.password.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }
    if (!acceptedTerms) {
      alert("You must accept the Terms and Conditions to register");
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
      navigate('/login');
    } catch (err: any) {
      console.error("Registration error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
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
              <option value="client">Client - Looking for services/products</option>
              <option value="service_provider">Service Provider - Offering services</option>
              <option value="product_seller">Product Seller - Selling products</option>
            </select>
          </div>
          
          {/* Password field with visibility toggle */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={8}
            />
            <button
              type="button"
              className="absolute right-3 top-9 p-1"
              onClick={togglePasswordVisibility}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
            </button>
          </div>
          
          {/* Confirm Password field with visibility toggle */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">Confirm password</label>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              className="mt-1 p-2 w-full border rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={8}
            />
            <button
              type="button"
              className="absolute right-3 top-9 p-1"
              onClick={toggleConfirmPasswordVisibility}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
            </button>
          </div>

          {/* Terms and Conditions */}
         <div className="flex items-start space-x-3">
  <input
    id="terms"
    name="terms"
    type="checkbox"
    checked={acceptedTerms}
    onChange={handleTermsChange}
    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
  />
  <div className="flex-1">
    <label htmlFor="terms" className="text-sm text-gray-700">
      I agree to the{' '}
      <button
        type="button"
        onClick={() => setShowTermsModal(true)}
        className="text-blue-600 hover:text-blue-500 underline inline-flex items-center gap-1"
      >
        Terms and Conditions
        <FaExternalLinkAlt className="text-xs" />
      </button>
    </label>
  </div>
</div>


{showTermsModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-semibold">Terms and Conditions</h3>
        <button 
          onClick={() => setShowTermsModal(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          &times;
        </button>
      </div>
      <div className="p-4">
        <TermsAndConditions />
      </div>
    </div>
  </div>
)}
          
          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              loading || !isFormValid() 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
          
          {!isFormValid() && !loading && (
            <div className="text-xs text-red-500 text-center">
              Please fill all fields and accept the Terms and Conditions
            </div>
          )}
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