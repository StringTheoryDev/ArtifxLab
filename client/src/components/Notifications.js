import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        
        const { data } = await axios.get('http://localhost:5000/api/notifications', config);
        setNotifications(data);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };
    
    fetchNotifications();
  }, []);
  
  const handleClose = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      
      await axios.put(`http://localhost:5000/api/notifications/${id}/seen`, {}, config);
      
      // Remove from state if seen twice
      setNotifications(notifications.map(notif => {
        if (notif.id === id) {
          return { ...notif, seen_count: notif.seen_count + 1 };
        }
        return notif;
      }).filter(notif => notif.seen_count < 2));
      
    } catch (err) {
      console.error('Error updating notification:', err);
    }
  };
  
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
      {notifications.map((notification) => (
        <Toast 
          key={notification.id} 
          onClose={() => handleClose(notification.id)}
          show={true}
          delay={10000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
            <small>
              {new Date(notification.created_at).toLocaleDateString()}
            </small>
          </Toast.Header>
          <Toast.Body>{notification.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default Notifications;