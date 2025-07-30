import React, { useState } from 'react';
import { User, Store, Settings, Camera, MapPin, Phone, Mail, CheckCircle, Eye, EyeOff, Upload, Star, Shield, Award, Clock } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  businessName: string;
  businessType: string;
  location: string;
  bio: string;
  experience: string;
  skills: string;
  certifications: string;
  website: string;
  portfolio: string;
}

interface Service {
  id: string;
  name: string;
  rate: string;
  demand: string;
  providers: number;
  selected: boolean;
}
const BecomeSellerComponent = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [userType, setUserType] = useState('seller');
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessName: '',
    businessType: '',
    location: '',
    bio: '',
    experience: '',
    skills: '',
    certifications: '',
    website: '',
    portfolio: ''
  });

  const businessTypes = [
    'Individual/Freelancer',
    'Small Business',
    'Corporation',
    'Non-Profit',
    'Partnership'
  ];

  const serviceCategories = [
    { id: 'web-design', name: 'Web Design & Development', rate: '$25-85/hour', demand: 'High', providers: 1234, selected: false },
    { id: 'graphic-design', name: 'Graphic Design', rate: '$20-60/hour', demand: 'High', providers: 890, selected: false },
    { id: 'writing', name: 'Writing & Translation', rate: '$15-50/hour', demand: 'Medium', providers: 2156, selected: false },
    { id: 'marketing', name: 'Digital Marketing', rate: '$30-100/hour', demand: 'High', providers: 756, selected: false },
    { id: 'photography', name: 'Photography', rate: '$40-120/hour', demand: 'Medium', providers: 445, selected: false },
    { id: 'consulting', name: 'Business Consulting', rate: '$50-200/hour', demand: 'High', providers: 334, selected: false },
    { id: 'tutoring', name: 'Tutoring & Education', rate: '$20-80/hour', demand: 'High', providers: 1123, selected: false },
    { id: 'home-services', name: 'Home Services', rate: '$25-75/hour', demand: 'High', providers: 667, selected: false },
    { id: 'health', name: 'Health & Wellness', rate: '$35-150/hour', demand: 'Medium', providers: 456, selected: false },
    { id: 'legal', name: 'Legal Services', rate: '$100-400/hour', demand: 'Medium', providers: 234, selected: false }
  ];

  const [selectedServices, setSelectedServices] = useState<Service[]>(serviceCategories);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.map(service => 
        service.id === serviceId 
          ? { ...service, selected: !service.selected }
          : service
      )
    );
  };

 const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

  const steps = [
    { number: 1, title: 'Registration', description: 'Create your account' },
    { number: 2, title: 'Profile Setup', description: 'Complete your profile' },
    { number: 3, title: 'Services', description: 'Choose your services' },
    { number: 4, title: 'Verification', description: 'Verify your account' }
  ];

  const renderStepIndicator = () => (
    <div className="mb-8 md:mb-12">
      <div className="flex items-center justify-center overflow-x-auto py-2">
        <div className="flex items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div className="flex flex-col items-center min-w-[100px]">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-sm md:text-base ${
                  activeStep >= step.number
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {activeStep > step.number ? (
                    <CheckCircle className="w-4 h-4 md:w-6 md:h-6" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className={`font-medium text-xs md:text-sm ${activeStep >= step.number ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 hidden md:block">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-8 md:w-16 h-1 mx-1 md:mx-4 ${
                  activeStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRegistration = () => (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {userType === 'seller' ? 'Become a Seller' : 'Register as Service Provider'}
          </h2>
          <p className="text-gray-600 text-sm md:text-base">
            {userType === 'seller' 
              ? 'Start selling your products to customers worldwide'
              : 'Offer your services to clients in your area'
            }
          </p>
        </div>

        <div className="flex justify-center mb-6 md:mb-8">
          <div className="bg-gray-100 p-1 rounded-lg inline-flex">
            <button
              onClick={() => setUserType('seller')}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 text-sm md:text-base ${
                userType === 'seller'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Store className="w-3 h-3 md:w-4 md:h-4" />
              Seller
            </button>
            <button
              onClick={() => setUserType('service-provider')}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-md font-medium transition-all duration-200 flex items-center gap-2 text-sm md:text-base ${
                userType === 'service-provider'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3 h-3 md:w-4 md:h-4" />
              Service Provider
            </button>
          </div>
        </div>

        <form className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                placeholder="Enter your first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
              placeholder="Enter your email address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 md:w-5 md:h-5" /> : <Eye className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
              {userType === 'seller' ? 'Business/Store Name' : 'Business Name'} *
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => handleInputChange('businessName', e.target.value)}
              className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
              placeholder={userType === 'seller' ? 'Enter your store name' : 'Enter your business name'}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Business Type *
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
              >
                <option value="">Select business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                placeholder="City, State/Province, Country"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="terms" className="ml-2 text-xs md:text-sm text-gray-600">
              I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setActiveStep(2)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold transition-colors text-sm md:text-base"
          >
            Continue to Profile Setup
          </button>
        </form>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Setup Your Profile</h2>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />
            <span className="font-medium text-sm md:text-base">Profile 75% Complete</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-1">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 md:p-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="w-3 h-3 md:w-4 md:h-4" />
                  <input 
                    type="file" 
                    onChange={handleImageUpload}
                    className="hidden" 
                    accept="image/*"
                  />
                </label>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mt-3 md:mt-4">Profile Picture</h3>
              <p className="text-xs md:text-sm text-gray-600">Upload a professional photo</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <form className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Professional Bio
                </label>
                <textarea
                  rows={4}
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                  placeholder="Tell customers about yourself and your expertise..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Years of Experience
                </label>
                <select
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                >
                  <option value="">Select experience level</option>
                  <option value="0-1">0-1 years</option>
                  <option value="2-5">2-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="10+">10+ years</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Skills & Expertise
                </label>
                <input
                  type="text"
                  value={formData.skills}
                  onChange={(e) => handleInputChange('skills', e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                  placeholder="Enter skills separated by commas (e.g., Web Design, React, UI/UX)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Certifications & Awards
                </label>
                <input
                  type="text"
                  value={formData.certifications}
                  onChange={(e) => handleInputChange('certifications', e.target.value)}
                  className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                  placeholder="List your relevant certifications and awards"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolio}
                    onChange={(e) => handleInputChange('portfolio', e.target.value)}
                    className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm md:text-base"
                    placeholder="https://portfolio.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 md:gap-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold transition-colors text-sm md:text-base"
                >
                  Continue to Services
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  const renderServices = () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Choose Your Services</h2>
            <p className="text-gray-600 text-sm md:text-base">Select the services you want to offer to customers</p>
          </div>
          <div className="text-right">
            <p className="text-xs md:text-sm text-gray-500">Services Selected</p>
            <p className="text-xl md:text-2xl font-bold text-blue-600">
              {selectedServices.filter(service => service.selected).length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {selectedServices.map(service => (
            <div
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={`border-2 rounded-xl p-4 md:p-6 cursor-pointer transition-all duration-200 ${
                service.selected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                  {service.name}
                </h3>
                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center ${
                  service.selected
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {service.selected && <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                </div>
              </div>
              
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Average Rate:</span>
                  <span className="font-medium text-green-600">{service.rate}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Active Providers:</span>
                  <span className="font-medium">{service.providers.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs md:text-sm">
                  <span className="text-gray-600">Demand:</span>
                  <div className="flex items-center gap-1">
                    <Star className={`w-3 h-3 md:w-4 md:h-4 fill-current ${
                      service.demand === 'High' ? 'text-green-400' : 'text-yellow-400'
                    }`} />
                    <span className={`font-medium ${
                      service.demand === 'High' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {service.demand}
                    </span>
                  </div>
                </div>
              </div>

              {service.selected && (
                <div className="mt-3 md:mt-4 pt-3 border-t border-blue-200">
                  <p className="text-blue-600 text-xs md:text-sm font-medium">
                    ✓ Selected - You can customize this service later
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 md:mt-8 flex gap-3 md:gap-4">
          <button
            onClick={() => setActiveStep(2)}
            className="flex-1 border border-gray-200 text-gray-600 py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base"
          >
            Previous
          </button>
          <button
            onClick={() => setActiveStep(4)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold transition-colors text-sm md:text-base"
          >
            Continue to Verification
          </button>
        </div>
      </div>
    </div>
  );

  const renderVerification = () => (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="text-center mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Shield className="w-5 h-5 md:w-8 md:h-8 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">Account Verification</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Complete verification to start {userType === 'seller' ? 'selling' : 'offering services'}
          </p>
        </div>

        <div className="space-y-4 md:space-y-6">
          <div className="border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3">
                <Mail className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Email Verification</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Verify your email address</p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-yellow-600">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-medium text-sm md:text-base">Pending</span>
              </div>
            </div>
            <div className="mt-3 md:mt-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-sm md:text-base">
                Send Verification Email
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3">
                <Phone className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Phone Verification</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Verify your phone number</p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-yellow-600">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-medium text-sm md:text-base">Pending</span>
              </div>
            </div>
            <div className="mt-3 md:mt-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium transition-colors text-sm md:text-base">
                Send SMS Code
              </button>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 md:gap-3">
                <Award className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm md:text-base">Identity Verification</h3>
                  <p className="text-gray-600 text-xs md:text-sm">Upload government-issued ID</p>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-gray-400">
                <Clock className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-medium text-sm md:text-base">Optional</span>
              </div>
            </div>
            <div className="mt-3 md:mt-4">
              <button className="border border-gray-200 text-gray-600 px-3 py-1 md:px-4 md:py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm md:text-base">
                Upload ID Document
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 md:mt-8 text-center">
          <p className="text-gray-600 mb-4 md:mb-6 text-sm md:text-base">
            Once verified, you can start {userType === 'seller' ? 'listing products' : 'offering services'} and earning money!
          </p>
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={() => setActiveStep(3)}
              className="flex-1 border border-gray-200 text-gray-600 py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm md:text-base"
            >
              Previous
            </button>
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 md:py-3 px-4 md:px-6 rounded-lg font-semibold transition-colors text-sm md:text-base">
              Complete Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-1 md:mb-2">
              {userType === 'seller' ? 'Become a Seller' : 'Become a Service Provider'}
            </h1>
            <p className="text-base md:text-xl text-gray-600">
              {userType === 'seller' 
                ? 'Join thousands of successful sellers on our platform'
                : 'Start offering your professional services to clients worldwide'
              }
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {renderStepIndicator()}
        
        {activeStep === 1 && renderRegistration()}
        {activeStep === 2 && renderProfile()}
        {activeStep === 3 && renderServices()}
        {activeStep === 4 && renderVerification()}
      </div>
    </div>
  );
};

export default BecomeSellerComponent;