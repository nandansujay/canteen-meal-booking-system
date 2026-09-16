import { Link, Outlet, useLocation } from 'react-router-dom';
import { ScanLine, LayoutGrid, UtensilsCrossed, Star } from 'lucide-react';

export default function Dashboard() {
  const location = useLocation();
  const isRoot = location.pathname === '/admin';

  const tabs = [
    { path: '/admin/collect', label: 'Collect Ticket', icon: ScanLine },
    { path: '/admin/counters', label: 'Counter Load', icon: LayoutGrid },
    { path: '/admin/menu', label: 'Manage Menu', icon: UtensilsCrossed },
    { path: '/admin/reviews', label: 'Reviews', icon: Star },
  ];

  return (
    <div>
      <div className="border-b border-zinc-800 px-6">
        <div className="flex gap-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = location.pathname === t.path;
            return (
              <Link
                key={t.path}
                to={t.path}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  active
                    ? 'text-brand-400 border-brand-500'
                    : 'text-zinc-500 border-transparent hover:text-zinc-300'
                }`}
              >
                <Icon size={15} />
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      {isRoot ? (
        <p className="text-center text-zinc-600 mt-16">Choose an admin tool above.</p>
      ) : (
        <Outlet />
      )}
    </div>
  );
}
