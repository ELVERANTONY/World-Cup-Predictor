import { MainLayout } from './MainLayout';
import { Outlet } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export function DashboardLayout() {
  return (
    <MainLayout />
  );
}

export function DashboardContent() {
  return (
    <div>
      <Breadcrumbs />
      <Outlet />
    </div>
  );
}
