import { useEffect, useState } from 'react';
import api from '../api';

const STATUS_COLORS = {
  pending:'#f59e0b', confirmed:'#3b82f6', shipped:'#8b5cf6',
  delivered:'#10b981', cancelled:'#ef4444',
};

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my')
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={styles.msg}>Loading orders...</p>;
  if (!orders.length) return <p style={styles.msg}>No orders yet.</p>;

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>My Orders</h2>
      {orders.map(o => (
        <div key={o.id} style={styles.card}>
          <div style={styles.top}>
            <div>
              <p style={styles.orderId}>Order #{o.id}</p>
              <p style={styles.date}>{new Date(o.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
            </div>
            <span style={{...styles.status, background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status]}}>
              {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
            </span>
          </div>
          <p style={styles.items}>{o.items}</p>
          <div style={styles.footer}>
            <span style={styles.total}>₹{Number(o.total).toLocaleString('en-IN')}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  wrapper: { maxWidth:'800px', margin:'0 auto', padding:'2rem' },
  title:   { color:'#fff', marginBottom:'1.5rem' },
  card:    { background:'#16213e', borderRadius:'10px', padding:'1.25rem', marginBottom:'1rem' },
  top:     { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.75rem' },
  orderId: { color:'#fff', fontWeight:'600' },
  date:    { color:'#888', fontSize:'0.85rem', marginTop:'2px' },
  status:  { padding:'4px 12px', borderRadius:'20px', fontSize:'0.8rem', fontWeight:'600' },
  items:   { color:'#aaa', fontSize:'0.9rem', marginBottom:'0.75rem' },
  footer:  { borderTop:'1px solid #333', paddingTop:'0.75rem' },
  total:   { color:'#e94560', fontWeight:'700', fontSize:'1.1rem' },
  msg:     { color:'#aaa', textAlign:'center', marginTop:'4rem' },
};
