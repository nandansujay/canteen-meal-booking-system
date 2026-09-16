import { useState } from 'react';
import { ChevronUp, ChevronDown, ShoppingCart, X } from 'lucide-react';

export default function CartBar({ cart, onRemove, onPlaceOrder, placing }) {
  const [expanded, setExpanded] = useState(false);
  if (cart.length === 0) return null;

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
      <div className="max-w-5xl mx-auto px-6 pb-6 pointer-events-auto">
        <div className="card shadow-2xl overflow-hidden">
          {expanded && (
            <div className="border-b border-zinc-800 divide-y divide-zinc-800 max-h-48 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.menu_item_id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-zinc-300">
                    {item.quantity} × {item.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">₹{(item.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => onRemove(item.menu_item_id)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center justify-between px-4 py-3 text-sm"
          >
            <span className="flex items-center gap-2 text-zinc-200 font-medium">
              <ShoppingCart size={16} className="text-brand-500" />
              {itemCount} item{itemCount > 1 ? 's' : ''} · ₹{total.toFixed(2)}
            </span>
            {expanded ? (
              <ChevronDown size={16} className="text-zinc-500" />
            ) : (
              <ChevronUp size={16} className="text-zinc-500" />
            )}
          </button>
          <div className="px-4 pb-4">
            <button onClick={onPlaceOrder} disabled={placing} className="btn-primary w-full py-2.5 text-sm">
              {placing ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
