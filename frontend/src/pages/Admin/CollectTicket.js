import { useState } from 'react';
import toast from 'react-hot-toast';
import { ScanLine, CheckCircle2 } from 'lucide-react';
import client from '../../api/client';

export default function CollectTicket() {
  const [token, setToken] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setOrder(null);
    try {
      const { data } = await client.post('/admin/collect', { ticketToken: token.trim() });
      toast.success(data.message);
      setOrder(data.order);
      setToken('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to collect ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center mb-4">
          <ScanLine size={26} />
        </span>
        <h1 className="text-2xl font-extrabold text-zinc-100">Collect Ticket</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Enter the student's ticket token to verify and hand over their order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 flex gap-2 mb-6">
        <input
          placeholder="Scan or paste ticket token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          className="input-field flex-1 font-mono text-sm"
        />
        <button type="submit" disabled={loading} className="btn-primary px-5 text-sm">
          {loading ? 'Verifying...' : 'Verify & Collect'}
        </button>
      </form>

      {order ? (
        <div className="card p-5 border-green-900/50 bg-green-500/5">
          <div className="flex items-center gap-2 text-green-400 font-semibold mb-2">
            <CheckCircle2 size={18} />
            Order collected
          </div>
          <p className="text-sm text-zinc-400 mb-2">
            {order.user_name} • {order.counter_name}
          </p>
          <ul className="text-sm text-zinc-300 space-y-0.5">
            {order.items.map((it) => (
              <li key={it.booking_id}>
                {it.quantity} × {it.item_name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-600 text-sm">Waiting for a ticket to verify...</p>
        </div>
      )}
    </div>
  );
}
