import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from "jwt-decode";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:8099/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (response.ok) {
        const { token, name, role } = data;
        const decoded = jwtDecode(token);
        const id = decoded.id; 
        localStorage.setItem('token', token);
        localStorage.setItem('id_user', id);
        localStorage.setItem('name', name);
        localStorage.setItem('role', role);
        setMessage('Đăng nhập thành công!');
        navigate('/');
      } else {
        setMessage(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      setMessage('Lỗi kết nối tới server');
    }
  };

  return (
    <form onSubmit={handleLogin} style={{ margin: '32px auto', maxWidth: 320, background: '#f5f5f5', padding: 24, borderRadius: 8 }}>
      <h2>Đăng nhập</h2>
      <input
        type="text"
        placeholder="Email"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        style={{ width: '100%', padding: 8, marginBottom: 12 }}
      />
      <button
        type="submit"
        style={{ width: '100%', color: '#fff', background: '#00796b', fontWeight: 'bold', fontSize: 16, padding: '8px 0', border: 'none', borderRadius: 4 }}
      >
        Đăng nhập
      </button>
      {message && <p style={{ color: message.includes('thành công') ? 'green' : 'red', marginTop: 12 }}>{message}</p>}
    </form>
  );
}

export default Login;