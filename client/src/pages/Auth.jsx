import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const [form, setForm]   = useState({ email:'', password:'' });
  const [error, setError] = useState('');
  const { login }         = useAuth();
  const navigate          = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="email"    placeholder="Email"    value={form.email}    onChange={e=>setForm({...form,email:e.target.value})}    required />
        <input style={styles.input} type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required />
        <button type="submit" style={styles.btn}>Login</button>
        <p style={styles.switch}>No account? <Link to="/register" style={styles.linkText}>Sign up</Link></p>
      </form>
    </div>
  );
}

export function Register() {
  const [form, setForm]   = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const { register }      = useAuth();
  const navigate          = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Create account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input style={styles.input} type="text"     placeholder="Full name" value={form.name}     onChange={e=>setForm({...form,name:e.target.value})}     required />
        <input style={styles.input} type="email"    placeholder="Email"     value={form.email}    onChange={e=>setForm({...form,email:e.target.value})}    required />
        <input style={styles.input} type="password" placeholder="Password"  value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required minLength={6} />
        <button type="submit" style={styles.btn}>Create account</button>
        <p style={styles.switch}>Have an account? <Link to="/login" style={styles.linkText}>Login</Link></p>
      </form>
    </div>
  );
}

const styles = {
  page:      { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'80vh', padding:'2rem' },
  card:      { background:'#16213e', padding:'2.5rem', borderRadius:'12px', width:'100%', maxWidth:'400px', display:'flex', flexDirection:'column', gap:'1rem' },
  title:     { color:'#fff', textAlign:'center', marginBottom:'0.5rem' },
  error:     { background:'rgba(233,69,96,0.15)', color:'#e94560', padding:'10px', borderRadius:'6px', fontSize:'0.85rem', textAlign:'center' },
  input:     { background:'#0f3460', border:'1px solid #333', color:'#fff', padding:'12px 16px', borderRadius:'8px', fontSize:'0.95rem', outline:'none' },
  btn:       { background:'#e94560', color:'#fff', border:'none', padding:'12px', borderRadius:'8px', fontWeight:'600', cursor:'pointer', fontSize:'1rem' },
  switch:    { color:'#aaa', textAlign:'center', fontSize:'0.9rem' },
  linkText:  { color:'#e94560', textDecoration:'none' },
};
