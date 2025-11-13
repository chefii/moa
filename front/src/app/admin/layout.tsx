import RoleGuard from '@/components/auth/RoleGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { UserRole } from '@/store/authStore';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[UserRole.SUPER_ADMIN, UserRole.BUSINESS_ADMIN]}>
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}
