import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessageSquareOff } from 'lucide-react';
import client from '../../api/client';
import StarRating from '../../components/StarRating';

export default function Reviews() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data } = await client.get('/admin/feedback');
      setFeedback(data.feedback);
    } catch (err) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold text-zinc-100 mb-6">Reviews</h1>

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-zinc-800/50" />
          ))}
        </div>
      ) : feedback.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquareOff className="mx-auto text-zinc-700" size={40} />
          <p className="text-zinc-500 mt-3">No reviews submitted yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feedback.map((f) => (
            <div key={f.feedback_id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-zinc-200">{f.item_name}</p>
                <StarRating value={f.rating} readOnly size={14} />
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                {f.user_name} • Order #{f.order_id} • {new Date(f.created_at).toLocaleString()}
              </p>
              {f.comment && <p className="text-sm text-zinc-400 mt-2">{f.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
