// components/DirectServiceRequest.tsx - Fixed CORS issue
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { 
  PaperAirplaneIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface DirectServiceRequestProps {
  providerId: number;
  serviceId: number;
  serviceName: string;
  providerName: string;
  onSuccess?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const DirectServiceRequest: React.FC<DirectServiceRequestProps> = ({
  providerId,
  serviceId,
  serviceName,
  providerName,
  onSuccess,
  isOpen,
  onClose
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    requestTitle: `${serviceName} Request`,
    description: '',
    budgetMin: '',
    budgetMax: '',
    deadline: '',
    urgency: 'normal' as 'low' | 'normal' | 'high' | 'urgent',
    location: '',
    clientNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.requestTitle.trim()) {
      toast.error('Please provide a request title');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Log the request payload for debugging
      const payload = {
        providerId,
        serviceId,
        requestTitle: formData.requestTitle,
        description: formData.description || null,
        budgetMin: formData.budgetMin ? parseFloat(formData.budgetMin) : null,
        budgetMax: formData.budgetMax ? parseFloat(formData.budgetMax) : null,
        deadline: formData.deadline || null,
        urgency: formData.urgency,
        location: formData.location || null,
        clientNotes: formData.clientNotes || null
      };
      
      console.log('Sending service request payload:', payload);
    
      // Use environment-based URL configuration
      const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mkt-backend-sz2s.onrender.com';
      const response = await fetch(`${baseURL}/api/service-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      let result;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error('JSON parsing error:', jsonError);
          const textResponse = await response.text();
          console.error('Raw response:', textResponse);
          throw new Error('Server returned invalid JSON response');
        }
      } else {
        // If not JSON, get text response for debugging
        const textResponse = await response.text();
        console.error('Non-JSON response:', textResponse);
        throw new Error(`Server error: ${response.status} - ${textResponse}`);
      }

      console.log('Parsed result:', result);

      if (!response.ok) {
        // Handle specific error messages from backend
        if (result?.error === 'Cannot request your own service') {
          toast.error('You cannot request your own service');
        } else if (result?.error === 'Provider does not offer this service') {
          toast.error('This provider does not offer the selected service');
        } else {
          toast.error(result?.error || `Request failed with status ${response.status}`);
        }
        return;
      }

      toast.success(`Service request sent to ${providerName}!`);
      onSuccess?.();
      onClose();
      
      // Reset form
      setFormData({
        requestTitle: `${serviceName} Request`,
        description: '',
        budgetMin: '',
        budgetMax: '',
        deadline: '',
        urgency: 'normal',
        location: '',
        clientNotes: ''
      });

    } catch (error) {
      console.error('Error sending request:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error - please check your connection');
      } else {
        toast.error(error instanceof Error ? error.message : 'Failed to send request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Request Service</h2>
              <p className="text-sm text-gray-600 mt-1">
                Send a direct request to {providerName} for {serviceName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Request Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Title *
            </label>
            <input
              type="text"
              value={formData.requestTitle}
              onChange={(e) => handleInputChange('requestTitle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              placeholder="Brief title for your request"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-none transition-all"
              placeholder="Describe what you need in detail..."
            />
          </div>

          {/* Budget Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CurrencyDollarIcon className="h-4 w-4 inline mr-1" />
                Min Budget (KSh)
              </label>
              <input
                type="number"
                value={formData.budgetMin}
                onChange={(e) => handleInputChange('budgetMin', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Budget (KSh)
              </label>
              <input
                type="number"
                value={formData.budgetMax}
                onChange={(e) => handleInputChange('budgetMax', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                placeholder="0"
                min="0"
                step="100"
              />
            </div>
          </div>

          {/* Deadline and Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarDaysIcon className="h-4 w-4 inline mr-1" />
                Deadline
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => handleInputChange('deadline', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              >
                <option value="low">Low Priority</option>
                <option value="normal">Normal</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Location (if service requires physical presence)
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all"
              placeholder="Where should the service be provided?"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.clientNotes}
              onChange={(e) => handleInputChange('clientNotes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-none transition-all"
              placeholder="Any additional information or special requirements..."
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.requestTitle.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectServiceRequest;