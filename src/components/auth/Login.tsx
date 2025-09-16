import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaCheckCircle, FaUser, FaLock } from 'react-icons/fa';

interface ValidationErrors {
  email?: string;
  password?: string;
}

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error, loading } = useAuth();
  const navigate = useNavigate();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!value.trim()) return 'Email address is required';
        if (!emailRegex.test(value.trim())) return 'Please enter a valid email address (example: john@email.com)';
        break;
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 1) return 'Please enter your password';
        break;
      default:
        return undefined;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateAllFields = (): boolean => {
    const errors: ValidationErrors = {};
    
    // Validate all form fields
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) errors[key as keyof ValidationErrors] = error;
    });
    
    setValidationErrors(errors);
    setTouched({
      email: true,
      password: true
    });
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowAllErrors(true);
    setIsSubmitting(true);
    
    // Validate all fields before submission
    if (!validateAllFields()) {
      setIsSubmitting(false);
      // Scroll to the first error
      const firstErrorField = document.querySelector('.border-red-500');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const user = await login(formData.email.trim().toLowerCase(), formData.password);
      
      if (user?.role) {
        switch (user.role.toLowerCase()) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'service_provider':
          case 'provider':
            navigate('/provider/dashboard');
            break;
          case 'product_seller':
          case 'seller':
            navigate('/seller/dashboard'); 
            break;
          case 'client':
          case 'customer':
            navigate('/client/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setShowAllErrors(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldClassName = (fieldName: string) => {
    const hasError = validationErrors[fieldName as keyof ValidationErrors] && (touched[fieldName] || showAllErrors);
    const isValid = touched[fieldName] && !validationErrors[fieldName as keyof ValidationErrors] && formData[fieldName as keyof typeof formData].trim() !== '';
    
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
    const isValid = touched[fieldName] && !validationErrors[fieldName as keyof ValidationErrors] && formData[fieldName as keyof typeof formData].trim() !== '';
    
    if (hasError) {
      return <FaExclamationCircle className="text-red-500 text-lg" />;
    } else if (isValid) {
      return <FaCheckCircle className="text-green-500 text-lg" />;
    }
    return null;
  };

  const errorCount = Object.values(validationErrors).filter(Boolean).length;
  const completedFields = Object.entries(formData).filter(([, value]) => value.trim() !== '').length;
  const totalFields = Object.keys(formData).length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <FaUser className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account to continue</p>
          
          {/* Progress indicator */}
          <div className="mt-4">
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

        {/* Auth error from backend */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <div className="flex items-center">
              <FaExclamationCircle className="mr-2" />
              <span className="block sm:inline">
                {error.includes('Invalid credentials') || error.includes('invalid') 
                  ? 'Invalid email or password. Please check your credentials and try again.'
                  : error
                }
              </span>
            </div>
          </div>
        )}

        {/* Validation errors summary */}
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
                    <strong>{field === 'email' ? 'Email' : 'Password'}:</strong> {error}
                  </li>
                )
              )}
            </ul>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              <FaUser className="inline mr-2" />
              Email address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`${getFieldClassName('email')} pl-3`}
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your email (e.g., john@email.com)"
                autoComplete="email"
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

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              <FaLock className="inline mr-2" />
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className={`${getFieldClassName('password')} pl-3 pr-20`}
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter your password"
                autoComplete="current-password"
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
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || isSubmitting}
            className={`w-full py-3 px-4 rounded-md text-white font-medium transition-colors text-lg ${
              loading || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed' 
                : errorCount > 0 && showAllErrors
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading || isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing you in...
              </span>
            ) : errorCount > 0 && showAllErrors ? (
              `Fix ${errorCount} error${errorCount > 1 ? 's' : ''} and try again`
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Navigation links */}
        <div className="space-y-3">
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-blue-600 hover:text-blue-500 underline"
            >
              Create account here
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
            <button
              onClick={() => navigate('/forgot-password')}
              className="font-medium text-blue-600 hover:text-blue-500 underline"
            >
              Forgot your password?
            </button>
          </div>
        </div>

        {/* Help section */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Need help signing in?</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Make sure your email address is correct</li>
            <li>• Check that your password is entered correctly</li>
            <li>• Use the "Show password" button to verify your password</li>
            <li>• Try the "Forgot password" link if you can't remember your password</li>
          </ul>
        </div>
      </div>
    </div>
  );
}