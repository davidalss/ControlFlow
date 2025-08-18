import React from 'react';
import Layout from './Layout';
import SeverinoProvider from './SeverinoProvider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SeverinoProvider>
      <Layout>
        {children}
      </Layout>
    </SeverinoProvider>
  );
}
