// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useWebSocket } from '../../hooks/useWebSocket';
// import { useData } from '../../context/DataContext';
// import { useGeolocated } from 'react-geolocated';

// export default function RequestForm() {
//   const { services, colleges } = useData();
//   const [isLoading, setIsLoading] = useState(false);
//   const [submitSuccess, setSubmitSuccess] = useState(false);
//   const [location, setLocation] = useState({
//     address: '',
//     coordinates: { lat: 0, lng: 0 }
//   });

//   const [formData, setFormData] = useState({
//     serviceId: undefined,
//     productName: '',
//     isService: true,
//     description: '',
//     desiredPrice: 0,
//     location: '',
//     collegeFilterId: undefined
//   });

//   const { coords } = useGeolocated({
//     positionOptions: { enableHighAccuracy: true },
//     userDecisionTimeout: 5000,
//   });

//   useEffect(() => {
//     if (coords) {
//       setLocation(prev => ({
//         ...prev,
//         coordinates: {
//           lat: coords.latitude,
//           lng: coords.longitude
//         }
//       }));
//     }
//   }, [coords]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
    
//     try {
//       await axios.post('/api/client/requests', {
//         ...formData,
//         latitude: location.coordinates.lat,
//         longitude: location.coordinates.lng
//       });
      
//       setSubmitSuccess(true);
//       // Reset form
//       setFormData({
//         serviceId: undefined,
//         productName: '',
//         isService: true,
//         description: '',
//         desiredPrice: 0,
//         location: '',
//         collegeFilterId: undefined
//       });
//       setLocation({
//         address: '',
//         coordinates: { lat: 0, lng: 0 }
//       });
//     } catch (error) {
//       console.error('Error submitting request:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
//       <h2 className="text-xl font-bold mb-4">Request a Service/Product</h2>
      
//       <form onSubmit={handleSubmit}>
//         {/* Existing form fields */}
//         {/* Add description field */}
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//           <textarea
//             className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//             value={formData.description}
//             onChange={(e) => setFormData({...formData, description: e.target.value})}
//             required
//           />
//         </div>
        
//         {/* Rest of your form */}
//       </form>
//     </div>
//   );
// }