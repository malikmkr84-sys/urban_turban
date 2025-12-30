import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Cart from '../src/pages/Cart';

// Mock hook dependencies
vi.mock('@/hooks/use-cart', () => ({
    useCart: () => ({
        cart: {
            items: [
                {
                    id: 1,
                    quantity: 2,
                    variantId: 101,
                    variant: {
                        id: 101,
                        product: { name: 'Cart Item', price: 50, images: ['img1.jpg'] }
                    }
                }
            ]
        },
        isLoading: false,
        updateItem: vi.fn(),
        removeItem: vi.fn(),
    }),
}));

vi.mock('wouter', () => ({
    Link: ({ children }: any) => <a>{children}</a>,
    useLocation: () => ['/cart', vi.fn()],
}));

describe('Cart Page', () => {
    it('renders cart items', () => {
        render(<Cart />);
        expect(screen.getByText('Cart Item')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument(); // Quantity
    });
});
