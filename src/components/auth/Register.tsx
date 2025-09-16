import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaExternalLinkAlt } from 'react-icons/fa';
import TermsAndConditions from '../NewFeature/Terms';

// Define public roles that users can register as
type PublicRole = 'client' | 'service_provider' | 'product_seller';

interface ValidationErrors {
  full_name?: string;
  email?: string;
  contact_phone?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

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
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const { register, error, loading } = useAuth();
  const navigate = useNavigate();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  // Phone validation regex (supports various formats)
  const phoneRegex = /^(\+254|0)?[17]\d{8}$/;

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'full_name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 2) return 'Full name must be at least 2 characters';
        break;
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!emailRegex.test(value)) return 'Please enter a valid email address';
        break;
      case 'contact_phone':
        if (!value.trim()) return 'Phone number is required';
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid phone number (e.g., 0712345678 or +254712345678)';
        }
        break;
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 5) return 'Please enter a complete address';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number';
        break;
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        break;
      default:
        return undefined;
    }
    return undefined;
  };

  const validateTerms = (): string | undefined => {
    if (!acceptedTerms) return 'You must accept the Terms and Conditions to register';
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setValidationErrors(prev => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAcceptedTerms(e.target.checked);
    if (validationErrors.terms) {
      setValidationErrors(prev => ({ ...prev, terms: undefined }));
    }
  };

  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Validate all form fields
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'role') { // Skip role validation as it's always valid
        const error = validateField(key, value);
        if (error) errors[key as keyof ValidationErrors] = error;
      }
    });
    
    // Validate terms
    const termsError = validateTerms();
    if (termsError) errors.terms = termsError;
    
    setValidationErrors(errors);
    setTouched({
      full_name: true,
      email: true,
      contact_phone: true,
      address: true,
      password: true,
      confirmPassword: true,
      terms: true
    });
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields before submission
    if (!validateAllFields()) {
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

  const getFieldClassName = (fieldName: string) => {
    const hasError = validationErrors[fieldName as keyof ValidationErrors] && touched[fieldName];
    return `mt-1 p-2 w-full border rounded-md transition-colors ${
      hasError 
        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`;
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
            <label className="block text-sm font-medium text-gray-700">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              name="full_name"
              type="text"
              required
              className={getFieldClassName('full_name')}
              value={formData.full_name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John Doe"
            />
            {validationErrors.full_name && touched.full_name && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.full_name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              name="email"
              type="email"
              required
              className={getFieldClassName('email')}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="your@email.com"
            />
            {validationErrors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone number <span className="text-red-500">*</span>
            </label>
            <input
              name="contact_phone"
              type="tel"
              required
              className={getFieldClassName('contact_phone')}
              value={formData.contact_phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0712345678 or +254712345678"
            />
            {validationErrors.contact_phone && touched.contact_phone && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.contact_phone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              name="address"
              type="text"
              required
              className={getFieldClassName('address')}
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="123 Main St, Nairobi"
            />
            {validationErrors.address && touched.address && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.address}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Account type</label>
            <select
              name="role"
              className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className={`${getFieldClassName('password')} pr-10`}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
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
            {validationErrors.password && touched.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>
          
          {/* Confirm Password field with visibility toggle */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              className={`${getFieldClassName('confirmPassword')} pr-10`}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
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
            {validationErrors.confirmPassword && touched.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-start space-x-3">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={handleTermsChange}
              className={`mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded transition-colors ${
                validationErrors.terms ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500'
              }`}
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
                <span className="text-red-500"> *</span>
              </label>
              {validationErrors.terms && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.terms}</p>
              )}
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
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
          
          {/* Summary of validation errors */}
          {Object.keys(validationErrors).length > 0 && Object.values(touched).some(Boolean) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <h4 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h4>
              <ul className="text-xs text-red-700 space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => 
                  error && (
                    <li key={field}>• {error}</li>
                  )
                )}
              </ul>
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