import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import BookingSlots from './BookingSlots';
import Login from './Login';

function Home() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8099/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      alert('Lỗi khi đăng xuất');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 60 }}>
      <h1>Chào mừng đến với trang chủ!</h1>
      <p>Đây là trang web quản lý đặt sân thể thao.</p>
      <button
        style={{ color: '#fff', background: '#00796b', fontWeight: 'bold', fontSize: 18, padding: '8px 24px', border: 'none', borderRadius: 4, margin: 8, cursor: 'pointer' }}
        onClick={() => navigate('/login')}
      >
        Đăng nhập
      </button>
      <button
        style={{ color: '#fff', background: '#43a047', fontWeight: 'bold', fontSize: 18, padding: '8px 24px', border: 'none', borderRadius: 4, margin: 8, cursor: 'pointer' }}
        onClick={() => navigate('/bookingslots')}
      >
        Đặt sân
      </button>
      <button
        style={{ color: '#fff', background: '#e57373', fontWeight: 'bold', fontSize: 16, padding: '6px 18px', border: 'none', borderRadius: 4, margin: 8, cursor: 'pointer' }}
        onClick={handleLogout}
      >
        Đăng xuất
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bookingslots" element={<BookingSlots />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
