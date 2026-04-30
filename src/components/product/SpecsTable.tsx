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
          <h3 className="text-lg font-semibold mb-4">Key Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-yellow-600" />
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
                      <TableCell className="font-medium w-1/3">{key}</TableCell>
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
