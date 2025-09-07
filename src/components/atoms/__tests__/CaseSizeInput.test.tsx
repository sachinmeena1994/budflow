
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CaseSizeInput } from '../CaseSizeInput';

describe('CaseSizeInput', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with default props', () => {
    render(<CaseSizeInput value={0} onChange={mockOnChange} />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(null); // Empty value displays as null
  });

  it('should display the provided value', () => {
    render(<CaseSizeInput value={12} onChange={mockOnChange} />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveValue(12);
  });

  it('should call onChange when value changes', () => {
    render(<CaseSizeInput value={12} onChange={mockOnChange} />);
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '24' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(24);
  });

  it('should handle non-numeric input by defaulting to 0', () => {
    render(<CaseSizeInput value={12} onChange={mockOnChange} />);
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: 'abc' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it('should handle empty input by defaulting to 0', () => {
    render(<CaseSizeInput value={12} onChange={mockOnChange} />);
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it('should apply error styling when hasError is true', () => {
    render(<CaseSizeInput value={12} onChange={mockOnChange} hasError={true} />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveClass('border-red-500');
  });

  it('should use custom placeholder', () => {
    render(<CaseSizeInput value={0} onChange={mockOnChange} placeholder="Enter amount" />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('placeholder', 'Enter amount');
  });

  it('should apply custom className', () => {
    render(<CaseSizeInput value={12} onChange={mockOnChange} className="custom-class" />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveClass('custom-class');
  });

  it('should have correct input attributes', () => {
    render(<CaseSizeInput value={12} onChange={mockOnChange} />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
    expect(input).toHaveAttribute('min', '0');
  });

  it('should display empty string for 0 value', () => {
    render(<CaseSizeInput value={0} onChange={mockOnChange} />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveDisplayValue('');
  });

  it('should handle floating point numbers by converting to integer', () => {
    render(<CaseSizeInput value={12} onChange={mockOnChange} />);
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '24.7' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(24);
  });

  it('should handle negative numbers by converting to 0', () => {
    render(<CaseSizeInput value={12} onChange={mockOnChange} />);
    
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '-5' } });
    
    expect(mockOnChange).toHaveBeenCalledWith(0);
  });
});
