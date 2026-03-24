import { useState, useEffect } from "react";
import {
  User, PawPrint, FileText, Heart, Bell, Users, MapPin, Settings, Edit2, Loader2,
} from "lucide-react";
import { useGetMyProfile, useUpdateMyProfile } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const sidebarLinks = [
  { label: "Profile", icon: User },
  { label: "My Pets", icon: PawPrint },
  { label: "Applications", icon: FileText },
  { label: "Favourite", icon: Heart },
  { label: "Notifications", icon: Bell },
  { label: "Volunteer", icon: Users },
  { label: "Lost&Found", icon: MapPin },
  { label: "Settings", icon: Settings },
];

export default function Profile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Profile");

  const { data: profile, isLoading } = useGetMyProfile();
  const updateMutation = useUpdateMyProfile();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    country: "Jordan",
    city: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || "",
        email: profile.email || "",
        password: "",
        phone: profile.phone || "",
        country: profile.country || "Jordan",
        city: profile.city || "",
      });
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        data: {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          country: form.country,
          city: form.city,
        },
      });
      toast({ title: "Profile saved successfully." });
    } catch {
      toast({ title: "Failed to save profile", variant: "destructive" });
    }
  };

  const displayName = profile?.fullName || "Ibrahim Bader";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Sidebar */}
          <div
            className="w-full md:w-64 flex-shrink-0 rounded-2xl p-5 text-white"
            style={{ backgroundColor: "#1E2A3A" }}
          >
            {/* Avatar + Name */}
            <div className="flex flex-col items-center mb-6 pt-2">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3 text-2xl font-bold text-white overflow-hidden">
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <span>{avatarLetter}</span>
                )}
              </div>
              <p className="font-bold text-base">{displayName}</p>
              <button className="flex items-center gap-1 mt-1.5 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-xs transition-colors">
                <Edit2 className="w-3 h-3" /> Edit Profile
              </button>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.label;
                return (
                  <button
                    key={link.label}
                    onClick={() => setActiveTab(link.label)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-white text-[#1E2A3A]"
                        : "text-white/70 hover:bg-white/10"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            {activeTab === "Profile" && (
              <>
                {isLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Profile avatar */}
                    <div className="flex justify-center mb-8">
                      <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white shadow-lg overflow-hidden text-3xl font-bold text-primary">
                        {profile?.avatarUrl ? (
                          <img src={profile.avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <span>{avatarLetter}</span>
                        )}
                      </div>
                    </div>

                    <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Full Name</label>
                        <input
                          value={form.fullName}
                          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Email</label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Password</label>
                        <input
                          type="password"
                          autoComplete="new-password"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="••••••••••••"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Phone Number</label>
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="+962 XX XXXX XXXX"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Country</label>
                        <input
                          value={form.country}
                          onChange={(e) => setForm({ ...form, country: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Jordan"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">City</label>
                        <input
                          value={form.city}
                          onChange={(e) => setForm({ ...form, city: e.target.value })}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-[#1E2A3A] outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Amman"
                        />
                      </div>

                      <div className="col-span-full flex justify-center mt-2">
                        <button
                          type="submit"
                          disabled={updateMutation.isPending}
                          className="px-12 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          {updateMutation.isPending ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}

            {activeTab !== "Profile" && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-semibold">{activeTab}</p>
                <p className="text-sm mt-2">Coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
