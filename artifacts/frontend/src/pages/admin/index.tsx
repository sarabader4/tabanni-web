import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  useGetAdminStats,
  useListDonations,
} from "@workspace/api-client-react";
import {
  LayoutDashboard,
  PawPrint,
  Heart,
  FileHeart,
  Users,
  BarChart2,
  LogOut,
  ChevronDown,
  ChevronRight,
  Menu,
  DollarSign,
  HandHeart,
  Search,
  Mail,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SIDEBAR_NAV = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Pets Management",
    icon: PawPrint,
    children: [
      { label: "All pets", href: "/admin/pets" },
      { label: "Pending approval", href: "/admin/pets?status=pending" },
      { label: "Add pet", href: "/admin/pets?addPet=true" },
    ],
  },
  { label: "Adoption Requests", href: "/admin/adoptions", icon: Heart },
  { label: "Foster Requests", href: "/admin/fosters", icon: FileHeart },
  {
    label: "Users",
    icon: Users,
    children: [
      { label: "Adopters", href: "/admin/users?role=adopter" },
      { label: "Volunteers", href: "/admin/users?role=volunteer" },
    ],
  },
  { label: "Donors", href: "/admin/donors", icon: DollarSign },
  { label: "Volunteers", href: "/admin/volunteers", icon: HandHeart },
  { label: "Lost & Found", href: "/admin/lost-found", icon: Search },
  { label: "Contact Messages", href: "/admin/contact-messages", icon: Mail },
  { label: "Reports & Analytics", href: "/admin/analytics", icon: BarChart2 },
];

function SidebarItem({ item, depth = 0 }: { item: typeof SIDEBAR_NAV[number]; depth?: number }) {
  const [location] = useLocation();
  const [open, setOpen] = useState(() => {
    if ("children" in item && item.children) {
      return item.children.some(c => location.startsWith(c.href.split("?")[0]));
    }
    return false;
  });

  if ("children" in item && item.children) {
    const Icon = item.icon;
    return (
      <div>
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          <Icon className="w-4 h-4 shrink-0" />
          <span className="flex-1 text-left font-medium">{item.label}</span>
          {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        {open && (
          <div className="ml-7 mt-1 space-y-0.5 border-l border-white/10 pl-3">
            {item.children.map(child => {
              const basePath = child.href.split("?")[0];
              const active = location === basePath;
              return (
                <Link key={child.href} href={child.href}>
                  <div className={`px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${active ? "text-white font-semibold" : "text-gray-400 hover:text-white"}`}>
                    {child.label}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  const navItem = item as { label: string; href: string; icon: typeof LayoutDashboard; exact?: boolean };
  const Icon = navItem.icon;
  const active = navItem.exact ? location === navItem.href : location.startsWith(navItem.href);

  return (
    <Link href={navItem.href}>
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all text-sm ${active ? "bg-[#FF6B35] text-white font-semibold" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
        <Icon className="w-4 h-4 shrink-0" />
        <span className="font-medium">{navItem.label}</span>
      </div>
    </Link>
  );
}

export function AdminSidebar() {
  return (
    <aside className="w-56 min-h-screen flex-shrink-0 flex flex-col" style={{ background: "#1E2A3A" }}>
      <div className="p-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FF6B35" }}>
            <PawPrint className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-base">tabanni</span>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {SIDEBAR_NAV.map(item => (
          <SidebarItem key={item.label} item={item} />
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <Link href="/">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer transition-all text-sm">
            <LogOut className="w-4 h-4" />
            <span className="font-medium">Back to Site</span>
          </div>
        </Link>
      </div>
    </aside>
  );
}

export function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="flex min-h-screen" style={{ background: "#F4F6F8" }}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <Users className="w-4 h-4 text-gray-500" />
            </div>
            <span className="text-sm font-semibold text-gray-700 hidden sm:block">Admin</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <p className="text-sm text-gray-500 mb-2">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

const CHART_DATA = [
  { month: "Jan", adoptions: 8 },
  { month: "Feb", adoptions: 5 },
  { month: "Mar", adoptions: 4 },
  { month: "Apr", adoptions: 12 },
  { month: "May", adoptions: 22 },
  { month: "Jun", adoptions: 28 },
  { month: "Jul", adoptions: 38 },
  { month: "Aug", adoptions: 42 },
  { month: "Sep", adoptions: 52 },
  { month: "Oct", adoptions: 46 },
];

export default function AdminDashboard() {
  const { data: stats } = useGetAdminStats();
  const { data: donationsData } = useListDonations({ limit: 4 });
  const donations = Array.isArray(donationsData) ? donationsData.slice(0, 4) : [];

  const totalDonations = parseFloat(stats?.totalDonationsThisMonth ?? "0");

  return (
    <AdminLayout title="Dashboard">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total pets" value={stats?.totalPets ?? 0} />
        <KpiCard label="Pets pending approval" value={stats?.pendingApproval ?? 0} />
        <KpiCard label="Active adoptions" value={stats?.activeAdoptions ?? 0} />
        <KpiCard label="Active fosters" value={stats?.activeFosters ?? 0} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Adoptions" value={stats?.adoptionsCount ?? 0} />
        <KpiCard label="Total donations" value={`$${totalDonations.toFixed(0)}`} sub="this month" />
        <KpiCard label="New users (today)" value={stats?.newUsersToday ?? 0} />
        <KpiCard label="Sentilonrs" value={0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Adoptions over time</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={CHART_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                labelStyle={{ color: "#1E2A3A", fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="adoptions"
                stroke="#3B82F6"
                strokeWidth={2.5}
                dot={{ fill: "#3B82F6", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Recent donations</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-400">Name</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-400">Amount</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-400">Payment method</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {donations.length > 0 ? donations.map((d) => (
                  <tr key={d.id} className="border-b border-gray-50">
                    <td className="py-3 text-gray-900 font-medium">{d.donorName ?? `Donor #${d.id}`}</td>
                    <td className="py-3 text-gray-700">${parseFloat(d.amount ?? "0").toFixed(0)}</td>
                    <td className="py-3 text-gray-500 capitalize">{d.paymentMethod ?? "—"}</td>
                    <td className="py-3 text-gray-400">
                      {d.createdAt ? new Date(d.createdAt).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
                    </td>
                  </tr>
                )) : (
                  [
                    { name: "Angele Yu", amount: "$150", method: "Visa", date: "Apr 20" },
                    { name: "Neil Sims", amount: "$200", method: "Mastercard", date: "Apr 18" },
                    { name: "Laura Smith", amount: "$100", method: "PayPal", date: "Apr 15" },
                    { name: "John Doe", amount: "$300", method: "Visa", date: "Apr 10" },
                  ].map((row) => (
                    <tr key={row.name} className="border-b border-gray-50">
                      <td className="py-3 text-gray-900 font-medium">{row.name}</td>
                      <td className="py-3 text-gray-700">{row.amount}</td>
                      <td className="py-3 text-gray-500">{row.method}</td>
                      <td className="py-3 text-gray-400">{row.date}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
