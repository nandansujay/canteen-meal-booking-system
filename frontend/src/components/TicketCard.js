import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Clock } from 'lucide-react';
import StarRating from './StarRating';

const STATUS_STYLES = {
  placed: 'bg-blue-500/10 text-blue-400',
  collected: 'bg-green-500/10 text-green-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

function ItemFeedback({ item, existingRating, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  if (existingRating) {
    return (
      <div className="flex items-center gap-2">
        <StarRating value={existingRating} readOnly size={13} />
        <span className="text-xs text-zinc-600">Reviewed</span>
      </div>
    );
  }

  async function handleRate(n) {
    setRating(n);
    setSubmitting(true);
    try {
      await onSubmit(item.booking_id, n);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`flex items-center gap-2 ${submitting ? 'opacity-50 pointer-events-none' : ''}`}>
      <StarRating value={rating} onChange={handleRate} size={15} />
      <span className="text-xs text-zinc-500">Rate this item</span>
    </div>
  );
}

export default function TicketCard({ order, onCancel, feedbackMap, onRate }) {
  return (
    <div className="card p-5 flex gap-5">
      <div className="shrink-0 p-2 bg-zinc-100 rounded-lg h-fit">
        <QRCodeSVG value={order.ticket_token} size={84} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-zinc-100">Order #{order.order_id}</h3>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase ${STATUS_STYLES[order.status]}`}>
            {order.status}
          </span>
        </div>

        <ul className="text-sm text-zinc-400 mt-1.5 space-y-1.5">
          {order.items.map((it) => (
            <li key={it.booking_id}>
              <div>
                {it.quantity} × {it.item_name}
              </div>
              {order.status === 'collected' && (
                <div className="mt-1">
                  <ItemFeedback
                    item={it}
                    existingRating={feedbackMap?.[it.booking_id]}
                    onSubmit={onRate}
                  />
                </div>
              )}
            </li>
          ))}
        </ul>
        <p className="text-sm text-zinc-500 mt-2 font-medium">
          Total ₹{Number(order.total_amount).toFixed(2)}
        </p>

        <div className="flex items-center gap-4 mt-2 text-sm text-zinc-300">
          <span className="flex items-center gap-1">
            <MapPin size={14} className="text-brand-500" />
            <strong>{order.counter_name}</strong>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} className="text-brand-500" />
            <strong>{order.pickup_time}</strong>
          </span>
        </div>

        <p className="text-xs text-zinc-600 mt-2 break-all font-mono">{order.ticket_token}</p>

        {order.status === 'placed' && (
          <button
            onClick={() => onCancel(order.order_id)}
            className="mt-3 text-sm font-medium text-red-400 hover:text-red-300"
          >
            Cancel order
          </button>
        )}
      </div>
    </div>
  );
}
