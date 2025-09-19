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
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  try {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('Images selected:', images.length);

    
    // Validate images before proceeding
    const validImages = images.filter(img => {
      console.log(`Image validation: ${img.name}`, {
        size: img.size,
        type: img.type,
        lastModified: img.lastModified,
        valid: img.size > 0 && img.type.startsWith('image/')
      });
      return img.size > 0 && img.type.startsWith('image/');
    });
    
    console.log(`Valid images: ${validImages.length}/${images.length}`);
    
    if (validImages.length > 0) {
      console.log('Creating FormData with images...');
      
      // Create FormData for image upload
      const formDataWithImages = new FormData();
      
      // Add form fields first
      formDataWithImages.append('productName', formData.title);
      formDataWithImages.append('description', formData.description || '');
      formDataWithImages.append('desiredPrice', formData.desiredPrice);
      formDataWithImages.append('location', formData.location);
      formDataWithImages.append('serviceId', formData.serviceId);
      formDataWithImages.append('isService', 'true');
      
      // Add images - CRITICAL: Make sure this matches backend expectations
      validImages.forEach((image, index) => {
        console.log(`Adding image ${index}:`, {
          name: image.name,
          size: image.size,
          type: image.type
        });
        formDataWithImages.append('images', image, image.name); // Explicitly set filename
      });
      
      // Debug: Log all FormData entries
      console.log('=== FORMDATA CONTENTS ===');
      for (let [key, value] of formDataWithImages.entries()) {
        if (value instanceof File) {
          console.log(`${key}: File "${value.name}" (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: "${value}"`);
        }
      }
      
      // Verify images are actually in FormData
      const imageEntries = formDataWithImages.getAll('images');
      console.log('Images in FormData:', imageEntries.length);
      imageEntries.forEach((img, i) => {
        if (img instanceof File) {
          console.log(`  Image ${i}: ${img.name} (${img.size} bytes)`);
        }
      });
      
      console.log('Calling onSubmit with FormData...');
      await onSubmit(formDataWithImages);
    } else {
      console.log('No valid images, submitting as JSON...');
      await onSubmit({
        productName: formData.title,
        description: formData.description,
        serviceId: Number(formData.serviceId),
        desiredPrice: parseFloat(formData.desiredPrice),
        location: formData.location,
        isService: true
      });
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
    
    onClose(); // Close modal on success
    
  } catch (error) {
    console.error('=== FORM SUBMISSION ERROR ===', error);
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