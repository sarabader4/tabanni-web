import { Link, useLocation } from "wouter";
import { useGetAdminStats, useListAdminUsers, useListAdoptionRequests, useListFosterRequests, useListPets } from "@workspace/api-client-react";
import {
  LayoutDashboard, PawPrint, Users, Heart, FileHeart, Package, BarChart2, LogOut, ChevronRight, CheckCircle, Star, Clock, TrendingUp, DollarSign
} from "lucide-react";

function AdminSidebar() {
  const [location] = useLocation();
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/pets", label: "Pets", icon: PawPrint },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/adoptions", label: "Adoptions", icon: Heart },
    { href: "/admin/fosters", label: "Fosters", icon: FileHeart },
  ];

  return (
    <aside className="w-64 min-h-screen flex-shrink-0" style={{ background: "#1E2A3A" }}>
      <div className="p-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#FF6B35" }}>
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg">Tabbani</span>
            <p className="text-xs" style={{ color: "#00B8A0" }}>Admin Panel</p>
          </div>
        </Link>
      </div>
      <nav className="p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/admin" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}
                style={active ? { background: "#FF6B35" } : {}}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-6 left-0 w-64 px-4">
        <Link href="/">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Back to Site</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: any; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: `${color}18`, color }}>
          This Month
        </span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  );
}

function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#F8F9FA" }}>
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{title}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}

export { AdminLayout, AdminSidebar };

export default function AdminDashboard() {
  const { data: stats } = useGetAdminStats();

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Total Pets" value={stats?.totalPets ?? 0} icon={PawPrint} color="#FF6B35" />
        <StatCard label="Pending Approval" value={stats?.pendingApproval ?? 0} icon={Clock} color="#F59E0B" />
        <StatCard label="Active Adoptions" value={stats?.adoptionsCount ?? 0} icon={Heart} color="#00B8A0" />
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} color="#6366F1" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard label="Active Fosters" value={stats?.activeFosters ?? 0} icon={FileHeart} color="#EC4899" />
        <StatCard label="Adopted Pets" value={stats?.activeAdoptions ?? 0} icon={CheckCircle} color="#10B981" />
        <StatCard label="New Users Today" value={stats?.newUsersToday ?? 0} icon={TrendingUp} color="#8B5CF6" />
        <StatCard label="Donations This Month" value={`${parseFloat(stats?.totalDonationsThisMonth ?? "0").toFixed(0)} JOD`} icon={DollarSign} color="#FF6B35" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Review Pets", href: "/admin/pets", icon: PawPrint, color: "#FF6B35" },
            { label: "Manage Users", href: "/admin/users", icon: Users, color: "#6366F1" },
            { label: "Adoption Requests", href: "/admin/adoptions", icon: Heart, color: "#00B8A0" },
            { label: "Foster Requests", href: "/admin/fosters", icon: FileHeart, color: "#EC4899" },
          ].map(({ label, href, icon: Icon, color }) => (
            <Link key={href} href={href}>
              <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-300 cursor-pointer transition-all hover:bg-gray-50">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className="font-medium text-gray-700 text-sm">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
