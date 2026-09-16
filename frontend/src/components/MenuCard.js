import { useState } from 'react';
import { Minus, Plus, UtensilsCrossed } from 'lucide-react';

export default function MenuCard({ item, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);
  const soldOut = item.available_units <= 0;
  const lowStock = !soldOut && item.available_units <= 3;

  function handleAdd() {
    onAdd(item, quantity);
    setQuantity(1);
  }

  return (
    <div className="card overflow-hidden flex flex-col hover:border-zinc-700 transition-colors">
      <div className="h-28 bg-zinc-800 flex items-center justify-center overflow-hidden">
        {item.image_url && !imgError ? (
          <img
            src={item.image_url}
            alt={item.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <UtensilsCrossed className="text-zinc-700" size={26} />
        )}
      </div>

      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-zinc-100 leading-tight">{item.name}</h3>
          <span className="shrink-0 text-lg font-bold text-brand-400">₹{Number(item.price).toFixed(0)}</span>
        </div>

        <span
          className={`text-xs font-medium ${
            soldOut ? 'text-red-400' : lowStock ? 'text-amber-400' : 'text-green-400'
          }`}
        >
          {soldOut ? 'Sold out' : lowStock ? `Only ${item.available_units} left!` : `${item.available_units} available`}
        </span>

        {!soldOut && (
          <div className="flex items-center justify-between mt-auto pt-1">
            <div className="flex items-center border border-zinc-700 rounded-lg">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-1.5 py-1 text-zinc-400 hover:text-zinc-100"
              >
                <Minus size={12} />
              </button>
              <span className="w-5 text-center text-xs font-medium text-zinc-100">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(item.available_units, q + 1))}
                className="px-1.5 py-1 text-zinc-400 hover:text-zinc-100"
              >
                <Plus size={12} />
              </button>
            </div>
            <button onClick={handleAdd} className="btn-primary text-xs px-3.5 py-1.5">
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
