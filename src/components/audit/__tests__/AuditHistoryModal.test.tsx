
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuditHistoryModal } from '../AuditHistoryModal';
import { AuditHistoryModalNew } from '@/components/audit/AuditHistoryModalNew';

const mockAuditLogs = [
  {
    id: '1',
    action: 'create',
    timestamp: '2024-05-03T12:00:00.000Z',
    actor_id: 'user123',
    actor_name: 'John Doe',
    version: 1,
    changes: {
      field1: { old: 'oldValue1', new: 'newValue1' },
      field2: { old: 'oldValue2', new: 'newValue2' },
    },
  },
  {
    id: '2',
    action: 'update',
    timestamp: '2024-05-03T13:00:00.000Z',
    actor_id: 'user456',
    actor_name: 'Jane Smith',
    version: 2,
    changes: {
      field3: { old: 'oldValue3', new: 'newValue3' },
    },
  },
];

describe('AuditHistoryModal', () => {
  it('renders the modal with audit history', async () => {
    render(
      <AuditHistoryModalNew
        isOpen={true}
        onClose={vi.fn()}
        entryId="task123"
      />
    );

    expect(screen.getByText('Audit History - Entry task123')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('CREATE')).toBeInTheDocument();
      expect(screen.getByText('Actor: user123')).toBeInTheDocument();
      expect(screen.getByText('UPDATE')).toBeInTheDocument();
      expect(screen.getByText('Actor: user456')).toBeInTheDocument();
    });
  });

  it('displays a loading state when fetching audit logs', () => {
    render(
      <AuditHistoryModalNew
        isOpen={true}
        onClose={vi.fn()}
        entryId="task123"
      />
    );

    expect(screen.getByText('No audit history found for this entry.')).toBeInTheDocument();
  });

  it('displays an error message when no audit logs are provided', async () => {
    render(
      <AuditHistoryModalNew
        isOpen={true}
        onClose={vi.fn()}
        entryId="task123"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No audit history found for this entry.')).toBeInTheDocument();
    });
  });

  it('displays a message when no audit history is found', async () => {
    render(
      <AuditHistoryModalNew
        isOpen={true}
        onClose={vi.fn()}
        entryId="task123"
      />
    );

    await waitFor(() => {
      expect(screen.getByText('No audit history found for this entry.')).toBeInTheDocument();
    });
  });

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn();

    render(
      <AuditHistoryModalNew
        isOpen={true}
        onClose={onClose}
        entryId="task123"
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
