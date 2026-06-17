import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart }         = useCart();
  const navigate         = useNavigate();
  const cartCount        = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>ShopIndia</Link>
      <div style={styles.links}>
        <Link to="/products" style={styles.link}>Products</Link>
        {user ? (
          <>
            <Link to="/cart" style={styles.cartBtn}>
              Cart {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
            </Link>
            <Link to="/orders" style={styles.link}>My Orders</Link>
            {user.role === 'admin' && <Link to="/admin" style={styles.link}>Admin</Link>}
            <button onClick={() => { logout(); navigate('/'); }} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    style={styles.link}>Login</Link>
            <Link to="/register" style={styles.signupBtn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0 2rem', height:'60px', background:'#1a1a2e', position:'sticky', top:0, zIndex:100 },
  brand:     { color:'#e94560', fontWeight:'700', fontSize:'1.4rem', textDecoration:'none' },
  links:     { display:'flex', alignItems:'center', gap:'1rem' },
  link:      { color:'#ccc', textDecoration:'none', fontSize:'0.9rem' },
  cartBtn:   { color:'#e94560', textDecoration:'none', fontWeight:'600', position:'relative' },
  badge:     { background:'#e94560', color:'#fff', borderRadius:'50%', padding:'2px 6px', fontSize:'0.7rem', marginLeft:'4px' },
  signupBtn: { background:'#e94560', color:'#fff', padding:'6px 16px', borderRadius:'6px', textDecoration:'none', fontSize:'0.9rem' },
  logoutBtn: { background:'transparent', border:'1px solid #555', color:'#ccc', padding:'6px 12px', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem' },
};
