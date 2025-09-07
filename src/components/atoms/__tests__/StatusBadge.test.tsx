
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

describe('StatusBadge', () => {
  it('should render children content', () => {
    render(
      <StatusBadge status="success">
        Success Status
      </StatusBadge>
    );

    expect(screen.getByText('Success Status')).toBeInTheDocument();
  });

  it('should apply success styling', () => {
    render(
      <StatusBadge status="success">
        Success
      </StatusBadge>
    );

    const badge = screen.getByText('Success');
    expect(badge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should apply warning styling', () => {
    render(
      <StatusBadge status="warning">
        Warning
      </StatusBadge>
    );

    const badge = screen.getByText('Warning');
    expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800');
  });

  it('should apply error styling', () => {
    render(
      <StatusBadge status="error">
        Error
      </StatusBadge>
    );

    const badge = screen.getByText('Error');
    expect(badge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should apply info styling', () => {
    render(
      <StatusBadge status="info">
        Info
      </StatusBadge>
    );

    const badge = screen.getByText('Info');
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('should apply neutral styling', () => {
    render(
      <StatusBadge status="neutral">
        Neutral
      </StatusBadge>
    );

    const badge = screen.getByText('Neutral');
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should apply custom className', () => {
    render(
      <StatusBadge status="success" className="custom-class">
        Custom
      </StatusBadge>
    );

    const badge = screen.getByText('Custom');
    expect(badge).toHaveClass('custom-class');
  });
});
