import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router';
import { describe, it, expect, vi } from 'vitest';
import { AppHeader } from './AppHeader';

describe('AppHeader', () => {
  const mockOnHomeClick = vi.fn();

  it('should render the header with title', () => {
    render(
      <BrowserRouter>
        <AppHeader onHomeClick={mockOnHomeClick} />
      </BrowserRouter>
    );
    
    expect(screen.getByText('法令検索・EPUB ダウンロード')).toBeInTheDocument();
  });

  it('should have a link to home page', () => {
    render(
      <BrowserRouter>
        <AppHeader onHomeClick={mockOnHomeClick} />
      </BrowserRouter>
    );
    
    const homeLink = screen.getByRole('link', { name: /法令検索・EPUB ダウンロード/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should have help link', () => {
    render(
      <BrowserRouter>
        <AppHeader onHomeClick={mockOnHomeClick} />
      </BrowserRouter>
    );
    
    const helpLink = screen.getByRole('link', { name: /ヘルプ/i });
    expect(helpLink).toHaveAttribute('href', '/help/');
  });
});