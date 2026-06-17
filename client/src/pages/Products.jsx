import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';

export default function Products() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const page     = Number(searchParams.get('page') || 1);

  useEffect(() => {
    api.get('/products/categories').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (search)   params.set('search',   search);
    if (category) params.set('category', category);
    api.get(`/products?${params}`)
      .then(r => { setProducts(r.data.products); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [search, category, page]);

  const set = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div style={styles.wrapper}>
      {/* Filters */}
      <aside style={styles.sidebar}>
        <h3 style={styles.filterTitle}>Categories</h3>
        <ul style={styles.catList}>
          <li style={!category ? styles.activeCat : styles.cat} onClick={() => set('category','')}>All</li>
          {categories.map(c => (
            <li key={c.id} style={category===c.slug ? styles.activeCat : styles.cat}
                onClick={() => set('category', c.slug)}>{c.name}</li>
          ))}
        </ul>
      </aside>

      {/* Main */}
      <main style={{ flex:1 }}>
        <div style={styles.topBar}>
          <input
            placeholder="Search products..."
            defaultValue={search}
            onKeyDown={e => e.key === 'Enter' && set('search', e.target.value)}
            style={styles.searchInput}
          />
          <span style={styles.resultCount}>{total} products</span>
        </div>

        {loading ? (
          <p style={styles.msg}>Loading...</p>
        ) : products.length === 0 ? (
          <p style={styles.msg}>No products found.</p>
        ) : (
          <div style={styles.grid}>
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}

        {/* Pagination */}
        {total > 12 && (
          <div style={styles.pagination}>
            {page > 1 && <button style={styles.pageBtn} onClick={() => set('page', page-1)}>Prev</button>}
            <span style={{color:'#aaa'}}>Page {page}</span>
            {page * 12 < total && <button style={styles.pageBtn} onClick={() => set('page', page+1)}>Next</button>}
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  wrapper:     { display:'flex', gap:'2rem', padding:'2rem', maxWidth:'1200px', margin:'0 auto' },
  sidebar:     { width:'200px', flexShrink:0 },
  filterTitle: { color:'#e94560', marginBottom:'1rem', fontSize:'0.9rem', textTransform:'uppercase' },
  catList:     { listStyle:'none', padding:0 },
  cat:         { color:'#aaa', padding:'8px 0', cursor:'pointer', fontSize:'0.9rem' },
  activeCat:   { color:'#e94560', padding:'8px 0', cursor:'pointer', fontWeight:'600', fontSize:'0.9rem' },
  topBar:      { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  searchInput: { background:'#16213e', border:'1px solid #333', color:'#fff', padding:'10px 16px', borderRadius:'8px', width:'300px', fontSize:'0.9rem' },
  resultCount: { color:'#666', fontSize:'0.85rem' },
  grid:        { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'1.5rem' },
  msg:         { color:'#aaa', textAlign:'center', marginTop:'3rem' },
  pagination:  { display:'flex', justifyContent:'center', alignItems:'center', gap:'1rem', marginTop:'2rem' },
  pageBtn:     { background:'#e94560', color:'#fff', border:'none', padding:'8px 20px', borderRadius:'6px', cursor:'pointer' },
};
