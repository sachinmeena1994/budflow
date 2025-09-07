
import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataTableLoading } from '../DataTableLoading';

describe('DataTableLoading', () => {
  it('should render loading spinner', () => {
    render(<DataTableLoading />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should render loading text', () => {
    render(<DataTableLoading />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should have centered layout', () => {
    render(<DataTableLoading />);
    
    const container = screen.getByText('Loading...').closest('div');
    expect(container).toHaveClass('text-center');
  });

  it('should use large spinner size', () => {
    render(<DataTableLoading />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });
});
