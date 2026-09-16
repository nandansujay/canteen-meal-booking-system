import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UtensilsCrossed, Wallet, Ticket, LogOut, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const isAdmin = user && user.role === 'admin';

  return (
    <nav className="sticky top-0 z-10 bg-zinc-900/90 backdrop-blur border-b border-zinc-800 px-6 py-3.5 flex items-center justify-between">
      <Link
        to={isAdmin ? '/admin' : '/'}
        className="flex items-center gap-2 font-extrabold text-lg text-zinc-100"
      >
        <span className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
          {isAdmin ? <ShieldCheck size={18} /> : <UtensilsCrossed size={18} />}
        </span>
        Canteen
        {isAdmin && (
          <span className="text-xs font-semibold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full ml-1">
            Admin
          </span>
        )}
      </Link>

      {user ? (
        <div className="flex items-center gap-6 text-sm">
          {!isAdmin && (
            <>
              <Link to="/" className="text-zinc-400 hover:text-zinc-100 font-medium transition-colors">
                Menu
              </Link>
              <Link
                to="/my-bookings"
                className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 font-medium transition-colors"
              >
                <Ticket size={16} /> My Bookings
              </Link>
              <Link
                to="/wallet"
                className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-100 font-medium transition-colors"
              >
                <Wallet size={16} />
                <span className="text-brand-400 font-semibold">₹{Number(user.wallet_balance).toFixed(2)}</span>
              </Link>
            </>
          )}
          <span className="h-5 w-px bg-zinc-700" />
          <span className="text-zinc-500">{user.name}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 font-medium transition-colors"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm">
          <Link to="/login" className="text-zinc-400 hover:text-zinc-100 font-medium px-3 py-1.5">
            Login
          </Link>
          <Link to="/register" className="btn-primary px-4 py-1.5">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
