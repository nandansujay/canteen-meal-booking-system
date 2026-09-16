import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, ImageOff } from 'lucide-react';
import client from '../../api/client';

const CATEGORIES = ['breakfast', 'lunch', 'dinner', 'snacks'];

const emptyForm = { name: '', description: '', image_url: '', category: 'lunch', price: '', capacity: '' };

export default function ManageMenu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    const { data } = await client.get('/admin/menu-items');
    setItems(data.items);
  }

  function updateForm(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreating(true);
    try {
      await client.post('/admin/menu-items', form);
      toast.success('Menu item added.');
      setForm(emptyForm);
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    } finally {
      setCreating(false);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditValues({
      name: item.name,
      category: item.category,
      price: item.price,
      capacity: item.capacity,
      is_available: item.is_available,
      image_url: item.image_url || '',
    });
  }

  async function saveEdit(id) {
    try {
      await client.patch(`/admin/menu-items/${id}`, editValues);
      toast.success('Item updated.');
      setEditingId(null);
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await client.delete(`/admin/menu-items/${item.id}`);
      toast.success('Menu item deleted.');
      loadItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold text-zinc-100 mb-6">Manage Menu</h1>

      <form onSubmit={handleCreate} className="card p-5 mb-8">
        <p className="text-sm font-semibold text-zinc-300 mb-3 flex items-center gap-1.5">
          <Plus size={15} className="text-brand-500" /> Add a new item
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
            required
            className="input-field col-span-2"
          />
          <select
            value={form.category}
            onChange={(e) => updateForm('category', e.target.value)}
            className="input-field"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => updateForm('price', e.target.value)}
            required
            className="input-field"
          />
          <input
            type="number"
            placeholder="Capacity"
            value={form.capacity}
            onChange={(e) => updateForm('capacity', e.target.value)}
            required
            className="input-field"
          />
          <input
            placeholder="Image URL (optional)"
            value={form.image_url}
            onChange={(e) => updateForm('image_url', e.target.value)}
            className="input-field col-span-3"
          />
          <input
            placeholder="Description (optional)"
            value={form.description}
            onChange={(e) => updateForm('description', e.target.value)}
            className="input-field col-span-2"
          />
          <button type="submit" disabled={creating} className="btn-primary col-span-5 sm:col-span-2 text-sm">
            {creating ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="card px-4 py-3.5">
            {editingId === item.id ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input
                  placeholder="Name"
                  value={editValues.name}
                  onChange={(e) => setEditValues((v) => ({ ...v, name: e.target.value }))}
                  className="input-field col-span-2"
                />
                <select
                  value={editValues.category}
                  onChange={(e) => setEditValues((v) => ({ ...v, category: e.target.value }))}
                  className="input-field"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Price"
                  value={editValues.price}
                  onChange={(e) => setEditValues((v) => ({ ...v, price: e.target.value }))}
                  className="input-field"
                />
                <input
                  placeholder="Image URL"
                  value={editValues.image_url}
                  onChange={(e) => setEditValues((v) => ({ ...v, image_url: e.target.value }))}
                  className="input-field col-span-2"
                />
                <input
                  type="number"
                  placeholder="Capacity"
                  value={editValues.capacity}
                  onChange={(e) => setEditValues((v) => ({ ...v, capacity: e.target.value }))}
                  className="input-field"
                />
                <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <input
                    type="checkbox"
                    checked={!!editValues.is_available}
                    onChange={(e) => setEditValues((v) => ({ ...v, is_available: e.target.checked }))}
                  />
                  Available
                </label>
                <div className="col-span-2 sm:col-span-4 flex justify-end gap-3 mt-1">
                  <button onClick={() => setEditingId(null)} className="text-sm text-zinc-500">
                    Cancel
                  </button>
                  <button onClick={() => saveEdit(item.id)} className="btn-primary text-sm px-4 py-1.5">
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageOff size={16} className="text-zinc-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-zinc-200">
                      {item.name}{' '}
                      <span className="text-xs text-zinc-500 uppercase font-normal">{item.category}</span>
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Booked {item.booked_count} / {item.capacity}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-zinc-300">₹{Number(item.price).toFixed(2)}</span>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.is_available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {item.is_available ? 'Available' : 'Hidden'}
                  </span>
                  <button
                    onClick={() => startEdit(item)}
                    className="flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300"
                  >
                    <Pencil size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex items-center gap-1 text-sm font-medium text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
