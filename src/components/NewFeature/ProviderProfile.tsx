// src/components/ProviderProfile.tsx
import { useEffect, useState } from 'react';
import { ProviderProfileFormData, Service, College } from '../../types/types';

interface ProviderProfileProps {
  profile: ProviderProfileFormData;
  colleges: College[];
  services: Service[];
}

export default function ProviderProfile({ profile, colleges, services }: ProviderProfileProps) {
  const [currentCollege, setCurrentCollege] = useState<College | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  useEffect(() => {
    // Find the college matching the profile's collegeId
    if (profile.collegeId && colleges.length > 0) {
      const college = colleges.find(c => c.id === profile.collegeId);
      if (college) setCurrentCollege(college);
    }

    // Map service IDs to service objects
    if (profile.services && services.length > 0) {
      const matchedServices = services.filter(service => 
        profile.services.some(s => s.id === service.id)
      );
      setSelectedServices(matchedServices);
    }
  }, [profile, colleges, services]);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      {/* Profile Header with Image and Basic Info */}
      <div className="bg-gray-50 p-6 md:p-8 flex flex-col md:flex-row items-start">
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 md:mb-0 md:mr-6">
          {profile.profileImageUrl ? (
            <img 
              src={profile.profileImageUrl} 
              alt={`${profile.firstName} ${profile.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-400">
                {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {profile.firstName} {profile.lastName}
          </h1>
          
          {currentCollege && (
            <div className="flex items-center mt-2 text-gray-600">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>{currentCollege.name}</span>
            </div>
          )}
          
          {profile.rating !== null && profile.rating > 0 && (
            <div className="flex items-center mt-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                   className={`w-5 h-5 ${i < (profile.rating ?? 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="ml-1 text-gray-600">
                ({profile.completedRequests || 0} {profile.completedRequests === 1 ? 'request' : 'requests'})
              </span>
            </div>
          )}
          
          {profile.phoneNumber && (
            <div className="flex items-center mt-2 text-gray-600">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{profile.phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Profile Content */}
      <div className="p-6 md:p-8">
        {/* Services Section */}
        {selectedServices.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Services Offered</h2>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map(service => (
                <span 
                  key={service.id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {service.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Location Section */}
        {(profile.address || (profile.latitude && profile.longitude)) && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Location</h2>
            {profile.address && (
              <div className="flex items-start mb-2">
                <svg className="w-5 h-5 mt-0.5 mr-2 flex-shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-700">{profile.address}</p>
              </div>
            )}
            
            {profile.latitude && profile.longitude && (
              <div className="mt-4 rounded-lg overflow-hidden">
                <iframe
                  width="100%"
                  height="300"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${profile.latitude},${profile.longitude}&z=15&output=embed`}
                  className="border-0"
                ></iframe>
              </div>
            )}
          </div>
        )}
        
        {/* Bio Section */}
        {profile.bio && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">About Me</h2>
            <p className="text-gray-700 whitespace-pre-line">{profile.bio}</p>
          </div>
        )}
        
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{profile.completedRequests || 0}</div>
            <div className="text-sm text-gray-500">Completed Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {profile.rating !== null && profile.rating > 0 ? profile.rating.toFixed(1) : 'New'}
            </div>
            <div className="text-sm text-gray-500">Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{selectedServices.length}</div>
            <div className="text-sm text-gray-500">Services Offered</div>
          </div>
        </div>
      </div>
    </div>
  );
}