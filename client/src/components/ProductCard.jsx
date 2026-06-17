import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user }      = useAuth();

  const handleAdd = async () => {
    if (!user) { window.location.href = '/login'; return; }
    try { await addToCart(product.id); }
    catch { alert('Could not add to cart'); }
  };

  return (
    <div style={styles.card}>
      <Link to={`/products/${product.id}`}>
        <img src={product.image_url} alt={product.name} style={styles.img} />
      </Link>
      <div style={styles.body}>
        <p style={styles.category}>{product.category_name}</p>
        <Link to={`/products/${product.id}`} style={styles.name}>{product.name}</Link>
        <div style={styles.footer}>
          <span style={styles.price}>₹{Number(product.price).toLocaleString('en-IN')}</span>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            style={product.stock === 0 ? styles.disabledBtn : styles.addBtn}
          >
            {product.stock === 0 ? 'Out of stock' : '+ Add'}
          </button>
        </div>
        {product.stock > 0 && product.stock < 10 && (
          <p style={styles.lowStock}>Only {product.stock} left!</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  card:       { background:'#16213e', borderRadius:'10px', overflow:'hidden', transition:'transform 0.2s', cursor:'pointer' },
  img:        { width:'100%', height:'200px', objectFit:'cover' },
  body:       { padding:'1rem' },
  category:   { color:'#e94560', fontSize:'0.75rem', textTransform:'uppercase', marginBottom:'4px' },
  name:       { color:'#eee', textDecoration:'none', fontWeight:'600', display:'block', marginBottom:'0.75rem', fontSize:'0.95rem' },
  footer:     { display:'flex', justifyContent:'space-between', alignItems:'center' },
  price:      { color:'#fff', fontWeight:'700', fontSize:'1.1rem' },
  addBtn:     { background:'#e94560', color:'#fff', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'pointer', fontSize:'0.85rem' },
  disabledBtn:{ background:'#555', color:'#999', border:'none', padding:'6px 14px', borderRadius:'6px', cursor:'not-allowed', fontSize:'0.85rem' },
  lowStock:   { color:'#f59e0b', fontSize:'0.75rem', marginTop:'6px' },
};
