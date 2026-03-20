import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import api from '../services/api';

const NotificationBell = () => {
  const { token } = useSelector((state) => state.auth);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadCount(res.data.count || 0);
    } catch {
      // silently fail
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=5');
      setNotifications(res.data.notifications || res.data || []);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (!showDropdown) return;
    fetchNotifications();
  }, [showDropdown]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (!token) return null;

  return (
    <div className="position-relative" ref={dropdownRef} style={{ zIndex: 1050 }}>
      <button
        className="btn btn-link text-dark p-1 position-relative border-0"
        onClick={() => setShowDropdown((v) => !v)}
        aria-label="Notifications"
        style={{ fontSize: '1.2rem' }}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: '0.6rem', minWidth: '16px' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div
          className="dropdown-menu show shadow"
          style={{ right: 0, left: 'auto', minWidth: '320px', maxWidth: '360px' }}
        >
          <div className="dropdown-header d-flex justify-content-between align-items-center">
            <span className="fw-bold">Notifications</span>
            {unreadCount > 0 && (
              <span className="badge bg-danger rounded-pill">{unreadCount} unread</span>
            )}
          </div>
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="dropdown-item text-muted text-center py-3">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <button
                  key={n._id}
                  className={`dropdown-item d-flex flex-column py-2 border-bottom ${!n.read ? 'bg-light' : ''}`}
                  onClick={() => markRead(n._id)}
                  style={{ whiteSpace: 'normal', textAlign: 'left' }}
                >
                  <span className="fw-semibold small">{n.title || 'Notification'}</span>
                  <span className="text-muted small text-truncate">{n.message}</span>
                  <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                    {n.createdAt ? timeAgo(n.createdAt) : ''}
                  </span>
                </button>
              ))
            )}
          </div>
          <div className="dropdown-divider m-0" />
          <Link
            to="/notifications"
            className="dropdown-item text-center text-danger fw-semibold small py-2"
            onClick={() => setShowDropdown(false)}
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
