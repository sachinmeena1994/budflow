import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { Activity, ArrowRight, ChevronDown, ChevronRight, Clock, User } from 'lucide-react';
import { useAuditHistory, createFieldFormatter } from '@/hooks/useAuditHistory';
import { useAuditLookupOptions } from '@/hooks/useAuditLookupOptions';
import { useWorkTypeOptions } from '@/hooks/useWorkTypeOptions';

// ------------------------- helpers -------------------------
const DECISION_KEYS = new Set(['approved_by', 'approved_at', 'approval_comment']);

function getActionColor(action: string) {
  switch (action.toUpperCase()) {
    case 'ADD':
    case 'CREATE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'EDIT':
    case 'UPDATE':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'DELETE':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'APPROVED':
    case 'APPROVE':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
    case 'REJECT':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

const EXCLUDE_KEYS = new Set([
  'task_id',
  'work_entry_id',
  'entry_payload',
  'version',
  'log_id',
  'entity_id',
  'actor_id',
  'actor_name_internal',
  'grams_per_labor_hour',
  'retention_percentage',
]);

const ORDER = [
  'server_task_id',
  'approval_status',
  'work_type_code',
  'work_type',
  'date',
  'site_id',
  'strain',
  'technician_refs',
  'batch_ref',
  'total_plants',
  'team_size',
  'plants_per_hour',
  'first4_of_bt',
  'premium_retention_percentage',
  'input_weight',
  'output_weight',
  'trimmed_percentage',
  'grams_per_operator_hour',
  'duration_hours',
  'labor_minutes',
  'sample_bag_mass',
  'wet_weight',
  'wet_weight_grams',
  'output_weight_grams',
  'comment',
  'created_by',
  'created_at',
  'approved_by',
  'approved_at',
];

function normalizeRecord(raw: any): Record<string, any> {
  if (!raw) return {};
  const flat: Record<string, any> = { ...raw };
  const payload = raw.entry_payload || {};
  delete flat.entry_payload;

  Object.entries(payload).forEach(([k, v]) => {
    if (!flat[k] && v !== undefined && v !== null && v !== '') {
      flat[k] = v;
    }
  });

  Object.keys(flat).forEach((k) => {
    const v = flat[k];
    const shouldRemove =
      EXCLUDE_KEYS.has(k) ||
      v === undefined ||
      v === null ||
      v === '' ||
      (Array.isArray(v) && v.length === 0) ||
      (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);

    if (shouldRemove) delete flat[k];
  });

  return flat;
}

function sortKeys(keys: string[]) {
  return keys.sort((a, b) => {
    const ai = ORDER.indexOf(a);
    const bi = ORDER.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}

function isDecisionAction(action?: string) {
  return /^(approve|approved|reject|rejected)$/i.test(String(action || ''));
}

// ------------------------- component -------------------------

interface AuditHistoryModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  entryId: string;
  title?: string;
  siteOptions?: { id: string; label: string }[];
  strainOptions?: { id: string; name: string }[];
  technicianOptions?: { id: string; name: string }[];
  userOptions?: { id: string; name: string }[];
  batchOptions?: { id: string; product_name: string }[];
}

export function AuditHistoryModalNew({
  isOpen,
  onClose,
  entryId,
  title = 'Entry History',
  siteOptions = [],
  strainOptions = [],
  technicianOptions = [],
  userOptions = [],
  batchOptions = [],
}: AuditHistoryModalNewProps) {
  const { auditLogs: history, isLoading, error, refetch } = useAuditHistory(entryId);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const {
    siteOptions: localSiteOpts,
    strainOptions: localStrainOpts,
    userOptions: localUserOpts,
    technicianOptions: localTechOpts,
    batchOptions: localBatchOpts,
  } = useAuditLookupOptions();
  const { rawFields } = useWorkTypeOptions();

  const fieldLabels = useMemo(() => {
    const map: Record<string, string> = {};
    rawFields.forEach((f) => {
      if (f.field_key && f.label) map[f.field_key] = f.label;
    });
    return map;
  }, [rawFields]);

  const labelFor = (key: string, record?: any) => {
    if (key === 'server_task_id') return 'Task ID';
    if (key === 'approval_comment') return 'Comment';

    const status = record?.approval_status;
    if (status === 'Rejected') {
      if (key === 'approved_by') return 'Rejected By';
      if (key === 'approved_at') return 'Rejected At';
      if (key === 'comment') return 'Rejection Comment';
    }
    return fieldLabels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  useEffect(() => {
    if (isOpen && entryId) refetch();
  }, [isOpen, entryId]);

  const formatValue = useMemo(() => {
    const formatter = createFieldFormatter({
      siteOptions: localSiteOpts.length ? localSiteOpts : siteOptions,
      strainOptions: localStrainOpts.length ? localStrainOpts : strainOptions,
      technicianOptions: localTechOpts.length ? localTechOpts : technicianOptions,
      userOptions: localUserOpts.length ? localUserOpts : userOptions,
      batchOptions: localBatchOpts.length ? localBatchOpts : batchOptions,
    });

    const userNameFor = (id?: string) => {
      if (!id) return '-';
      const all = (localUserOpts.length ? localUserOpts : userOptions) ?? [];
      const u = all.find((u) => String(u.id) === String(id));
      return u?.name ?? u?.label ?? id;
    };

    return (value: any, key: string) => {
      if (key === 'server_task_id') return value ? String(value).toUpperCase() : '-';
      if (['work_type_code', 'work_type'].includes(key)) {
        return typeof value === 'string'
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : String(value ?? '-');
      }
      if (key === 'created_by' || key === 'approved_by') {
        return userNameFor(value as string | undefined);
      }
      if (['date', 'created_at', 'approved_at'].includes(key)) return value || '-';
      if (typeof value === 'number')
        return Number.isInteger(value) ? value.toString() : value.toFixed(2);
      return formatter(value, key);
    };
  }, [
    localSiteOpts,
    localStrainOpts,
    localTechOpts,
    localUserOpts,
    localBatchOpts,
    siteOptions,
    strainOptions,
    technicianOptions,
    userOptions,
    batchOptions,
  ]);

  const resolveActorName = useMemo(() => {
    const userNameFor = (id?: string | null) => {
      const s = (id ?? '').toString().trim();
      if (!s || s === 'undefined' || s === 'null') return '-';
      const all = (localUserOpts.length ? localUserOpts : userOptions) ?? [];
      const u = all.find((u) => String(u.id) === s);
      return u?.name ?? u?.label ?? '-';
    };

    return (entry: any) => {
      const action = entry.action?.toUpperCase();
      const newData = entry.changes?.newData;
      if ((action === 'ADD' || action === 'CREATE') && newData?.created_by) {
        return userNameFor(newData.created_by);
      }
      if (entry.actor_id) {
        return userNameFor(entry.actor_id);
      }
      if (entry.actor_name && entry.actor_name !== 'Admin User') {
        return entry.actor_name;
      }
      return 'Unknown User';
    };
  }, [localUserOpts, userOptions]);

  useEffect(() => {
    if (history?.length) setExpanded({ [history[0].version]: true });
  }, [history]);

  const toggle = (v: number) => setExpanded((p) => ({ ...p, [v]: !p[v] }));

  // --- use single helper: isDecisionAction(action) ---
  const renderCreated = (record: any, action?: string) => {
    const flat = normalizeRecord(record);
    let keys = sortKeys(
      Object.keys(flat).filter(
        (k) => labelFor(k, flat) && flat[k] !== undefined && flat[k] !== null && flat[k] !== '',
      ),
    );

    if (!isDecisionAction(action)) {
      keys = keys.filter((k) => !DECISION_KEYS.has(k));
    }

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-green-700">Entry Created</div>
        <div className="grid grid-cols-2 gap-2">
          {keys.map((k) => (
            <div
              key={k}
              className="flex items-center justify-between rounded border border-green-200 bg-green-50 px-2 py-1.5"
            >
              <span className="text-xs font-medium">{labelFor(k, flat)}</span>
              <span className="ml-2 whitespace-pre-wrap break-words break-all text-xs text-green-800">
                {formatValue(flat[k], k)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUpdated = (oldData: any, newData: any, action?: string) => {
    const oldFlat = normalizeRecord(oldData);
    const newFlat = normalizeRecord(newData);
    const allKeys = sortKeys(
      Array.from(new Set([...Object.keys(oldFlat), ...Object.keys(newFlat)])),
    );
    const changed = new Set(
      allKeys.filter((k) => JSON.stringify(oldFlat[k]) !== JSON.stringify(newFlat[k])),
    );

    if (isDecisionAction(action)) {
      Array.from(DECISION_KEYS).forEach((k) => {
        if (k in oldFlat || k in newFlat) changed.add(k);
      });
    }

    const diffs = sortKeys(Array.from(changed));
    if (diffs.length === 0) {
      return <div className="text-sm text-muted-foreground">No changes detected</div>;
    }

    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-blue-700">
          {diffs.length} field{diffs.length > 1 ? 's' : ''} changed
        </div>
        {diffs.map((k) => (
          <div
            key={k}
            className="flex flex-col gap-2 rounded border border-amber-200 bg-amber-50 p-3"
          >
            <div className="text-sm font-medium text-amber-800">{labelFor(k, newFlat)}</div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="mb-1 text-xs text-gray-500">Before</div>
                <div className="whitespace-pre-wrap break-words break-all rounded border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-800">
                  {formatValue(oldFlat[k], k)}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div className="flex-1">
                <div className="mb-1 text-xs text-gray-500">After</div>
                <div className="whitespace-pre-wrap break-words break-all rounded border border-green-200 bg-green-50 px-2 py-1 text-sm text-green-800">
                  {formatValue(newFlat[k], k)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDeleted = () => <div className="text-sm font-medium text-red-700">Entry Deleted</div>;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] w-[92vw] max-w-4xl overflow-hidden p-0">
        <div className="flex h-full max-h-[85vh] flex-col">
          <DialogHeader className="shrink-0 px-6 py-4">
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {title} –{' '}
              {history?.[0]?.changes?.newData?.server_task_id?.toUpperCase() ??
                history?.[0]?.server_task_id?.toUpperCase() ??
                '-'}
            </DialogTitle>
          </DialogHeader>

          <Separator />

          {isLoading ? (
            <div className="flex min-h-0 flex-1 items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          ) : error ? (
            <div className="min-h-0 flex-1 overflow-auto px-6 py-8 text-center text-destructive">
              Failed to load history. Please try again.
            </div>
          ) : !history?.length ? (
            <div className="min-h-0 flex-1 overflow-auto px-6 py-8 text-center text-muted-foreground">
              No history found for this entry.
            </div>
          ) : (
            <ScrollArea className="min-h-0 flex-1 px-6 py-4">
              <div className="space-y-4">
                {history.map((h) => {
                  const changes = h.changes || {};
                  const newData = changes.newData;
                  const oldData = changes.oldData;
                  const createdOnly = !oldData && !!newData;
                  const deletedOnly = !!oldData && !newData;
                  const updated = !!oldData && !!newData;
                  return (
                    <Card key={h.id} className="border-l-4 border-l-primary">
                      <CardHeader className="cursor-pointer pb-3" onClick={() => toggle(h.version)}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge className={getActionColor(h.action)}>
                              {h.action.toUpperCase()}
                            </Badge>
                            <span className="font-mono text-sm text-muted-foreground">
                              v{h.version}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {format(new Date(h.timestamp), "MMM dd, yyyy 'at' HH:mm")}
                            {expanded[h.version] ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Changed by: {resolveActorName(h)}</span>
                        </div>
                      </CardHeader>
                      {expanded[h.version] && (
                        <>
                          <Separator />
                          <CardContent className="pt-4">
                            {createdOnly && renderCreated(newData, h.action)}
                            {deletedOnly && renderDeleted()}
                            {updated && renderUpdated(oldData, newData, h.action)}
                          </CardContent>
                        </>
                      )}
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
