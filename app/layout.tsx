import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'RESQ AI — Intelligent Emergency Response Platform',
  description: 'AI-powered emergency reporting, monitoring, resource management, and rescue coordination.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f1117] text-slate-100 antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

