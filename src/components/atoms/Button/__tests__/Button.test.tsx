import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from '../Button';

describe('Button Component', () => {
  it('should render with default props', () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Click me' });
    expect(buttonElement).toBeInTheDocument();
  });

  it('should render with a custom className', () => {
    render(<Button className="custom-class">Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Click me' });
    expect(buttonElement).toHaveClass('custom-class');
  });

  it('should handle onClick event', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(buttonElement);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Click me' });
    expect(buttonElement).toBeDisabled();
  });

  it('should render with a different variant', () => {
    render(<Button variant="secondary">Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Click me' });
    expect(buttonElement).toHaveClass('secondary');
  });

  it('should render with a different size', () => {
    render(<Button size="lg">Click me</Button>);
    const buttonElement = screen.getByRole('button', { name: 'Click me' });
    expect(buttonElement).toHaveClass('lg');
  });
});
