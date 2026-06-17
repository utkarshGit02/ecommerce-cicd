import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProductCard from '../components/ProductCard';

vi.mock('../context/CartContext', () => ({
  useCart: () => ({ addToCart: vi.fn() }),
}));
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Test' } }),
}));
vi.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

const mockProduct = {
  id: 1,
  name: 'Wireless Headphones',
  price: '2499.00',
  image_url: 'https://example.com/img.jpg',
  category_name: 'Electronics',
  stock: 10,
};

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText(/2,499/)).toBeInTheDocument();
  });

  it('renders category label', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText('Electronics')).toBeInTheDocument();
  });

  it('shows "Out of stock" when stock is 0', () => {
    render(<ProductCard product={{ ...mockProduct, stock: 0 }} />);
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('shows low stock warning when stock < 10', () => {
    render(<ProductCard product={{ ...mockProduct, stock: 3 }} />);
    expect(screen.getByText(/Only 3 left/)).toBeInTheDocument();
  });
});
