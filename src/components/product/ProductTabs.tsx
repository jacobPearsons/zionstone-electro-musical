'use client';

import { FileText, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SpecsTable } from './SpecsTable';
import type { ProductSpecs } from '@/data/products';

interface ProductTabsProps {
  description?: string;
  specs?: ProductSpecs;
  features?: string[];
}

export function ProductTabs({ description, specs, features }: ProductTabsProps) {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="description" className="gap-2">
          <FileText className="w-4 h-4" />
          Description
        </TabsTrigger>
        <TabsTrigger value="specifications" className="gap-2">
          <List className="w-4 h-4" />
          Specifications
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="mt-6">
        <p className="text-muted-foreground leading-relaxed">
          {description || 'No description available.'}
        </p>
      </TabsContent>
      
      <TabsContent value="specifications" className="mt-6">
        <SpecsTable specs={specs} features={features} />
      </TabsContent>
    </Tabs>
  );
}
