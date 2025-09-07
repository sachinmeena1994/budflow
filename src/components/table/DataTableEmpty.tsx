import React from 'react';

interface DataTableEmptyProps {
  title: string;
  description?: string;
}

export function DataTableEmpty({ title, description }: DataTableEmptyProps) {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center py-6 text-center">
      <h3 className="content-center text-base font-normal">{title}</h3>
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
