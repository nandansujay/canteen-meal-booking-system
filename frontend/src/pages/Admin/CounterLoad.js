import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import client from '../../api/client';

export default function CounterLoad() {
  const [counters, setCounters] = useState([]);
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    load();
    intervalRef.current = setInterval(load, 5000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      const [counterRes, salesRes, summaryRes] = await Promise.all([
        client.get('/admin/counter-load'),
        client.get('/admin/daily-sales'),
        client.get('/admin/sales-summary'),
      ]);
      setCounters(counterRes.data.counters);
      setSales(salesRes.data.sales);
      setSummary(summaryRes.data.summary);
      setError(false);
    } catch (err) {
      setError(true);
      clearInterval(intervalRef.current);
      toast.error(err.response?.data?.message || 'Failed to load dashboard data');
    }
  }

  const today = sales[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-zinc-100">Counter Load</h1>
        {!error && <span className="text-xs text-zinc-500">Live • updates every 5s</span>}
      </div>

      {error ? (
        <div className="text-center py-16 border-2 border-dashed border-zinc-800 rounded-xl">
          <p className="text-zinc-500 text-sm">
            Couldn't load dashboard data. Try logging out and back in.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {counters.map((c) => (
              <div key={c.counter_id} className="card p-5 text-center">
                <p className="font-semibold text-zinc-300">{c.counter_name}</p>
                <p className="text-4xl font-extrabold text-brand-400 mt-3">{c.orders_today}</p>
                <p className="text-xs text-zinc-500 mt-1">orders today</p>
                <p className="text-sm text-zinc-400 mt-2 border-t border-zinc-800 pt-2">{c.units_today} units</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Sales</h2>
            <span className="flex-1 h-px bg-zinc-800" />
            {summary && (
              <span className="text-xs text-zinc-500">
                All-time: <strong className="text-zinc-300">₹{Number(summary.revenue).toFixed(2)}</strong> across{' '}
                <strong className="text-zinc-300">{summary.total_orders}</strong> orders
              </span>
            )}
          </div>

          {today && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="card p-4 text-center">
                <p className="text-2xl font-extrabold text-brand-400">₹{Number(today.revenue).toFixed(0)}</p>
                <p className="text-xs text-zinc-500 mt-1">today's revenue</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-extrabold text-zinc-200">{today.total_orders}</p>
                <p className="text-xs text-zinc-500 mt-1">total orders</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-extrabold text-green-400">{today.collected_orders}</p>
                <p className="text-xs text-zinc-500 mt-1">collected</p>
              </div>
              <div className="card p-4 text-center">
                <p className="text-2xl font-extrabold text-red-400">{today.cancelled_orders}</p>
                <p className="text-xs text-zinc-500 mt-1">cancelled</p>
              </div>
            </div>
          )}

          {sales.length > 1 && (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500 border-b border-zinc-800">
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium text-right">Orders</th>
                    <th className="px-4 py-2 font-medium text-right">Collected</th>
                    <th className="px-4 py-2 font-medium text-right">Cancelled</th>
                    <th className="px-4 py-2 font-medium text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.slice(1).map((row) => (
                    <tr key={row.sale_date} className="border-b border-zinc-800 last:border-0 text-zinc-300">
                      <td className="px-4 py-2">{new Date(row.sale_date).toLocaleDateString()}</td>
                      <td className="px-4 py-2 text-right">{row.total_orders}</td>
                      <td className="px-4 py-2 text-right text-green-400">{row.collected_orders}</td>
                      <td className="px-4 py-2 text-right text-red-400">{row.cancelled_orders}</td>
                      <td className="px-4 py-2 text-right font-medium">₹{Number(row.revenue).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
