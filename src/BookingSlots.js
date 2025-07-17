import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const HOURS = Array.from({ length: 17 }, (_, i) => 6 + i);

function formatHour(h) {
  return `${h.toString().padStart(2, '0')}:00`;
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

  // Lấy danh sách sân
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
    for (const slot of slots) {
      const id = slot.idPitches ?? slot.pitches?.id_pitches;
      if (
        id === pitchId &&
        typeof slot.startTime === 'string' &&
        typeof slot.endTime === 'string'
      ) {
        const startHour = parseInt(slot.startTime.split(':')[0], 10);
        const endHour = parseInt(slot.endTime.split(':')[0], 10);
        if (
          !isNaN(startHour) &&
          !isNaN(endHour) &&
          startHour <= hour &&
          hour < endHour
        ) {
          if (slot.status === 'BOOKED') return 'booked';
        }
      }
    }
    return 'available';
  };

  const handleSlotClick = (pitch, hour) => {
    const slot = {
      idPitches: pitch.id_pitches,
      pitchName: pitch.name,
      date,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      status: 'BOOKED'
    };
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
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
    setMessage('');
  };

  // Đặt sân
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
      for (const slot of selectedSlots) {
        const payload = {
          idPitches: slot.idPitches,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: 'BOOKED'
        };
        await axios.post('http://localhost:8099/api/booking', payload, {
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
      } else if (error.response?.data) {
        setMessage('❌ ' + (error.response.data.message || 'Lỗi khi đặt sân.'));
      } else {
        setMessage('❌ Lỗi khi đặt sân. Có thể khung giờ đã có người đặt hoặc bạn chưa đăng nhập.');
      }
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="booking-container" style={{ padding: 24, background: '#e0f7fa', minHeight: '100vh' }}>
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
                  return (
                    <td
                      key={h}
                      style={{
                        background: status === 'booked'
                          ? '#e57373'
                          : isSelected
                          ? '#81c784'
                          : '#fff',
                        border: '1px solid #ccc',
                        height: 32,
                        minWidth: 60,
                        cursor: status === 'available' ? 'pointer' : 'not-allowed'
                      }}
                      onClick={() => status === 'available' && handleSlotClick(pitch, h)}
                    />
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
    </div>
  );
}
