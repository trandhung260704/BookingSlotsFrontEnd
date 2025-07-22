import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i);

function formatHour(h) {
  return `${h.toString().padStart(2, '0')}:00`;
}

function getCurrentUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded?.id_user || decoded?.id || null;
  } catch (err) {
    return null;
  }
}

export default function BookingSlots() {
  const API = 'http://localhost:8099/api/bookingslots';

  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [pitches, setPitches] = useState([]);
  const [slotPrices, setSlotPrices] = useState({}); // key: pitchId_date_start_end, value: price
  const [totalPrice, setTotalPrice] = useState(0);

  const fetchPitches = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8099/api/pitches');
      setPitches(res.data || []);
    } catch (err) {
      setPitches([]);
    }
  }, []);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API}?date=${date}`, {
        headers: { Authorization: 'Bearer ' + token },
        withCredentials: true,
      });
      setSlots(res.data || []);
      setMessage('');
    } catch (err) {
      setMessage('Lỗi khi tải slot. Vui lòng thử lại.');
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [date]);
  
  useEffect(() => {
    fetchPitches();
    fetchSlots();
  }, [fetchPitches, fetchSlots]);

  const getCellStatus = (pitchId, hour) => {
    const currentUserId = getCurrentUserId();
  
    for (const slot of slots) {
      const slotPitchId = slot.id_pitches?.id_pitches ?? slot.id_pitches;
      const userId = slot.id_user?.id_user ?? slot.id_user;
  
      if (
        slotPitchId === pitchId &&
        typeof slot.start_time === 'string' &&
        typeof slot.end_time === 'string'
      ) {
        const startHour = parseInt(slot.start_time.split(':')[0], 10);
        const endHour = parseInt(slot.end_time.split(':')[0], 10);
  
        if (!isNaN(startHour) && !isNaN(endHour) && startHour <= hour && hour < endHour) {
          if (slot.status === 'BOOKED') {
            if (userId === currentUserId) return 'mine';
            return 'booked';
          }
        }
      }
    }
  
    return 'available';
  };
  

  const fetchSlotPrice = async (slot) => {
    try {
      const res = await axios.get('http://localhost:8099/api/timeslots/price', {
        params: {
          pitchId: slot.idPitches,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
        withCredentials: true,
      });
      return res.data;
    } catch (err) {
      return 0;
    }
  };

  const handleSlotClick = async (pitch, hour) => {
    const slot = {
      idPitches: pitch.id_pitches,
      pitchName: pitch.name,
      date,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      status: 'BOOKED'
    };
    const key = `${slot.idPitches}_${slot.date}_${slot.startTime}_${slot.endTime}`;
    const exists = selectedSlots.some(
      s =>
        s.idPitches === slot.idPitches &&
        s.date === slot.date &&
        s.startTime === slot.startTime &&
        s.endTime === slot.endTime
    );
    if (exists) {
      setSelectedSlots(selectedSlots.filter(
        s =>
          !(
            s.idPitches === slot.idPitches &&
            s.date === slot.date &&
            s.startTime === slot.startTime &&
            s.endTime === slot.endTime
          )
      ));
      setSlotPrices(prev => {
        const newPrices = { ...prev };
        delete newPrices[key];
        return newPrices;
      });
    } else {
      setSelectedSlots([...selectedSlots, slot]);
      const price = await fetchSlotPrice(slot);
      setSlotPrices(prev => ({ ...prev, [key]: price }));
    }
    setMessage('');
  };

const handleConfirmBooking = async (e) => {
  e?.preventDefault && e.preventDefault();
  if (selectedSlots.length === 0) {
    setMessage('Bạn chưa chọn khung giờ nào!');
    return;
  }
  setBookingLoading(true);
  setMessage('');
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Bạn chưa đăng nhập!');
      setBookingLoading(false);
      return;
    }

    const decoded = jwtDecode(token);
    const idUser = decoded?.id || decoded?.id_user;

    if (!idUser) {
      setMessage('Token không hợp lệ!');
      setBookingLoading(false);
      return;
    }

    for (const slot of selectedSlots) {
      const payload = {
        idPitches: slot.idPitches,
        date: slot.date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'BOOKED'
      };

      // eslint-disable-next-line no-unused-vars
      const res = await axios.post('http://localhost:8099/api/orders', payload, {
        headers: {
          Authorization: 'Bearer ' + token,
        },
        withCredentials: true,
      });
    }

    setMessage('✅ Đặt sân thành công!');
    setSelectedSlots([]);
    fetchSlots();
    setTimeout(() => setMessage(''), 3000);
  } catch (error) {
    if (error.response?.status === 401) {
      setMessage('❌ Phiên đăng nhập hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.');
    } else if (error.response?.status === 409) {
      setMessage('❌ Khung giờ bạn chọn đã có người đặt. Vui lòng chọn khung giờ khác!');
    } else if (error.response?.data) {
      setMessage('❌ ' + (error.response.data.message || 'Lỗi khi đặt sân.'));
    } else {
      setMessage('❌ Lỗi không xác định khi đặt sân.');
    }
  } finally {
    setBookingLoading(false);
  }
};


  useEffect(() => {
    let sum = 0;
    for (const slot of selectedSlots) {
      const key = `${slot.idPitches}_${slot.date}_${slot.startTime}_${slot.endTime}`;
      sum += Number(slotPrices[key] || 0);
    }
    setTotalPrice(sum);
  }, [slotPrices, selectedSlots]);

  return (
    <div className="booking-container" style={{ padding: 24, background: '#e0f7fa', minHeight: '100vh' }}>
      <div style={{ position: 'absolute', top: 24, right: 32, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ width: 24, height: 16, background: '#64b5f6', border: '1px solid #ccc', marginRight: 8 }} />
          <span>Ô của tôi đã đặt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
          <div style={{ width: 24, height: 16, background: '#e57373', border: '1px solid #ccc', marginRight: 8 }} />
          <span>Ô đã có người đặt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 24, height: 16, background: '#81c784', border: '1px solid #ccc', marginRight: 8 }} />
          <span>Ô đang chọn</span>
        </div>
      </div>
      <h2>Đặt sân thể thao</h2>
      <div style={{ marginBottom: 16 }}>
        <label>
          Chọn ngày:&nbsp;
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{ padding: 4 }}
          />
        </label>
      </div>
      {message && (
        <div style={{
          margin: '16px 0',
          color: message.includes('✅') ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 1200 }}>
          <thead>
            <tr>
              <th style={{ background: '#b2ebf2', minWidth: 80 }}></th>
              {HOURS.map(h => (
                <th key={h} style={{ background: '#b2ebf2', minWidth: 60, textAlign: 'center' }}>
                  {formatHour(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pitches.map(pitch => (
              <tr key={pitch.id_pitches}>
                <td style={{ background: '#e0f2f1', minWidth: 120 }}>{pitch.name}</td>
                {HOURS.map(h => {
                  const status = getCellStatus(pitch.id_pitches, h);
                  const isSelected = selectedSlots.some(
                    s =>
                      s.idPitches === pitch.id_pitches &&
                      s.date === date &&
                      s.startTime === `${h.toString().padStart(2, '0')}:00` &&
                      s.endTime === `${(h + 1).toString().padStart(2, '0')}:00`
                  );
                  const getBgColor = () => {
                    if (status === 'mine') return '#64b5f6';     
                    if (isSelected) return '#81c784';            
                    if (status === 'booked') return '#e57373';   
                  };
                  
                  return (
                    <td
                      key={h}
                      style={{
                        background: getBgColor(),
                        border: '1px solid #ccc',
                        height: 32,
                        minWidth: 60,
                        cursor: status === 'available' ? 'pointer' : 'not-allowed'
                      }}
                      onClick={() => status === 'available' && handleSlotClick(pitch, h)}
                    >
                    </td>                  
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading && <p>Đang tải dữ liệu...</p>}
      {selectedSlots.length > 0 && (
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <h4>Các khung giờ đã chọn:</h4>
          <ul>
            {selectedSlots.map((slot, idx) => (
              <li key={idx}>
                <b>{slot.pitchName}</b> - {slot.date} {slot.startTime} - {slot.endTime}
              </li>
            ))}
          </ul>
          <button
            onClick={handleConfirmBooking}
            disabled={bookingLoading}
            style={{
              padding: '8px 24px',
              background: '#00796b',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontSize: 16,
              cursor: 'pointer'
            }}
          >
            {bookingLoading ? 'Đang đặt...' : 'Xác nhận đặt tất cả'}
          </button>
        </div>
      )}
      <div style={{ position: 'fixed', right: 32, bottom: 32, zIndex: 20, background: '#fff', border: '1px solid #ccc', borderRadius: 8, padding: '16px 32px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', minWidth: 200, textAlign: 'center', fontWeight: 'bold', fontSize: 18 }}>
        {selectedSlots.length > 0 && (
          <>
            <span>Tổng tiền cần trả:&nbsp;</span>
            <span style={{ color: '#00796b', fontSize: 22 }}>{totalPrice.toLocaleString()} đ</span>
          </>
        )}
      </div>
    </div>
  );
}
