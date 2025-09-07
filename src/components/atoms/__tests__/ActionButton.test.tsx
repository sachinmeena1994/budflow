
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionButton } from '../ActionButton';

describe('ActionButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render button with children', () => {
    render(
      <ActionButton onClick={mockOnClick}>
        Click me
      </ActionButton>
    );

    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    render(
      <ActionButton onClick={mockOnClick}>
        Click me
      </ActionButton>
    );

    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <ActionButton onClick={mockOnClick} disabled={true}>
        Click me
      </ActionButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should be disabled when loading prop is true', () => {
    render(
      <ActionButton onClick={mockOnClick} loading={true}>
        Click me
      </ActionButton>
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should apply correct variant classes', () => {
    render(
      <ActionButton onClick={mockOnClick} variant="destructive">
        Delete
      </ActionButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');
  });

  it('should apply custom className', () => {
    render(
      <ActionButton onClick={mockOnClick} className="custom-class">
        Click me
      </ActionButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should apply primary classes for default variant', () => {
    render(
      <ActionButton onClick={mockOnClick}>
        Click me
      </ActionButton>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-primary');
  });
});
