// src/pages/_layout.tsx  (still a server component)
import '../styles.css';
import type { ReactNode } from 'react';
// import { WorldProvider } from '@/koota/client';
// import { world } from '@/koota/world';

type RootLayoutProps = { children: ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    // <WorldProvider world={world}>
    <div className="font-['Nunito']">
      {/* <main>{children}</main> */}
    </div>
    // </WorldProvider>
  );
}

export const getConfig = async () => {
  return {
    unstable_disableSSR: true,
    render: "static",
  } as const;
};