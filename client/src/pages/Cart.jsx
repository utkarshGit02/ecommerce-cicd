import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api';

export default function Cart() {
  const { cart, updateItem, removeItem } = useCart();
  const [address,  setAddress]  = useState('');
  const [ordering, setOrdering] = useState(false);
  const navigate                = useNavigate();

  const placeOrder = async () => {
    if (!address.trim()) { alert('Please enter a delivery address'); return; }
    setOrdering(true);
    try {
      const res = await api.post('/orders', { address });
      alert(`Order placed! Order ID: ${res.data.orderId}`);
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    } finally {
      setOrdering(false);
    }
  };

  if (!cart.items.length) return (
    <div style={styles.empty}>
      <h2 style={{color:'#fff'}}>Your cart is empty</h2>
      <Link to="/products" style={styles.btn}>Start shopping</Link>
    </div>
  );

  return (
    <div style={styles.wrapper}>
      <div style={styles.items}>
        <h2 style={styles.title}>Shopping Cart ({cart.items.length} items)</h2>
        {cart.items.map(item => (
          <div key={item.id} style={styles.item}>
            <img src={item.image_url} alt={item.name} style={styles.img} />
            <div style={{ flex:1 }}>
              <p style={styles.name}>{item.name}</p>
              <p style={styles.price}>₹{Number(item.price).toLocaleString('en-IN')}</p>
            </div>
            <div style={styles.qty}>
              <button style={styles.qtyBtn} onClick={() => updateItem(item.id, item.quantity - 1)}>-</button>
              <span style={{color:'#fff', minWidth:'24px', textAlign:'center'}}>{item.quantity}</span>
              <button style={styles.qtyBtn} onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
            </div>
            <button style={styles.removeBtn} onClick={() => removeItem(item.id)}>Remove</button>
          </div>
        ))}
      </div>

      <div style={styles.summary}>
        <h3 style={styles.title}>Order Summary</h3>
        <div style={styles.row}><span style={{color:'#aaa'}}>Total</span><span style={{color:'#fff',fontWeight:'700',fontSize:'1.2rem'}}>₹{Number(cart.total).toLocaleString('en-IN')}</span></div>
        <textarea
          placeholder="Delivery address..."
          value={address}
          onChange={e => setAddress(e.target.value)}
          style={styles.addressInput}
          rows={3}
        />
        <button onClick={placeOrder} disabled={ordering} style={styles.btn}>
          {ordering ? 'Placing order...' : 'Place Order'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper:      { display:'flex', gap:'2rem', padding:'2rem', maxWidth:'1100px', margin:'0 auto', flexWrap:'wrap' },
  items:        { flex:2, minWidth:'300px' },
  summary:      { flex:1, minWidth:'260px', background:'#16213e', borderRadius:'12px', padding:'1.5rem', height:'fit-content' },
  title:        { color:'#fff', marginBottom:'1rem' },
  item:         { display:'flex', alignItems:'center', gap:'1rem', background:'#16213e', borderRadius:'10px', padding:'1rem', marginBottom:'1rem' },
  img:          { width:'70px', height:'70px', objectFit:'cover', borderRadius:'8px' },
  name:         { color:'#eee', fontWeight:'500', marginBottom:'4px' },
  price:        { color:'#e94560', fontWeight:'600' },
  qty:          { display:'flex', alignItems:'center', gap:'8px' },
  qtyBtn:       { background:'#0f3460', color:'#fff', border:'none', width:'28px', height:'28px', borderRadius:'4px', cursor:'pointer', fontSize:'1rem' },
  removeBtn:    { background:'transparent', color:'#e94560', border:'1px solid #e94560', padding:'4px 10px', borderRadius:'6px', cursor:'pointer', fontSize:'0.8rem' },
  row:          { display:'flex', justifyContent:'space-between', marginBottom:'1rem' },
  addressInput: { width:'100%', background:'#0f3460', border:'1px solid #333', color:'#fff', padding:'10px', borderRadius:'8px', resize:'vertical', marginBottom:'1rem', boxSizing:'border-box' },
  btn:          { background:'#e94560', color:'#fff', border:'none', padding:'12px 24px', borderRadius:'8px', cursor:'pointer', fontWeight:'600', width:'100%', textDecoration:'none', textAlign:'center', display:'block' },
  empty:        { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1.5rem' },
};
