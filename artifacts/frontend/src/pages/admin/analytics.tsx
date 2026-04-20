import { useEffect, useState } from "react";
import { AdminLayout } from "./index";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

interface AnalyticsData {
  adoptionsByMonth: { month: string; count: number }[];
  donationsByMonth: { month: string; total: number }[];
  petsByType: { type: string; count: number }[];
  topCities: { city: string | null; count: number }[];
}

const PIE_COLORS = ["#FA8D29", "#3D937F", "#6366F1", "#F59E0B", "#EC4899"];

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-5">{title}</h3>
      {children}
    </div>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    fetch(`${base}/api/admin/stats`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const petsByType = data?.petsByType ?? [];
  const adoptionsByMonth = data?.adoptionsByMonth ?? [];
  const donationsByMonth = data?.donationsByMonth ?? [];
  const topCities = (data?.topCities ?? []).map(c => ({ ...c, city: c.city ?? "Unknown" }));

  const pieData = petsByType.map(p => ({ name: p.type, value: p.count }));

  return (
    <AdminLayout title="Reports & Analytics">
      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Loading analytics...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Pets by Type">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: "No data", value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {(pieData.length > 0 ? pieData : [{ name: "No data", value: 1 }]).map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Top Cities">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topCities} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="city" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="count" fill="#FA8D29" radius={[6, 6, 0, 0]} name="Pets" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Adoptions by Month">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={adoptionsByMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="count" fill="#3D937F" radius={[6, 6, 0, 0]} name="Adoptions" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Donations by Month (JOD)">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={donationsByMonth} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  formatter={(v: number) => [`JOD ${v.toFixed(0)}`, "Donations"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  dot={{ fill: "#6366F1", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}
    </AdminLayout>
  );
}
