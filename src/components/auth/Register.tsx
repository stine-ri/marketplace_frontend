import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaExternalLinkAlt, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
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
  const [showAllErrors, setShowAllErrors] = useState(false);

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
        if (!emailRegex.test(value)) return 'Please enter a valid email address (example: john@email.com)';
        break;
      case 'contact_phone':
        if (!value.trim()) return 'Phone number is required';
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid Kenyan phone number (example: 0712345678 or +254712345678)';
        }
        break;
      case 'address':
        if (!value.trim()) return 'Address is required';
        if (value.trim().length < 5) return 'Please enter your complete address (example: 123 Main St, Nairobi)';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-z])/.test(value)) return 'Password must contain at least one lowercase letter (a-z)';
        if (!/(?=.*[A-Z])/.test(value)) return 'Password must contain at least one uppercase letter (A-Z)';
        if (!/(?=.*\d)/.test(value)) return 'Password must contain at least one number (0-9)';
        break;
      case 'confirmPassword':
        if (!value) return 'Please confirm your password by typing it again';
        if (value !== formData.password) return 'The passwords you entered do not match. Please check both password fields.';
        break;
      default:
        return undefined;
    }
    return undefined;
  };

  const validateTerms = (): string | undefined => {
    if (!acceptedTerms) return 'You must check the box to accept our Terms and Conditions before registering';
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name as keyof ValidationErrors]) {
      setValidationErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Mark field as touched when user interacts with it
    setTouched(prev => ({ ...prev, [name]: true }));
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
    setTouched(prev => ({ ...prev, terms: true }));
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
    setShowAllErrors(true);
    
    // Validate all fields before submission
    if (!validateAllFields()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      await register({
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        contact_phone: formData.contact_phone.trim(),
        address: formData.address.trim(),
        role: formData.role,
        password: formData.password
      });
      navigate('/login');
    } catch (err: any) {
      console.error("Registration error:", err);
      setShowAllErrors(true);
    }
  };

  const getFieldClassName = (fieldName: string) => {
    const hasError = validationErrors[fieldName as keyof ValidationErrors] && (touched[fieldName] || showAllErrors);
    const isValid = touched[fieldName] && !validationErrors[fieldName as keyof ValidationErrors] && formData[fieldName as keyof typeof formData];
    
    return `mt-1 p-3 w-full border-2 rounded-md transition-all duration-200 ${
      hasError 
        ? 'border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500' 
        : isValid
        ? 'border-green-500 bg-green-50 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
    }`;
  };

  const getFieldStatus = (fieldName: string) => {
    const hasError = validationErrors[fieldName as keyof ValidationErrors] && (touched[fieldName] || showAllErrors);
    const isValid = touched[fieldName] && !validationErrors[fieldName as keyof ValidationErrors] && formData[fieldName as keyof typeof formData];
    
    if (hasError) {
      return <FaExclamationCircle className="text-red-500 text-lg" />;
    } else if (isValid) {
      return <FaCheckCircle className="text-green-500 text-lg" />;
    }
    return null;
  };

  const errorCount = Object.values(validationErrors).filter(Boolean).length;
  const completedFields = Object.entries(formData).filter(([key, value]) => {
    if (key === 'role') return true; // Role always has a value
    return value.trim() !== '';
  }).length + (acceptedTerms ? 1 : 0);
  const totalFields = Object.keys(formData).length + 1; // +1 for terms

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-2xl font-bold text-center text-gray-900">Create your account</h2>
          <div className="mt-2 text-center">
            <span className="text-sm text-gray-600">
              Progress: {completedFields}/{totalFields} fields completed
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(completedFields / totalFields) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <div className="flex items-center">
              <FaExclamationCircle className="mr-2" />
              <span className="block sm:inline">{error}</span>
            </div>
          </div>
        )}

        {showAllErrors && errorCount > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-center mb-2">
              <FaExclamationCircle className="text-yellow-600 mr-2" />
              <h4 className="text-sm font-bold text-yellow-800">
                Please fix {errorCount} error{errorCount > 1 ? 's' : ''} before continuing:
              </h4>
            </div>
            <ul className="text-sm text-yellow-700 space-y-1 ml-6">
              {Object.entries(validationErrors).map(([field, error]) => 
                error && (
                  <li key={field} className="list-disc">
                    <strong>{field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong> {error}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="full_name"
                type="text"
                required
                className={getFieldClassName('full_name')}
                value={formData.full_name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your full name (e.g., John Doe)"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getFieldStatus('full_name')}
              </div>
            </div>
            {validationErrors.full_name && (touched.full_name || showAllErrors) && (
              <div className="flex items-start mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{validationErrors.full_name}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="email"
                type="email"
                required
                className={getFieldClassName('email')}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email (e.g., john@email.com)"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getFieldStatus('email')}
              </div>
            </div>
            {validationErrors.email && (touched.email || showAllErrors) && (
              <div className="flex items-start mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{validationErrors.email}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
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
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getFieldStatus('contact_phone')}
              </div>
            </div>
            {validationErrors.contact_phone && (touched.contact_phone || showAllErrors) && (
              <div className="flex items-start mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{validationErrors.contact_phone}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="address"
                type="text"
                required
                className={getFieldClassName('address')}
                value={formData.address}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your complete address (e.g., 123 Main St, Nairobi)"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {getFieldStatus('address')}
              </div>
            </div>
            {validationErrors.address && (touched.address || showAllErrors) && (
              <div className="flex items-start mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{validationErrors.address}</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account type</label>
            <select
              name="role"
              className="mt-1 p-3 w-full border-2 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="client">Client - Looking for services/products</option>
              <option value="service_provider">Service Provider - Offering services</option>
              <option value="product_seller">Product Seller - Selling products</option>
            </select>
          </div>
          
          {/* Password field with visibility toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className={`${getFieldClassName('password')} pr-20`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Create a secure password"
                minLength={8}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {getFieldStatus('password')}
                <button
                  type="button"
                  className="p-1"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                </button>
              </div>
            </div>
            {validationErrors.password && (touched.password || showAllErrors) && (
              <div className="flex items-start mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{validationErrors.password}</span>
              </div>
            )}
            <div className="mt-2 text-xs text-gray-600">
              Password must contain: 8+ characters, uppercase letter, lowercase letter, and number
            </div>
          </div>
          
          {/* Confirm Password field with visibility toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                className={`${getFieldClassName('confirmPassword')} pr-20`}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Type your password again"
                minLength={8}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                {getFieldStatus('confirmPassword')}
                <button
                  type="button"
                  className="p-1"
                  onClick={toggleConfirmPasswordVisibility}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                </button>
              </div>
            </div>
            {validationErrors.confirmPassword && (touched.confirmPassword || showAllErrors) && (
              <div className="flex items-start mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{validationErrors.confirmPassword}</span>
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 border-2 rounded-md border-gray-300">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={handleTermsChange}
                className={`mt-1 h-5 w-5 text-blue-600 border-2 rounded transition-colors ${
                  validationErrors.terms && (touched.terms || showAllErrors) ? 'focus:ring-red-500 border-red-500' : 'focus:ring-blue-500 border-gray-300'
                }`}
              />
              <div className="flex-1">
                <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 hover:text-blue-500 underline inline-flex items-center gap-1 font-medium"
                  >
                    Terms and Conditions
                    <FaExternalLinkAlt className="text-xs" />
                  </button>
                  <span className="text-red-500"> *</span>
                </label>
              </div>
              <div className="mt-1">
                {acceptedTerms ? (
                  <FaCheckCircle className="text-green-500 text-lg" />
                ) : (touched.terms || showAllErrors) && validationErrors.terms ? (
                  <FaExclamationCircle className="text-red-500 text-lg" />
                ) : null}
              </div>
            </div>
            {validationErrors.terms && (touched.terms || showAllErrors) && (
              <div className="flex items-start text-sm text-red-600 bg-red-50 p-2 rounded">
                <FaExclamationCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{validationErrors.terms}</span>
              </div>
            )}
          </div>

          {showTermsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Terms and Conditions</h3>
                  <button 
                    onClick={() => setShowTermsModal(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    &times;
                  </button>
                </div>
                <div className="p-4">
                  <TermsAndConditions />
                </div>
                <div className="sticky bottom-0 bg-white p-4 border-t">
                  <button 
                    onClick={() => setShowTermsModal(false)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors text-lg ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : errorCount > 0 && showAllErrors
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating your account...
              </span>
            ) : errorCount > 0 && showAllErrors ? (
              `Fix ${errorCount} error${errorCount > 1 ? 's' : ''} and try again`
            ) : (
              'Create Account'
            )}
          </button>
        </form>
        
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in here
          </button>
        </div>
      </div>
    </div>
  );
}