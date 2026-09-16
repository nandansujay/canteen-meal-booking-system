import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerOnlyRoute from './components/CustomerOnlyRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyBookings from './pages/MyBookings';
import Wallet from './pages/Wallet';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Admin/Dashboard';
import CollectTicket from './pages/Admin/CollectTicket';
import CounterLoad from './pages/Admin/CounterLoad';
import ManageMenu from './pages/Admin/ManageMenu';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-950">
          <Navbar />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#27272a', color: '#f4f4f5', border: '1px solid #3f3f46' },
            }}
          />
          <Routes>
            <Route
              path="/"
              element={
                <CustomerOnlyRoute>
                  <Home />
                </CustomerOnlyRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <CustomerOnlyRoute>
                    <MyBookings />
                  </CustomerOnlyRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <CustomerOnlyRoute>
                    <Wallet />
                  </CustomerOnlyRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route path="collect" element={<CollectTicket />} />
              <Route path="counters" element={<CounterLoad />} />
              <Route path="menu" element={<ManageMenu />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
