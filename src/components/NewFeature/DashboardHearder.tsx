// DashboardHeader.tsx
import { BellIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export function DashboardHeader({ 
  title, 
  onRefresh, 
  refreshing,
  notifications,
  unreadCount,
  showNotifications,
  onToggleNotifications
}: {
  title: string;
  onRefresh: () => void;
  refreshing: boolean;
  notifications: any[];
  unreadCount: number;
  showNotifications: boolean;
  onToggleNotifications: () => void;
}) {
  const { logout } = useAuth();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center justify-end sm:justify-normal space-x-2 sm:space-x-3 w-full sm:w-auto">
          <button 
            onClick={onRefresh}
            disabled={refreshing}
            className={`p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${
              refreshing ? 'bg-gray-100' : ''
            }`}
            title="Refresh"
          >
            <ArrowPathIcon className={`h-4 w-4 sm:h-5 sm:w-5 ${
              refreshing ? 'text-blue-500 animate-spin' : 'text-gray-600'
            }`} />
          </button>
          
          <div className="relative">
            <button 
              onClick={onToggleNotifications}
              className="p-1 sm:p-2 rounded-full hover:bg-gray-100"
            >
              <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 sm:h-3 sm:w-3 bg-red-500 rounded-full"></span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-md shadow-lg overflow-hidden z-10">
                <div className="py-1">
                  {notifications.length === 0 ? (
                    <div className="px-3 py-2 text-xs sm:text-sm text-gray-700">No notifications</div>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`px-3 py-2 text-xs sm:text-sm ${!notification.isRead ? 'bg-blue-50' : ''}`}
                      >
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-gray-600">{notification.message}</p>
                        <p className="text-xxs sm:text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={logout}
            className="text-xs sm:text-sm text-red-600 hover:text-red-800 px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 rounded hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}