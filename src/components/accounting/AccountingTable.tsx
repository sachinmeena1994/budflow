
import React, { useState } from "react";
import { DataTable } from "@/components/table/DataTable";
import { TableColumn } from "@/components/table/types";
// Mock data - replace with real API calls
interface AccountingData {
  id: string;
  date: string;
  type: string;
  reference: string;
  account: string;
  amount: number;
  description: string;
}

const useAccountingData = () => ({ 
  data: [] as AccountingData[], 
  isLoading: false 
});
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { format } from "date-fns";

export const AccountingTable: React.FC = () => {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const { data: accountingData, isLoading } = useAccountingData();

  const columns: TableColumn<AccountingData>[] = [
    {
      id: "date",
      header: "Date",
      accessorKey: "date",
      cell: ({ row }) => (
        <span className="font-medium">
          {format(new Date(row.original.date), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
    },
    {
      id: "reference",
      header: "Reference", 
      accessorKey: "reference",
    },
    {
      id: "account",
      header: "Account",
      accessorKey: "account",
    },
    {
      id: "amount",
      header: "Amount",
      accessorKey: "amount",
      cell: ({ row }) => (
        <span className={`font-medium ${row.original.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
          ${Math.abs(row.original.amount).toFixed(2)}
        </span>
      ),
    },
    {
      id: "description",
      header: "Description",
      accessorKey: "description",
    },
  ];

  const handleExport = () => {
    // Create CSV content
    const headers = columns.map(col => col.header).join(',');
    const rows = accountingData.map(row => 
      columns.map(col => {
        const value = row[col.accessorKey as keyof AccountingData];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting-data-${format(new Date(), 'MM/dd/yyyy')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="date-from">From:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-from"
                variant="outline"
                className="w-[240px] pl-3 text-left font-normal"
              >
                {dateRange.from ? (
                  format(dateRange.from, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.from}
                onSelect={(date) => setDateRange(prev => ({ ...prev, from: date }))}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="date-to">To:</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date-to"
                variant="outline"
                className="w-[240px] pl-3 text-left font-normal"
              >
                {dateRange.to ? (
                  format(dateRange.to, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateRange.to}
                onSelect={(date) => setDateRange(prev => ({ ...prev, to: date }))}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={handleExport} variant="outline" className="ml-auto">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={accountingData}
        isLoading={isLoading}
      />
    </div>
  );
};
