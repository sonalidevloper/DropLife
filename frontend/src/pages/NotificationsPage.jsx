import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Container, Card, Badge, Button, Nav, Spinner } from 'react-bootstrap';
import { FaBell, FaCheck, FaTrash, FaCheckDouble } from 'react-icons/fa';
import { toast } from 'react-toastify';
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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [marking, setMarking] = useState(false);

  const PER_PAGE = 20;

  // 🔥 FETCH
  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const res = await api.get(`/notifications?page=${pageNum}&limit=${PER_PAGE}`);
      const data = res.data?.notifications || res.data || [];

      setNotifications(prev =>
        append ? [...prev, ...data] : data
      );

      setHasMore(data.length === PER_PAGE);
    } catch {
      if (!append) setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  // 🔥 FILTERED (useMemo)
  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'Unread') return !n.isRead;
      if (filter === 'Read') return n.isRead;
      return true;
    });
  }, [notifications, filter]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  // 🔥 MARK ONE
  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch {}
  };

  // 🔥 MARK ALL
  const markAllRead = async () => {
    setMarking(true);

    try {
      await api.put('/notifications/read-all');

      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      );

      toast.success('All marked as read');
    } catch {
      toast.error('Failed');
    } finally {
      setMarking(false);
    }
  };

  // 🔥 DELETE
  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);

      setNotifications(prev =>
        prev.filter(n => n._id !== id)
      );

      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  // 🔥 LOAD MORE
  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchNotifications(next, true);
  };

  return (
    <Container className="py-4" style={{ maxWidth: 800 }}>

      {/* HEADER */}
      <div className="d-flex justify-content-between mb-4">
        <h2><FaBell /> Notifications</h2>

        {unreadCount > 0 && (
          <Button
            variant="outline-danger"
            onClick={markAllRead}
            disabled={marking}
          >
            <FaCheckDouble /> Mark All
          </Button>
        )}
      </div>

      {/* FILTER */}
      <Nav className="mb-3">
        {['All', 'Unread', 'Read'].map(f => (
          <Nav.Link
            key={f}
            active={filter === f}
            onClick={() => {
              setFilter(f);
              setPage(1); // 🔥 FIX
            }}
          >
            {f}
          </Nav.Link>
        ))}
      </Nav>

      {/* CONTENT */}
      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <div>No notifications</div>
      ) : (
        <>
          {filtered.map(n => (
            <Card key={n._id} className="mb-2">
              <Card.Body
                onClick={() => !n.isRead && markRead(n._id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex justify-content-between">
                  <div>
                    {ICON_MAP[n.type] || '🔔'} {n.title}
                    {!n.isRead && <Badge bg="danger">New</Badge>}
                  </div>
                  <small>{timeAgo(n.createdAt)}</small>
                </div>

                <p>{n.message}</p>

                <div className="d-flex gap-2">
                  {!n.isRead && (
                    <Button size="sm" onClick={(e) => {
                      e.stopPropagation();
                      markRead(n._id);
                    }}>
                      <FaCheck />
                    </Button>
                  )}

                  <Button size="sm" onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(n._id);
                  }}>
                    <FaTrash />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}

          {hasMore && (
            <Button onClick={loadMore}>
              Load More
            </Button>
          )}
        </>
      )}

    </Container>
  );
};

export default NotificationsPage;