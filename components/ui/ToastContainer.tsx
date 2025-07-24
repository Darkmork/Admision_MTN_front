import React from 'react';
import Toast from './Toast';
import { useNotifications } from '../../context/AppContext';

const ToastContainer: React.FC = () => {
    const { notifications, markAsRead } = useNotifications();
    
    const handleClose = (id: string) => {
        markAsRead(id);
    };

    return (
        <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
            {notifications
                .filter(notification => !notification.read)
                .slice(0, 5) // Show max 5 toasts
                .map((notification, index) => (
                    <div 
                        key={notification.id}
                        style={{ 
                            transform: `translateY(${index * 10}px)`,
                            zIndex: 50 - index 
                        }}
                    >
                        <Toast
                            id={notification.id}
                            type={notification.type}
                            title={notification.title}
                            message={notification.message}
                            onClose={handleClose}
                        />
                    </div>
                ))
            }
        </div>
    );
};

export default ToastContainer;