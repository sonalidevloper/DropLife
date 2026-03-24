import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NotificationBell.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const DEMO_NOTIFS = [
  { id: 1, title: 'Emergency: O- needed', body: 'Patient in AIIMS requires O- urgently.', time: '2 min ago', read: false, type: 'urgent' },
  { id: 2, title: 'Request approved', body: 'Your blood request REQ-001 was approved.', time: '15 min ago', read: false, type: 'success' },
  { id: 3, title: 'Donation camp nearby', body: 'Red Cross camp in your area on Dec 28.', time: '1 hr ago', read: true, type: 'info' },
  { id: 4, title: 'Stock alert: B-', body: 'B- stock critically low at Fortis Hospital.', time: '3 hr ago', read: true, type: 'warning' },
];

export default function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(DEMO_NOTIFS);
  const dropRef = useRef(null);

  const unreadCount = notifs.filter(n => !n.read).length;

  // Poll for new notifications every 60s
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data?.data?.length) setNotifs(res.data.data);
      } catch { /* use demo */ }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = e => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const getIcon = (type) => {
    if (type === 'urgent') return '⚡';
    if (type === 'success') return '✅';
    if (type === 'warning') return '⚠️';
    return '🔔';
  };

  return (
    <div className="notif-bell-wrap" ref={dropRef}>
      <button className={`notif-bell-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
        onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && (
          <span className="notif-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span className="notif-header-title">Notifications</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {unreadCount > 0 && (
                <button className="btn-ghost" style={{ fontSize: '11px', padding: '4px 8px' }}
                  onClick={markAllRead}>Mark all read</button>
              )}
              <button className="btn-ghost" style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={() => { navigate('/notifications'); setOpen(false); }}>
                View all
              </button>
            </div>
          </div>

          <div className="notif-list-dropdown">
            {notifs.length === 0 ? (
              <div className="notif-empty">
                <span>🔕</span>
                <p>No notifications</p>
              </div>
            ) : notifs.map(n => (
              <button key={n.id} className={`notif-row ${!n.read ? 'unread' : ''}`}
                onClick={() => { markRead(n.id); navigate('/notifications'); setOpen(false); }}>
                <div className={`notif-row-icon ${n.type}`}>{getIcon(n.type)}</div>
                <div className="notif-row-body">
                  <div className="notif-row-title">{n.title}</div>
                  <div className="notif-row-text">{n.body}</div>
                  <div className="notif-row-time">{n.time}</div>
                </div>
                {!n.read && <div className="notif-unread-dot" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}