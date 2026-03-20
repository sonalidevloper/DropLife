import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Badge, Button, Nav, Spinner } from 'react-bootstrap';
import { FaBell, FaCheck, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

const ICON_MAP = {
  blood_request: '🩸',
  delivery: '🚚',
  system: '⚙️',
  alert: '⚠️',
  info: 'ℹ️',
  success: '✅',
  default: '🔔',
};

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const NotificationsPage = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [marking, setMarking] = useState(false);
  const PER_PAGE = 20;

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await api.get(`/notifications?page=${pageNum}&limit=${PER_PAGE}`);
      const data = Array.isArray(res.data) ? res.data : res.data.notifications || [];
      if (append) {
        setNotifications((prev) => [...prev, ...data]);
      } else {
        setNotifications(data);
      }
      setHasMore(data.length === PER_PAGE);
    } catch {
      if (!append) setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
    const interval = setInterval(() => fetchNotifications(1), 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch {
      // silently fail
    }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    } finally {
      setMarking(false);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notification deleted');
    } catch {
      toast.error('Failed to delete notification');
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage, true);
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">
            <FaBell className="text-warning me-2" />
            {t('notifications.title', 'Notifications')}
          </h2>
          {unreadCount > 0 && (
            <Badge bg="danger" className="mt-1">{unreadCount} unread</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline-danger"
            size="sm"
            onClick={markAllRead}
            disabled={marking}
          >
            <FaCheckDouble className="me-1" />
            {t('notifications.markAllRead', 'Mark All Read')}
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <Nav variant="pills" className="mb-4 gap-2">
        {['All', 'Unread', 'Read'].map((f) => (
          <Nav.Item key={f}>
            <Nav.Link
              active={filter === f}
              onClick={() => setFilter(f)}
              style={{ cursor: 'pointer' }}
              className={filter === f ? 'bg-danger text-white' : 'text-muted'}
            >
              {f}
              {f === 'Unread' && unreadCount > 0 && (
                <Badge bg="light" text="dark" className="ms-1">{unreadCount}</Badge>
              )}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      {/* Content */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" />
          <p className="mt-2 text-muted">Loading notifications...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <div style={{ fontSize: '4rem' }}>🔔</div>
          <h5 className="text-muted mt-3">
            {t('notifications.noNotifications', 'No notifications yet')}
          </h5>
          <p className="text-muted small">You're all caught up!</p>
        </div>
      ) : (
        <>
          {filtered.map((n) => (
            <Card
              key={n._id}
              className={`mb-2 shadow-sm ${!n.read ? 'border-start border-4 border-danger' : ''}`}
              style={{ cursor: !n.read ? 'pointer' : 'default' }}
              onClick={() => !n.read && markRead(n._id)}
            >
              <Card.Body className="d-flex align-items-start gap-3 py-3">
                <div style={{ fontSize: '1.6rem', lineHeight: 1 }}>
                  {ICON_MAP[n.type] || ICON_MAP.default}
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="fw-semibold">
                      {n.title || 'Notification'}
                      {!n.read && <Badge bg="danger" className="ms-2 small">New</Badge>}
                    </div>
                    <div className="text-muted small ms-2 text-nowrap">
                      {n.createdAt ? timeAgo(n.createdAt) : ''}
                    </div>
                  </div>
                  <p className="mb-0 text-muted small mt-1">{n.message}</p>
                </div>
                <div className="d-flex flex-column gap-1">
                  {!n.read && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); markRead(n._id); }}
                      title="Mark as read"
                    >
                      <FaCheck />
                    </Button>
                  )}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n._id); }}
                    title="Delete"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}

          {hasMore && (
            <div className="text-center mt-3">
              <Button variant="outline-danger" onClick={loadMore}>
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default NotificationsPage;
