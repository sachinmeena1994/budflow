
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { renderInput } from '../renderInput';
import { ColumnContext } from '../types';

// Mock the UI components
vi.mock('@/components/ui/input', () => ({
  Input: ({ onChange, onFocus, onBlur, value, placeholder, disabled, ...props }: any) => (
    <input
      {...props}
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="input"
    />
  )
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, onValueChange, children }: any) => (
    <div data-testid="select" data-value={value} onClick={() => onValueChange?.('test-value')}>
      {children}
    </div>
  ),
  SelectContent: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  SelectItem: ({ value, children }: any) => (
    <div data-testid="select-item" data-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: any) => <div data-testid="select-trigger">{children}</div>,
  SelectValue: ({ placeholder }: any) => <div data-testid="select-value">{placeholder}</div>
}));

vi.mock('@/components/ui/multi-select', () => ({
  MultiSelect: ({ options, selected, onChange, placeholder }: any) => (
    <div 
      data-testid="multi-select" 
      data-placeholder={placeholder}
      onClick={() => onChange?.(['test-id'])}
    >
      {selected?.length || 0} selected
    </div>
  )
}));

describe('renderInput', () => {
  const mockContext: ColumnContext = {
    editingId: 'test-id',
    tempRow: {
      id: 'test-id',
      entry_payload: { test_field: 'test_value' }
    },
    handleInputChange: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onHistory: vi.fn(),
    onAddToUnapproved: vi.fn(),
    siteOptions: [{ id: 'site1', name: 'Site 1' }],
    batchOptions: [{ id: 'batch1', product_name: 'Batch 1' }],
    technicianOptions: [{ id: 'tech1', name: 'Technician 1' }],
    strainOptions: [{ id: 'strain1', name: 'Strain 1' }],
    userOptions: [{ id: 'user1', name: 'User 1' }],
    workType: 'harvest',
    isAddingNew: false,
    newEntryRef: { current: null },
    setHistoryModalOpen: vi.fn(),
  };

  const mockRow = {
    id: 'test-id',
    entry_payload: { test_field: 'test_value' }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders SmoothInput for text fields in editing mode', () => {
    const result = renderInput('test_field', 'text', mockRow, mockContext);
    
    render(<div>{result}</div>);
    
    expect(screen.getByTestId('input')).toBeInTheDocument();
    expect(screen.getByTestId('input')).toHaveValue('test_value');
  });

  it('renders meaningful placeholders for different field types', () => {
    const result = renderInput('input_weight', 'number', mockRow, mockContext);
    
    render(<div>{result}</div>);
    
    expect(screen.getByTestId('input')).toHaveAttribute('placeholder', 'Enter weight in grams');
  });

  it('renders select component for site_id field', () => {
    const result = renderInput('site_id', 'select', mockRow, mockContext);
    
    render(<div>{result}</div>);
    
    expect(screen.getByTestId('select')).toBeInTheDocument();
    expect(screen.getByTestId('select-value')).toHaveTextContent('Select site');
  });

  it('renders multi-select for technician_refs field', () => {
    const result = renderInput('technician_refs', 'multi-select', mockRow, mockContext);
    
    render(<div>{result}</div>);
    
    expect(screen.getByTestId('multi-select')).toBeInTheDocument();
    expect(screen.getByTestId('multi-select')).toHaveAttribute('data-placeholder', 'Select technicians');
  });

  it('renders readonly display for non-editing mode', () => {
    const nonEditingContext = { ...mockContext, editingId: null, tempRow: null };
    const result = renderInput('test_field', 'text', mockRow, nonEditingContext);
    
    render(<div>{result}</div>);
    
    expect(screen.getByText('test_value')).toBeInTheDocument();
  });

  it('renders disabled input for readonly fields', () => {
    const result = renderInput('task_id', 'text', mockRow, mockContext);
    
    render(<div>{result}</div>);
    
    expect(screen.getByTestId('input')).toBeDisabled();
  });

  it('calls handleInputChange when input value changes', () => {
    const result = renderInput('test_field', 'text', mockRow, mockContext);
    
    render(<div>{result}</div>);
    
    const input = screen.getByTestId('input');
    fireEvent.change(input, { target: { value: 'new_value' } });
    
    expect(mockContext.handleInputChange).toHaveBeenCalledWith('test_field', 'new_value');
  });

  it('handles multi-select technician refs correctly', () => {
    const result = renderInput('technician_refs', 'multi-select', mockRow, mockContext);
    
    render(<div>{result}</div>);
    
    const multiSelect = screen.getByTestId('multi-select');
    fireEvent.click(multiSelect);
    
    expect(mockContext.handleInputChange).toHaveBeenCalledWith('technician_refs', ['test-id']);
  });

  it('displays technician names in readonly mode', () => {
    const rowWithTechnicians = {
      ...mockRow,
      technician_refs: ['tech1']
    };
    const nonEditingContext = { ...mockContext, editingId: null, tempRow: null };
    
    const result = renderInput('technician_refs', 'multi-select', rowWithTechnicians, nonEditingContext);
    
    render(<div>{result}</div>);
    
    expect(screen.getByText('Technician 1')).toBeInTheDocument();
  });
});
