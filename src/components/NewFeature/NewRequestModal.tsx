import { useEffect, useState } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline'; // Add PhotoIcon
import axios from 'axios';
import { toast } from 'react-toastify';

interface NewRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

interface Service {
  id: number;
  name: string;
}

export function NewRequestModal({ isOpen, onClose, onSubmit }: NewRequestModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceId: '',
    desiredPrice: '',
    location: '',
    urgency: 'standard'
  });

  // ADD: New image upload state
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch services from the backend
  useEffect(() => {
    if (!isOpen) return; // Avoid fetch if modal is closed

    const fetchServices = async () => {
      try {
        const res = await axios.get<Service[]>('https://mkt-backend-sz2s.onrender.com/api/services');
        setServices(res.data);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      }
    };

    fetchServices();
  }, [isOpen]);

  // ADD: Image handling functions
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 
  
  if (e.target.files) {
    const files = Array.from(e.target.files);
    console.log(`Selected ${files.length} files`);
    
    // Validate each file
    const validFiles = files.filter(file => {
      const isValid = file.size > 0 && 
                     file.size <= 5 * 1024 * 1024 && // 5MB limit
                     file.type.startsWith('image/');
      
      console.log(`File validation: ${file.name}`, {
        size: file.size,
        type: file.type,
        sizeOk: file.size > 0 && file.size <= 5 * 1024 * 1024,
        typeOk: file.type.startsWith('image/'),
        valid: isValid
      });
      
      if (!isValid) {
        if (file.size === 0) {
          toast.error(`File ${file.name} is empty`);
        } else if (file.size > 5 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large (max 5MB)`);
        } else if (!file.type.startsWith('image/')) {
          toast.error(`File ${file.name} is not an image`);
        }
      }
      
      return isValid;
    });
    
    console.log(`Valid files: ${validFiles.length}/${files.length}`);
    
    if (validFiles.length === 0) {
      toast.error('No valid image files selected');
      return;
    }
    
    setImages(validFiles);
    
    // Create previews
    const newPreviews = validFiles.map(file => {
      const url = URL.createObjectURL(file);
      console.log(`Created preview for ${file.name}: ${url}`);
      return url;
    });
    
    setPreviews(newPreviews);
    
    if (validFiles.length !== files.length) {
      toast.warning(`${files.length - validFiles.length} files were rejected due to validation errors`);
    } else {
      toast.success(`${validFiles.length} images selected`);
    }
  }
};

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
    
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // UPDATED: Handle submit with images
// Replace the handleSubmit function in your NewRequestModal.tsx with this version:

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Form data before processing:', formData);
    console.log('Images selected:', images.length);

    // CRITICAL: Validate and clean form data BEFORE sending

const validateNumber = (value: string, fieldName: string): number | null => {
  if (!value || value.trim() === '' || value === '-') {
    console.log(`${fieldName} is empty or invalid:`, value);
    return null;
  }
  
  const num = parseFloat(value.trim());
  if (isNaN(num) || !isFinite(num)) {
    console.error(`${fieldName} is not a valid number:`, value);
    throw new Error(`${fieldName} must be a valid number`);
  }
  
  // For desiredPrice, convert to integer (cents)
  // if (fieldName === 'desiredPrice') {
  //   return Math.round(num * 100); // Convert to cents
  // }
  
  return Math.round(num); // Convert other numbers to integers
};

    const validateString = (value: string, fieldName: string): string | null => {
      if (!value || value.trim() === '') {
        return null;
      }
      return value.trim();
    };

    // Validate required fields first
    if (!formData.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!formData.serviceId || formData.serviceId.trim() === '') {
      throw new Error('Service selection is required');
    }
    if (!formData.desiredPrice?.trim()) {
      throw new Error('Desired price is required');
    }
    if (!formData.location?.trim()) {
      throw new Error('Location is required');
    }

    // Process and validate data
    const processedData = {
      productName: validateString(formData.title, 'title'),
      description: validateString(formData.description, 'description'),
      serviceId: validateNumber(formData.serviceId, 'serviceId'),
      desiredPrice: validateNumber(formData.desiredPrice, 'desiredPrice'),
      location: validateString(formData.location, 'location'),
      isService: true
    };

    console.log('Processed data:', processedData);

    // Additional validation
    if (processedData.serviceId === null || processedData.serviceId <= 0) {
      throw new Error('Please select a valid service');
    }
    if (processedData.desiredPrice === null || processedData.desiredPrice <= 0) {
      throw new Error('Price must be a positive number');
    }

    // Validate images before proceeding
    const validImages = images.filter(img => {
      const isValid = img.size > 0 && img.type.startsWith('image/');
      if (!isValid) {
        console.warn(`Invalid image: ${img.name}`, { size: img.size, type: img.type });
      }
      return isValid;
    });
    
    console.log(`Valid images: ${validImages.length}/${images.length}`);
    
    if (validImages.length > 0) {
      console.log('Creating FormData with images...');
      
      // Create FormData for image upload
      const formDataWithImages = new FormData();
      
      // Add form fields - ENSURE clean values
      formDataWithImages.append('productName', processedData.productName || '');
      formDataWithImages.append('description', processedData.description || '');
      formDataWithImages.append('desiredPrice', processedData.desiredPrice!.toString());
      formDataWithImages.append('location', processedData.location || '');
      formDataWithImages.append('serviceId', processedData.serviceId!.toString());
      formDataWithImages.append('isService', 'true');
      
      // Add images
      validImages.forEach((image, index) => {
        console.log(`Adding image ${index}:`, {
          name: image.name,
          size: image.size,
          type: image.type
        });
        formDataWithImages.append('images', image, image.name);
      });
      
      // Debug FormData
      console.log('=== FORMDATA CONTENTS ===');
      for (let [key, value] of formDataWithImages.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File "${value.name}" (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: "${value}"`);
        }
      }
      
      await onSubmit(formDataWithImages);
    } else {
      console.log('No valid images, submitting as JSON...');
      
      // Create clean JSON payload - NO undefined or NaN values
      const jsonPayload = {
        productName: processedData.productName,
        description: processedData.description,
        serviceId: processedData.serviceId,
        desiredPrice: processedData.desiredPrice,
        location: processedData.location,
        isService: true
      };
      
      // Final check - ensure no invalid values
      const cleanPayload = Object.fromEntries(
        Object.entries(jsonPayload).filter(([_, value]) => 
          value !== null && value !== undefined && value !== '' && !Number.isNaN(value)
        )
      );
      
      console.log('Clean JSON payload:', cleanPayload);
      
      // Validate final payload
      if (!cleanPayload.productName) throw new Error('Title is missing');
      if (!cleanPayload.serviceId) throw new Error('Service ID is missing');
      if (!cleanPayload.desiredPrice) throw new Error('Price is missing');
      if (!cleanPayload.location) throw new Error('Location is missing');
      
      await onSubmit(cleanPayload);
    }

    // Reset form on success
    setFormData({
      title: '',
      description: '',
      serviceId: '',
      desiredPrice: '',
      location: '',
      urgency: 'standard'
    });
    
    // Reset images
    setImages([]);
    previews.forEach(preview => URL.revokeObjectURL(preview));
    setPreviews([]);
    
    onClose();
    
  } catch (error) {
    console.error('=== FORM SUBMISSION ERROR ===', error);
    
    // Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    toast.error(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 overflow-y-auto z-50">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Service Request</h3>
          <p className="text-sm text-gray-500 mb-4">Fill out the form below to create a new service request.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="serviceId" className="block text-sm font-medium text-gray-700">Service Type</label>
              <select
                name="serviceId"
                required
                value={formData.serviceId}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 sm:text-sm"
              >
                <option value="">Select a service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="desiredPrice" className="block text-sm font-medium text-gray-700">Desired Price (ksh)</label>
                <input
                  type="number"
                  name="desiredPrice"
                  min="0"
                  step="0.01"
                  required
                  value={formData.desiredPrice}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700">Urgency</label>
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 sm:text-sm"
                >
                  <option value="standard">Standard (3-5 days)</option>
                  <option value="urgent">Urgent (1-2 days)</option>
                  <option value="emergency">Emergency (same day)</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 sm:text-sm"
                placeholder="Address or general location"
              />
            </div>

            {/* ADD: Image Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Images (Optional)
              </label>
              <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-gray-300 px-6 pt-5 pb-6">
                <div className="space-y-1 text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="request-file-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none hover:text-indigo-500"
                    >
                      <span>Upload images</span>
                      <input
                        id="request-file-upload"
                        name="request-file-upload"
                        type="file"
                        className="sr-only"
                        multiple
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB each</p>
                </div>
              </div>
              
              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300 text-sm rounded-md bg-white text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="py-2 px-4 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}