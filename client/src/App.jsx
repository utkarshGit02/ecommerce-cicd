import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar   from './components/Navbar';
import Home     from './pages/Home';
import Products from './pages/Products';
import Cart     from './pages/Cart';
import Orders   from './pages/Orders';
import { Login, Register } from './pages/Auth';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{color:'#aaa',textAlign:'center',marginTop:'4rem'}}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cart"     element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/orders"   element={<PrivateRoute><Orders /></PrivateRoute>} />
        <Route path="*"         element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div style={{ background:'#0f3460', minHeight:'100vh' }}>
            <AppRoutes />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
