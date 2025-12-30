import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Shop from '../src/pages/Shop';

// Mock hook dependencies
vi.mock('@/hooks/use-products', () => ({
    useProducts: () => ({
        data: [
            {
                id: 1,
                name: 'Test Product',
                slug: 'test-product',
                description: 'A test product',
                price: 100,
                variants: [],
                images: ['test-image.jpg', 'test-image-2.jpg']
            }
        ],
        isLoading: false,
    }),
}));

vi.mock('wouter', () => ({
    Link: ({ children }: any) => <a>{children}</a>,
}));

describe('Shop Page', () => {
    it('renders product list', () => {
        render(<Shop />);
        expect(screen.getByText('The Urban Essential (Black)')).toBeInTheDocument();
        // Assuming price formatting
        // expect(screen.getByText(/100/)).toBeInTheDocument();
    });
});
