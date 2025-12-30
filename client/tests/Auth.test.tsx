
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../src/pages/Login';

// Mock hook dependencies
vi.mock('@/hooks/use-auth', () => ({
    useAuth: () => ({
        login: vi.fn(),
        register: vi.fn(),
        user: null,
        isLoggingIn: false,
        isRegistering: false,
    }),
}));

// Mock wouter for routing
vi.mock('wouter', () => ({
    useLocation: () => ['/login', vi.fn()],
    Link: ({ children }: any) => <a>{children}</a>,
}));

describe('Auth Pages', () => {
    it('Login renders email and password fields', () => {
        render(<Login />);
        expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/Password/i)).toBeInTheDocument();
        // Actually password input usually doesn't have specific placeholder in Login.tsx? let's check view.
        // Login.tsx line 85: placeholder is NOT present for password.
        // So use getByText for label? Labels are rendered as text.
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });
});

