import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'

export const unstable_instant = false

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}