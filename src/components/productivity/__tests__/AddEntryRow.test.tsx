
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AddEntryRow } from '../AddEntryRow';

// Mock the workType fields
vi.mock('@/components/inventory/workType', () => ({
  workTypeFields: {
    harvest: [
      { field_key: 'date', label: 'Date', type: 'date', required: true },
      { field_key: 'total_plants', label: 'Total Plants', type: 'number', required: true },
      { field_key: 'comment', label: 'Comment', type: 'text', required: false },
    ],
    machine: [
      { field_key: 'date', label: 'Date', type: 'date', required: true },
      { field_key: 'input_weight', label: 'Input Weight', type: 'number', required: true },
    ],
  },
}));

describe('AddEntryRow', () => {
  const mockProps = {
    selectedWorkType: 'harvest',
    onSave: vi.fn(),
    onCancel: vi.fn(),
    siteOptions: [
      { id: 'site1', name: 'Site 1' },
      { id: 'site2', name: 'Site 2' },
    ],
    batchOptions: [
      { id: 'batch1', product_name: 'Batch 1' },
      { id: 'batch2', product_name: 'Batch 2' },
    ],
    technicianOptions: [
      { id: 'tech1', name: 'Tech 1' },
      { id: 'tech2', name: 'Tech 2' },
    ],
    strainOptions: [
      { id: 'strain1', name: 'Strain 1' },
      { id: 'strain2', name: 'Strain 2' },
    ],
    userOptions: [
      { id: 'user1', name: 'User 1' },
      { id: 'user2', name: 'User 2' },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields for selected work type', () => {
    render(<AddEntryRow {...mockProps} />);

    expect(screen.getByDisplayValue(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))).toBeInTheDocument();
    expect(screen.getByText('harvest')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    render(<AddEntryRow {...mockProps} />);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          work_type: 'harvest',
          entry_payload: expect.objectContaining({
            date: expect.any(String),
          }),
        })
      );
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<AddEntryRow {...mockProps} />);

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('handles keyboard interactions', () => {
    render(<AddEntryRow {...mockProps} />);

    const dateInput = screen.getByDisplayValue(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/));
    
    fireEvent.keyDown(dateInput, { key: 'Escape' });
    expect(mockProps.onCancel).toHaveBeenCalled();
  });

  it('renders different fields for different work types', () => {
    const { rerender } = render(<AddEntryRow {...mockProps} />);

    expect(screen.getByText('harvest')).toBeInTheDocument();

    rerender(<AddEntryRow {...mockProps} selectedWorkType="machine" />);

    expect(screen.getByText('machine')).toBeInTheDocument();
  });

  it('initializes with current date', () => {
    render(<AddEntryRow {...mockProps} />);

    const today = new Date().toISOString().split('T')[0];
    expect(screen.getByDisplayValue(today)).toBeInTheDocument();
  });

  it('handles comment input changes', () => {
    render(<AddEntryRow {...mockProps} />);

    const commentInput = screen.getByPlaceholderText('Comment');
    fireEvent.change(commentInput, { target: { value: 'Test comment' } });

    expect(commentInput).toHaveValue('Test comment');
  });

  it('renders auto-generated task ID placeholder', () => {
    render(<AddEntryRow {...mockProps} />);

    expect(screen.getByText('Auto-generated')).toBeInTheDocument();
  });

  it('shows draft status', () => {
    render(<AddEntryRow {...mockProps} />);

    expect(screen.getByText('Draft')).toBeInTheDocument();
  });
});
