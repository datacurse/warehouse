'use client';

import { ReactNode } from 'react';
import { WorldProvider } from 'koota/react';
import { world } from '@/koota/world';

export function WorldProviderClient({ children }: { children: ReactNode }) {
  return <WorldProvider world={world}>{children}</WorldProvider>;
}
