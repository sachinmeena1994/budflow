import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Input } from '../Input';

describe('Input Component', () => {
  it('renders an input element with the correct type and placeholder', () => {
    render(<Input type="text" placeholder="Enter text" />);
    const inputElement = screen.getByPlaceholderText('Enter text');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'text');
  });

  it('updates the input value when the user types', () => {
    const onChange = vi.fn();
    render(<Input type="text" onChange={onChange} />);
    const inputElement = screen.getByRole('textbox');
    fireEvent.change(inputElement, { target: { value: 'test input' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('displays the provided value in the input', () => {
    render(<Input type="text" value="initial value" />);
    const inputElement = screen.getByDisplayValue('initial value');
    expect(inputElement).toBeInTheDocument();
  });

  it('applies the disabled attribute when the disabled prop is true', () => {
    render(<Input type="text" disabled />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toBeDisabled();
  });

  it('applies additional CSS classes when className prop is provided', () => {
    render(<Input type="text" className="custom-class" />);
    const inputElement = screen.getByRole('textbox');
    expect(inputElement).toHaveClass('custom-class');
  });

  it('handles different input types correctly', () => {
    render(<Input type="number" />);
    const inputElement = screen.getByRole('spinbutton');
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveAttribute('type', 'number');
  });
});
