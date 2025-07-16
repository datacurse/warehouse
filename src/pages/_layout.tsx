// src/pages/_layout.tsx  (still a server component)
import '../styles.css';
import type { ReactNode } from 'react';
import { WorldProviderClient } from '@/components/WorldProviderClient';

type RootLayoutProps = { children: ReactNode };

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <WorldProviderClient>
      <div className="font-['Nunito']">
        <main>{children}</main>
      </div>
    </WorldProviderClient>
  );
}
