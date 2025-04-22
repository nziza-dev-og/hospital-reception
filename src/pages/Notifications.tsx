import  { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Notification } from '../types';

const Notifications = () => {
  const { userProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userProfile) {
        setLoading(false);
        return;
      }
      
      try {
        const notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', userProfile.id),
          orderBy('createdAt', 'desc')
        );
        
        const snapshot = await getDocs(notificationsQuery);
        
        // If no real notifications exist, create sample ones
        if (snapshot.empty) {
          // Create sample notifications for demo
          const sampleNotifications: Notification[] = [
            {
              id: '1',
              title: 'New Appointment Scheduled',
              message: 'A new appointment has been scheduled for tomorrow at 10:00 AM.',
              type: 'info',
              read: false,
              userId: userProfile.id,
              createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
            },
            {
              id: '2',
              title: 'Critical Patient Alert',
              message: 'Patient John Doe has been marked as critical and requires immediate attention.',
              type: 'error',
              read: false,
              userId: userProfile.id,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
              id: '3',
              title: 'Staff Meeting Reminder',
              message: 'Don\'t forget the weekly staff meeting today at 4:00 PM in Conference Room A.',
              type: 'info',
              read: true,
              userId: userProfile.id,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5) // 5 hours ago
            },
            {
              id: '4',
              title: 'System Maintenance',
              message: 'The system will be undergoing maintenance tonight from 2:00 AM to 4:00 AM.',
              type: 'warning',
              read: true,
              userId: userProfile.id,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            },
            {
              id: '5',
              title: 'New Feature Added',
              message: 'A new appointment scheduling feature has been added to the system.',
              type: 'success',
              read: true,
              userId: userProfile.id,
              createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
            }
          ];
          
          setNotifications(sampleNotifications);
        } else {
          const notificationsList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              ...data,
              createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
              id: doc.id
            } as Notification;
          });
          
          setNotifications(notificationsList);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotifications();
  }, [userProfile]);
  
  const markAsRead = async (id: string) => {
    try {
      // Mark the notification as read in state first for immediate UI update
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // In a real app, we would update the database
      // await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to update notification');
    }
  };
  
  const markAllAsRead = async () => {
    try {
      // Mark all notifications as read in state for immediate UI update
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      // In a real app, we would update the database for each notification
      // await Promise.all(
      //   notifications.filter(n => !n.read).map(n => 
      //     updateDoc(doc(db, 'notifications', n.id), { read: true })
      //   )
      // );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to update notifications');
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Bell className="h-5 w-5 text-secondary-400" />;
    }
  };
  
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return format(date, 'MMM d, yyyy');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loader" />
      </div>
    );
  }
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-secondary-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-sm text-secondary-500">
              You have {unreadCount} unread notification{unreadCount !== 1 && 's'}
            </p>
          )}
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center px-3 py-1.5 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50"
          >
            <CheckCircle className="mr-1.5 h-4 w-4 text-secondary-500" />
            Mark all as read
          </button>
        )}
      </div>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
        {notifications.length > 0 ? (
          <ul className="divide-y divide-secondary-200">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={`px-4 py-4 hover:bg-secondary-50 ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 pt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${!notification.read ? 'text-primary-700' : 'text-secondary-900'}`}>
                        {notification.title}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className="text-xs text-secondary-500 flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {formatTime(new Date(notification.createdAt))}
                        </p>
                      </div>
                    </div>
                    <p className={`mt-1 text-sm ${!notification.read ? 'text-primary-600' : 'text-secondary-500'}`}>
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <div className="mt-2">
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs font-medium text-primary-600 hover:text-primary-500"
                        >
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-secondary-400" />
            <h3 className="mt-2 text-sm font-medium text-secondary-900">No notifications</h3>
            <p className="mt-1 text-sm text-secondary-500">
              You don't have any notifications at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
 