import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="text-center mt-24">
      <UtensilsCrossed className="mx-auto text-zinc-700" size={40} />
      <h1 className="text-2xl font-extrabold text-zinc-100 mt-4">Page not found</h1>
      <p className="text-zinc-500 mt-1">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary inline-block mt-5 px-5 py-2 text-sm">
        Go back home
      </Link>
    </div>
  );
}
