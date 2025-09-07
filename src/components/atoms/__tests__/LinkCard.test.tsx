
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LinkCard } from '../LinkCard';
import { Home } from 'lucide-react';

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('LinkCard', () => {
  const defaultProps = {
    title: 'Test Title',
    description: 'Test Description',
    icon: <Home data-testid="home-icon" />,
    path: '/test-path',
  };

  it('should render title and description', () => {
    renderWithRouter(<LinkCard {...defaultProps} />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should render icon', () => {
    renderWithRouter(<LinkCard {...defaultProps} />);

    expect(screen.getByTestId('home-icon')).toBeInTheDocument();
  });

  it('should render badge when provided', () => {
    const badge = <span data-testid="test-badge">Badge</span>;
    renderWithRouter(<LinkCard {...defaultProps} badge={badge} />);

    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
  });

  it('should navigate to correct path when clicked', () => {
    renderWithRouter(<LinkCard {...defaultProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/test-path');
  });

  it('should have hover effects', () => {
    renderWithRouter(<LinkCard {...defaultProps} />);

    const card = screen.getByRole('link');
    expect(card).toHaveClass('hover:bg-muted/50');
  });

  it('should be accessible', () => {
    renderWithRouter(<LinkCard {...defaultProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAccessibleName('Test Title');
  });

  it('should render without badge', () => {
    renderWithRouter(<LinkCard {...defaultProps} />);

    // Should not have any badge element
    expect(screen.queryByTestId('test-badge')).not.toBeInTheDocument();
  });
});
