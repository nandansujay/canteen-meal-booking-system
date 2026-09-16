import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { UtensilsCrossed } from 'lucide-react';
import client from '../api/client';
import MenuCard from '../components/MenuCard';
import CartBar from '../components/CartBar';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const { user, refreshWallet } = useAuth();

  useEffect(() => {
    loadMenu();
  }, []);

  async function loadMenu() {
    setLoading(true);
    try {
      const { data } = await client.get('/menu');
      setMenu(data.menu);
    } catch (err) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(item, quantity) {
    if (!user) {
      toast.error('Please login to order food');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((c) => c.menu_item_id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menu_item_id === item.id ? { ...c, quantity: c.quantity + quantity } : c
        );
      }
      return [...prev, { menu_item_id: item.id, name: item.name, price: Number(item.price), quantity }];
    });
    toast.success(`${item.name} added to cart`);
  }

  function handleRemoveFromCart(menuItemId) {
    setCart((prev) => prev.filter((c) => c.menu_item_id !== menuItemId));
  }

  async function handlePlaceOrder() {
    setPlacing(true);
    try {
      const items = cart.map((c) => ({ menuItemId: c.menu_item_id, quantity: c.quantity }));
      const { data } = await client.post('/bookings', { items });
      toast.success(data.message, { duration: 6000 });
      setCart([]);
      await loadMenu();
      await refreshWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setPlacing(false);
    }
  }

  const categories = [...new Set(menu.map((m) => m.category))];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 pb-40">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-zinc-100">Today's Menu</h1>
        <p className="text-zinc-500 mt-1">
          Add items to your cart, then place one order — everything in it shares a single pickup counter.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-4 h-32 animate-pulse bg-zinc-800/50" />
          ))}
        </div>
      ) : menu.length === 0 ? (
        <div className="text-center py-16">
          <UtensilsCrossed className="mx-auto text-zinc-700" size={40} />
          <p className="text-zinc-500 mt-3">No items available right now. Check back soon.</p>
        </div>
      ) : (
        categories.map((category) => (
          <div key={category} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
                {category}
              </h2>
              <span className="flex-1 h-px bg-zinc-800" />
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
              {menu
                .filter((item) => item.category === category)
                .map((item) => (
                  <MenuCard key={item.id} item={item} onAdd={handleAddToCart} />
                ))}
            </div>
          </div>
        ))
      )}

      <CartBar cart={cart} onRemove={handleRemoveFromCart} onPlaceOrder={handlePlaceOrder} placing={placing} />
    </div>
  );
}
