import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Ticket } from 'lucide-react';
import client from '../api/client';
import TicketCard from '../components/TicketCard';
import { useAuth } from '../context/AuthContext';

export default function MyBookings() {
  const [orders, setOrders] = useState([]);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [loading, setLoading] = useState(true);
  const { refreshWallet } = useAuth();

  useEffect(() => {
    loadOrders();
    loadFeedback();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const { data } = await client.get('/bookings/my');
      setOrders(data.orders);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  async function loadFeedback() {
    try {
      const { data } = await client.get('/feedback/my');
      const map = {};
      data.feedback.forEach((f) => {
        map[f.booking_id] = f.rating;
      });
      setFeedbackMap(map);
    } catch (err) {
      // Non-critical: if this fails, rating widgets just stay interactive
    }
  }

  async function handleCancel(orderId) {
    try {
      const { data } = await client.post(`/bookings/${orderId}/cancel`);
      toast.success(data.message);
      await loadOrders();
      await refreshWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  }

  async function handleRate(bookingId, rating) {
    try {
      await client.post('/feedback', { bookingId, rating });
      toast.success('Thanks for your feedback!');
      setFeedbackMap((prev) => ({ ...prev, [bookingId]: rating }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit rating');
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-zinc-100 mb-8">My Orders</h1>

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-zinc-800/50" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="mx-auto text-zinc-700" size={40} />
          <p className="text-zinc-500 mt-3">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <TicketCard
              key={o.order_id}
              order={o}
              onCancel={handleCancel}
              feedbackMap={feedbackMap}
              onRate={handleRate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
