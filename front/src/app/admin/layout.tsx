import RoleGuard from '@/components/auth/RoleGuard';
import AdminLayout from '@/components/admin/AdminLayout';
import { UserRole } from '@/store/authStore';

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={[
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.MODERATOR,
      UserRole.CONTENT_MANAGER,
      UserRole.SUPPORT_MANAGER,
      UserRole.SETTLEMENT_MANAGER,
      UserRole.BUSINESS_USER,
      UserRole.BUSINESS_MANAGER,
    ]}>
      <AdminLayout>{children}</AdminLayout>
    </RoleGuard>
  );
}
