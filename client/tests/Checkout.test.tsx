import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Checkout from '../src/pages/Checkout';

vi.mock('@/hooks/use-cart', () => ({
    useCart: () => ({
        cart: {
            items: [
                {
                    id: 1,
                    quantity: 1,
                    variant: { product: { name: 'Item', price: 100, images: ['img1.jpg'] } }
                }
            ]
        },
        isLoading: false,
    }),
}));

vi.mock('@/hooks/use-orders', () => ({
    useOrders: () => ({
        createOrder: vi.fn(),
        isCreatingOrder: false,
    }),
}));

vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        user: { id: 1, name: 'Test User', email: 'test@example.com', role: 'customer' },
        isLoading: false,
    }),
}));

vi.mock('wouter', () => ({
    useLocation: () => ['/checkout', vi.fn()],
    Link: ({ children }: any) => <a>{children}</a>,
}));

describe('Checkout Page', () => {
    it('renders payment options', () => {
        render(<Checkout />);
        expect(screen.getByText(/Cash on Delivery/i)).toBeInTheDocument();
    });
});
