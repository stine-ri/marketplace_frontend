// import { useState } from 'react';
// import { Request } from '../../types/types';
// import { useData } from '../../context/DataContext';

// interface RequestCardProps {
//   request: Request;
//   onPlaceBid: (requestId: number, price: number, message: string) => void;
// }

// export function RequestCard({ request, onPlaceBid }: RequestCardProps) {
//   const { services, colleges } = useData();
//   const [bidPrice, setBidPrice] = useState(request.desiredPrice);
//   const [bidMessage, setBidMessage] = useState('');
//   const [isBidding, setIsBidding] = useState(false);

//   // Find service and college names
//   const serviceName = services.find(s => s.id === request.serviceId)?.name || 'Unknown Service';
//   const collegeName = colleges.find(c => c.id === request.collegeFilterId)?.name || 'Any College';

//   const handlePlaceBid = async () => {
//     if (bidPrice <= 0) return;
    
//     setIsBidding(true);
//     try {
//       await onPlaceBid(request.id, bidPrice, bidMessage);
//       setBidMessage('');
//     } finally {
//       setIsBidding(false);
//     }
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow-md">
//       <div className="flex justify-between items-start">
//         <div>
//           <h3 className="text-lg font-semibold">
//             {request.isService ? `Service: ${serviceName}` : `Product: ${request.productName}`}
//           </h3>
//           <div className="mt-2 space-y-1">
//             <p className="text-gray-600">
//               <span className="font-medium">Location:</span> {request.location}
//             </p>
//             <p className="text-gray-600">
//               <span className="font-medium">Client's Price:</span> ${request.desiredPrice.toFixed(2)}
//             </p>
//             {request.isService && request.collegeFilterId && (
//               <p className="text-gray-600">
//                 <span className="font-medium">College Requirement:</span> {collegeName}
//               </p>
//             )}
//           </div>
//         </div>
//         <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
//           {new Date(request.createdAt).toLocaleDateString()}
//         </span>
//       </div>

//       <div className="mt-4 pt-4 border-t">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Your Bid Price ($)
//             </label>
//             <input
//               type="number"
//               min="0.01"
//               step="0.01"
//               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//               value={bidPrice}
//               onChange={(e) => setBidPrice(parseFloat(e.target.value) || 0)}
//               required
//             />
//           </div>
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Message to Client (optional)
//             </label>
//             <input
//               type="text"
//               className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
//               value={bidMessage}
//               onChange={(e) => setBidMessage(e.target.value)}
//               placeholder="Why should the client choose you?"
//             />
//           </div>
//         </div>
//         <button
//           onClick={handlePlaceBid}
//           disabled={isBidding}
//           className={`mt-3 px-4 py-2 rounded text-white font-medium ${
//             isBidding ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
//           }`}
//         >
//           {isBidding ? 'Submitting Bid...' : 'Place Bid'}
//         </button>
//       </div>
//     </div>
//   );
// }