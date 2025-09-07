
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ColumnFilter } from '../ColumnFilter';

// Mock the filter components
jest.mock('../StringFilter', () => ({
  StringFilter: () => <div data-testid="string-filter">String Filter</div>
}));

jest.mock('../NumberFilter', () => ({
  NumberFilter: () => <div data-testid="number-filter">Number Filter</div>
}));

jest.mock('../DateFilter', () => ({
  DateFilter: () => <div data-testid="date-filter">Date Filter</div>
}));

jest.mock('../EnumFilter', () => ({
  EnumFilter: () => <div data-testid="enum-filter">Enum Filter</div>
}));

describe('ColumnFilter', () => {
  const mockColumn = {
    id: 'test-column',
    getFilterValue: jest.fn(() => undefined),
    setFilterValue: jest.fn(),
    columnDef: { meta: {} }
  };

  const defaultProps = {
    column: mockColumn,
    isOpen: false,
    onToggle: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render filter trigger button', () => {
    render(<ColumnFilter {...defaultProps} />);
    
    const filterButton = screen.getByRole('button');
    expect(filterButton).toBeInTheDocument();
  });

  it('should show active filter state when filter has value', () => {
    const mockColumnWithValue = {
      ...mockColumn,
      getFilterValue: jest.fn(() => 'test-value')
    };

    render(<ColumnFilter {...defaultProps} column={mockColumnWithValue} />);
    
    // The filter icon should have primary color class when active
    const filterIcon = screen.getByRole('button').querySelector('svg');
    expect(filterIcon).toHaveClass('text-primary');
  });

  it('should render string filter by default', () => {
    render(<ColumnFilter {...defaultProps} isOpen={true} />);
    
    expect(screen.getByTestId('string-filter')).toBeInTheDocument();
  });

  it('should render number filter when type is number', () => {
    const numberColumn = {
      ...mockColumn,
      columnDef: { meta: { filterType: 'number' } }
    };

    render(<ColumnFilter {...defaultProps} column={numberColumn} isOpen={true} />);
    
    expect(screen.getByTestId('number-filter')).toBeInTheDocument();
  });

  it('should render date filter when type is date', () => {
    const dateColumn = {
      ...mockColumn,
      columnDef: { meta: { filterType: 'date' } }
    };

    render(<ColumnFilter {...defaultProps} column={dateColumn} isOpen={true} />);
    
    expect(screen.getByTestId('date-filter')).toBeInTheDocument();
  });

  it('should render enum filter when type is enum', () => {
    const enumColumn = {
      ...mockColumn,
      columnDef: { meta: { filterType: 'enum', enumOptions: ['option1', 'option2'] } }
    };

    render(<ColumnFilter {...defaultProps} column={enumColumn} isOpen={true} />);
    
    expect(screen.getByTestId('enum-filter')).toBeInTheDocument();
  });
});
