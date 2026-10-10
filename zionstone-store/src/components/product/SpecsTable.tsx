'use client';

import { Check } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table';
import type { ProductSpecs } from '@/data/products';

interface SpecsTableProps {
  specs?: ProductSpecs;
  features?: string[];
}

const categoryLabels: Record<string, string> = {
  general: 'General',
  dimensions: 'Dimensions',
  connectivity: 'Connectivity',
  power: 'Power',
  audio: 'Audio',
};

export function SpecsTable({ specs, features }: SpecsTableProps) {
  const hasSpecs = specs && Object.keys(specs).length > 0;
  const hasFeatures = features && features.length > 0;

  if (!hasSpecs && !hasFeatures) {
    return (
      <p className="text-muted-foreground py-8 text-center">
        No specifications available for this product.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {hasFeatures && (
        <div>
          <h3 className="text-lg font-semibold tracking-tight mb-4">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted rounded-2xl">
                {/*
                  Neutral, like the three non-shipping circles in
                  `ValueProps.tsx`: one gold disc per feature row is a pattern,
                  not an accent, and the row is already on `bg-muted` — so the
                  disc takes `bg-background` to stay visible.
                */}
                <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-foreground" aria-hidden="true" />
                </div>
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {specs && Object.entries(specs).map(([category, items]) => {
        if (!items || (Array.isArray(items) && items.length === 0)) return null;
        if (!Array.isArray(items) && Object.keys(items).length === 0) return null;

        return (
          <div key={category}>
            <h4 className="text-md font-semibold mb-3">{categoryLabels[category] || category}</h4>
            <Table>
              <TableBody>
                {Array.isArray(items) ? (
                  items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  Object.entries(items).map(([key, value]) => (
                    <TableRow key={key}>
                      <th scope="row" className="w-1/3 p-4 text-left align-middle font-medium">
                        {key}
                      </th>
                      <TableCell>{String(value)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
