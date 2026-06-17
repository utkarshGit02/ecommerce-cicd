import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/products?limit=4').then(r => setFeatured(r.data.products));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Shop the latest deals</h1>
        <p style={styles.heroSub}>Electronics, fashion, books & more — delivered to your door</p>
        <Link to="/products" style={styles.heroBtn}>Browse Products</Link>
      </section>

      {/* Featured */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Featured Products</h2>
        <div style={styles.grid}>
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
        <div style={{ textAlign:'center', marginTop:'2rem' }}>
          <Link to="/products" style={styles.heroBtn}>View All</Link>
        </div>
      </section>
    </div>
  );
}

const styles = {
  hero:        { background:'linear-gradient(135deg,#1a1a2e,#16213e)', padding:'5rem 2rem', textAlign:'center' },
  heroTitle:   { color:'#fff', fontSize:'3rem', fontWeight:'700', marginBottom:'1rem' },
  heroSub:     { color:'#aaa', fontSize:'1.2rem', marginBottom:'2rem' },
  heroBtn:     { background:'#e94560', color:'#fff', padding:'12px 32px', borderRadius:'8px', textDecoration:'none', fontWeight:'600', fontSize:'1rem' },
  section:     { padding:'3rem 2rem', maxWidth:'1200px', margin:'0 auto' },
  sectionTitle:{ color:'#fff', fontSize:'1.8rem', fontWeight:'600', marginBottom:'1.5rem' },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'1.5rem' },
};
