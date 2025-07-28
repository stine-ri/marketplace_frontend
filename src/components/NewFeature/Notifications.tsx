// components/Notifications.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import  useWebSocket  from '../../hooks/useWebSocket';
import { useAuth } from '../../context/AuthContext';
export function Notifications() {
  const [allNotifications, setAllNotifications] = useState<any[]>([]);
    const { user } = useAuth();
 const userId = user?.userId;
    const { notifications: realTimeNotifications } = useWebSocket(userId);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/notifications');
        setAllNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotifications();
  }, []);

  // Combine server and real-time notifications
  const combinedNotifications = [...allNotifications, ...realTimeNotifications]
    .filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const markAsRead = async (id: number) => {
    try {
      await axios.patch(`/api/notifications/${id}/read`);
      setAllNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg z-50">
      <div className="p-4 border-b">
        <h3 className="font-bold">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {combinedNotifications.length === 0 ? (
          <div className="p-4 text-gray-500">No notifications</div>
        ) : (
          combinedNotifications.map(notification => (
            <div 
              key={notification.id} 
              className={`p-4 border-b ${!notification.isRead ? 'bg-blue-50' : ''}`}
              onClick={() => markAsRead(notification.id)}
            >
              <h4 className="font-semibold">{notification.title}</h4>
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}