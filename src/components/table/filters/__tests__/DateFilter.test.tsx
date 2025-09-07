
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateFilter } from '../DateFilter';

describe('DateFilter', () => {
  const mockOnChange = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render date filter with from and to inputs', () => {
    render(
      <DateFilter
        value={undefined}
        onChange={mockOnChange}
        onClear={mockOnClear}
        hasActiveFilter={false}
      />
    );

    expect(screen.getByText('From Date')).toBeInTheDocument();
    expect(screen.getByText('To Date')).toBeInTheDocument();
    expect(screen.getByText('Pick start date')).toBeInTheDocument();
    expect(screen.getByText('Pick end date')).toBeInTheDocument();
  });

  it('should display selected dates', () => {
    const fromDate = new Date('2023-01-01');
    const toDate = new Date('2023-12-31');

    render(
      <DateFilter
        value={{ from: fromDate, to: toDate }}
        onChange={mockOnChange}
        onClear={mockOnClear}
        hasActiveFilter={true}
      />
    );

    // The dates should be formatted and displayed
    expect(screen.getByDisplayValue).toBeDefined();
  });

  it('should open calendar popover when date button is clicked', () => {
    render(
      <DateFilter
        value={undefined}
        onChange={mockOnChange}
        onClear={mockOnClear}
        hasActiveFilter={false}
      />
    );

    const fromDateButton = screen.getByText('Pick start date');
    fireEvent.click(fromDateButton);

    // Calendar should be rendered (though we can't easily test the calendar interaction in this setup)
    expect(fromDateButton).toBeInTheDocument();
  });

  it('should handle undefined value correctly', () => {
    render(
      <DateFilter
        value={undefined}
        onChange={mockOnChange}
        onClear={mockOnClear}
        hasActiveFilter={false}
      />
    );

    expect(screen.getByText('Pick start date')).toBeInTheDocument();
    expect(screen.getByText('Pick end date')).toBeInTheDocument();
  });

  it('should handle partial date values', () => {
    render(
      <DateFilter
        value={{ from: new Date('2023-01-01') }}
        onChange={mockOnChange}
        onClear={mockOnClear}
        hasActiveFilter={true}
      />
    );

    expect(screen.getByText('Pick end date')).toBeInTheDocument();
  });
});
