
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

// Mock the Input component
vi.mock('@/components/ui/input', () => ({
  Input: React.forwardRef(({ onChange, onFocus, onBlur, value, placeholder, disabled, ...props }: any, ref: any) => (
    <input
      ref={ref}
      {...props}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="smooth-input"
    />
  ))
}));

// Create a test component that uses SmoothInput pattern
const TestSmoothInput = ({ 
  initialValue = '', 
  onValueChange = vi.fn(),
  placeholder = 'Test placeholder',
  disabled = false 
}) => {
  const [localValue, setLocalValue] = React.useState(initialValue);
  const [isFocused, setIsFocused] = React.useState(false);

  React.useEffect(() => {
    if (!isFocused) {
      setLocalValue(initialValue);
    }
  }, [initialValue, isFocused]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    onValueChange(localValue);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onValueChange(e.target.value);
  };

  const { Input } = require('@/components/ui/input');
  
  return (
    <Input
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
};

describe('SmoothInput Component', () => {
  it('renders with initial value', () => {
    render(<TestSmoothInput initialValue="test value" />);
    
    const input = screen.getByTestId('smooth-input');
    expect(input).toHaveValue('test value');
  });

  it('shows placeholder when value is empty', () => {
    render(<TestSmoothInput placeholder="Enter weight" />);
    
    const input = screen.getByTestId('smooth-input');
    expect(input).toHaveAttribute('placeholder', 'Enter weight');
  });

  it('calls onValueChange when input changes', () => {
    const mockOnChange = vi.fn();
    render(<TestSmoothInput onValueChange={mockOnChange} />);
    
    const input = screen.getByTestId('smooth-input');
    fireEvent.change(input, { target: { value: 'new value' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('new value');
  });

  it('maintains focus state correctly', () => {
    render(<TestSmoothInput initialValue="test" />);
    
    const input = screen.getByTestId('smooth-input');
    
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'changed' } });
    
    expect(input).toHaveValue('changed');
  });

  it('updates value on blur', async () => {
    const mockOnChange = vi.fn();
    render(<TestSmoothInput onValueChange={mockOnChange} />);
    
    const input = screen.getByTestId('smooth-input');
    
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'blur test' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('blur test');
    });
  });

  it('handles disabled state', () => {
    render(<TestSmoothInput disabled={true} />);
    
    const input = screen.getByTestId('smooth-input');
    expect(input).toBeDisabled();
  });

  it('syncs with external value changes when not focused', () => {
    const { rerender } = render(<TestSmoothInput initialValue="initial" />);
    
    const input = screen.getByTestId('smooth-input');
    expect(input).toHaveValue('initial');
    
    // Update external value
    rerender(<TestSmoothInput initialValue="updated" />);
    
    expect(input).toHaveValue('updated');
  });

  it('does not sync with external changes when focused', () => {
    const { rerender } = render(<TestSmoothInput initialValue="initial" />);
    
    const input = screen.getByTestId('smooth-input');
    fireEvent.focus(input);
    
    // Update external value while focused
    rerender(<TestSmoothInput initialValue="updated" />);
    
    // Should maintain local value
    expect(input).toHaveValue('initial');
  });
});
