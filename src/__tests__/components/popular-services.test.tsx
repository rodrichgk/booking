import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PopularServices } from '@/components/sections/popular-services';

// Mock the routing
vi.mock('@/routing', () => ({
    Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    ),
}));

describe('PopularServices Component', () => {
    it('renders without crashing', () => {
        render(<PopularServices />);
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('displays the correct title in French locale', () => {
        render(<PopularServices />);
        // Since useLocale returns 'fr' by default in our mock
        expect(screen.getByText('Services Populaires')).toBeInTheDocument();
    });

    it('renders 4 service cards', () => {
        render(<PopularServices />);
        // Looking for service names - should have 4 different services
        const images = screen.getAllByRole('img');
        expect(images.length).toBe(4);
    });

    it('displays price information', () => {
        render(<PopularServices />);
        // Check that price text exists (in French)
        expect(screen.getAllByText(/À partir de|From/).length).toBeGreaterThan(0);
    });

    it('contains book now links', () => {
        render(<PopularServices />);
        const bookButtons = screen.getAllByText(/Réserver|Book/);
        expect(bookButtons.length).toBe(4);
    });

    it('has a view all services link', () => {
        render(<PopularServices />);
        expect(screen.getByText(/Voir Tous les Services|View All/)).toBeInTheDocument();
    });
});
