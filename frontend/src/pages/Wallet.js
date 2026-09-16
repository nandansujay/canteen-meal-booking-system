import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Wallet() {
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const { refreshWallet } = useAuth();

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    const [balanceRes, txRes] = await Promise.all([
      client.get('/wallet/balance'),
      client.get('/wallet/transactions'),
    ]);
    setBalance(balanceRes.data.wallet_balance);
    setTransactions(txRes.data.transactions);
  }

  async function handleRecharge(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await client.post('/wallet/recharge', { amount });
      toast.success(data.message);
      setBalance(data.wallet.wallet_balance);
      await refreshWallet();
      loadWallet();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Recharge failed');
    } finally {
      setLoading(false);
    }
  }

  const quickAmounts = [50, 100, 200, 500];

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-zinc-100 mb-6">Wallet</h1>

      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 text-white p-6 mb-6">
        <div className="flex items-center gap-2 text-brand-100 text-sm font-medium mb-2">
          <WalletIcon size={16} /> Available balance
        </div>
        <p className="text-4xl font-extrabold">
          ₹{balance !== null ? Number(balance).toFixed(2) : '...'}
        </p>
      </div>

      <form onSubmit={handleRecharge} className="card p-5 mb-8">
        <p className="text-sm font-semibold text-zinc-300 mb-3">Recharge wallet</p>
        <div className="flex gap-2 mb-3">
          {quickAmounts.map((amt) => (
            <button
              type="button"
              key={amt}
              onClick={() => setAmount(amt)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                amount === amt
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'border-zinc-700 text-zinc-400 hover:border-brand-500'
              }`}
            >
              ₹{amt}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="input-field w-32"
          />
          <button type="submit" disabled={loading} className="btn-primary text-sm px-5 py-2">
            {loading ? 'Processing...' : 'Recharge'}
          </button>
        </div>
      </form>

      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 mb-3">
        Transaction History
      </h2>
      {transactions.length === 0 ? (
        <p className="text-zinc-500 text-sm">No transactions yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map((t) => (
            <div key={t.id} className="card flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    t.type === 'credit' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                  }`}
                >
                  {t.type === 'credit' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                </span>
                <div>
                  <p className="text-sm font-medium text-zinc-300 capitalize">{t.reference_type}</p>
                  <p className="text-xs text-zinc-500">{new Date(t.created_at).toLocaleString()}</p>
                </div>
              </div>
              <span className={`font-semibold ${t.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                {t.type === 'credit' ? '+' : '-'}₹{Number(t.amount).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
