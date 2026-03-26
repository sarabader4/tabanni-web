import { useState, useEffect } from "react";
import {
  User, PawPrint, FileText, Heart, Bell, Users, MapPin, Settings, Edit2, Loader2, CheckCircle2, Clock, XCircle,
} from "lucide-react";
import {
  useGetMyProfile, useUpdateMyProfile, useGetMyPets, useGetMyApplications, useGetMyFavourites, useGetMyDonations, useListLostFoundReports,
} from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

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

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
    approved:  { color: "bg-green-100 text-green-600", icon: CheckCircle2 },
    pending:   { color: "bg-yellow-100 text-yellow-600", icon: Clock },
    rejected:  { color: "bg-red-100 text-red-500", icon: XCircle },
    active:    { color: "bg-green-100 text-green-600", icon: CheckCircle2 },
    completed: { color: "bg-blue-100 text-blue-500", icon: CheckCircle2 },
  };
  const conf = map[status] ?? { color: "bg-gray-100 text-gray-500", icon: Clock };
  const Icon = conf.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold capitalize ${conf.color}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}

export default function Profile() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("Profile");

  const { data: profile, isLoading } = useGetMyProfile();
  const userId = profile?.id ?? null;
  const updateMutation = useUpdateMyProfile();
  const { data: myPets, isLoading: petsLoading } = useGetMyPets();
  const { data: applications, isLoading: appLoading } = useGetMyApplications();
  const { data: favourites, isLoading: favLoading } = useGetMyFavourites();
  const { data: donations, isLoading: donLoading } = useGetMyDonations();
  const { data: lostFoundData, isLoading: lfLoading } = useListLostFoundReports({ limit: 20 });

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

            <nav className="space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                const isActive = activeTab === link.label;
                return (
                  <button
                    key={link.label}
                    onClick={() => setActiveTab(link.label)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive ? "bg-white text-[#1E2A3A]" : "text-white/70 hover:bg-white/10"
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

            {/* ── Profile Tab ── */}
            {activeTab === "Profile" && (
              isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
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
              )
            )}

            {/* ── My Pets Tab ── */}
            {activeTab === "My Pets" && (
              petsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !myPets || myPets.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-semibold text-[#1E2A3A]">No pets listed yet</p>
                  <p className="text-sm mt-1">Pets you list for adoption or fostering will appear here.</p>
                  <Link href="/adopt" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                    Add a Pet
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">My Listed Pets</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {myPets.map((pet) => (
                      <Link key={pet.id} href={`/pets/${pet.id}`}>
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                          <img
                            src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                            alt={pet.name}
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-3">
                            <p className="font-bold text-sm text-[#1E2A3A]">{pet.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{pet.type} · {pet.city}</p>
                            <StatusBadge status={pet.status} />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* ── Applications Tab ── */}
            {activeTab === "Applications" && (
              appLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A]">My Applications</h2>

                  {/* Adoption Requests */}
                  {(applications?.adoptionRequests?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Adoption Requests</h3>
                      <div className="space-y-2">
                        {applications?.adoptionRequests?.map((req) => (
                          <div key={req.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <img
                              src={req.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
                              alt={req.petName || "Pet"}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.petName || "Unknown Pet"}</p>
                              <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            <StatusBadge status={req.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Foster Requests */}
                  {(applications?.fosterRequests?.length ?? 0) > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Foster Requests</h3>
                      <div className="space-y-2">
                        {applications?.fosterRequests?.map((req) => (
                          <div key={req.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <img
                              src={req.petImageUrl || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"}
                              alt={req.petName || "Pet"}
                              className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm text-[#1E2A3A] truncate">{req.petName || "Unknown Pet"}</p>
                              <p className="text-xs text-gray-400">{new Date(req.createdAt).toLocaleDateString()}</p>
                            </div>
                            <StatusBadge status={req.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!applications?.adoptionRequests?.length && !applications?.fosterRequests?.length && (
                    <div className="text-center py-16 text-gray-400">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold text-[#1E2A3A]">No applications yet</p>
                      <p className="text-sm mt-1">Your adoption and foster applications will appear here.</p>
                    </div>
                  )}
                </div>
              )
            )}

            {/* ── Favourite Tab ── */}
            {activeTab === "Favourite" && (
              favLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : !favourites || favourites.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-lg font-semibold text-[#1E2A3A]">No favourites yet</p>
                  <p className="text-sm mt-1">Save pets to your favourites while browsing.</p>
                  <Link href="/adopt" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                    Browse Pets
                  </Link>
                </div>
              ) : (
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Saved Pets</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {favourites.map((pet) => (
                      <Link key={pet.id} href={`/pets/${pet.id}`}>
                        <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-all cursor-pointer">
                          <img
                            src={pet.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                            alt={pet.name}
                            className="w-full h-28 object-cover"
                          />
                          <div className="p-3">
                            <p className="font-bold text-sm text-[#1E2A3A]">{pet.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{pet.type} · {pet.city}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* ── Notifications Tab ── */}
            {activeTab === "Notifications" && (
              <div className="space-y-8">
                {/* Notifications section */}
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Notifications</h2>
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-[#1E2A3A]">No notifications yet</p>
                    <p className="text-sm mt-1">You'll be notified about adoption updates, messages, and more.</p>
                  </div>
                </div>

                {/* Donation history section */}
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Donation History</h2>
                  {donLoading ? (
                    <div className="flex items-center justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : !donations || donations.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 text-gray-400">
                      <p className="font-semibold text-[#1E2A3A]">No donations yet</p>
                      <p className="text-sm mt-1">Your donation activity will appear here.</p>
                      <Link href="/donate" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                        Make a Donation
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {donations.map((don) => (
                        <div key={don.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div>
                            <p className="font-bold text-sm text-[#1E2A3A] capitalize">{don.type} donation</p>
                            <p className="text-xs text-gray-400">{new Date(don.createdAt).toLocaleDateString()}</p>
                            {don.description && <p className="text-xs text-gray-500 mt-0.5">{don.description}</p>}
                          </div>
                          {don.amount && (
                            <span className="font-bold text-primary text-sm">{don.amount} JD</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Lost&Found Tab ── */}
            {activeTab === "Lost&Found" && (
              lfLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div>
                  <h2 className="font-display font-bold text-lg text-[#1E2A3A] mb-4">Recent Lost & Found Reports</h2>
                  {!lostFoundData?.reports || lostFoundData.reports.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                      <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="text-lg font-semibold text-[#1E2A3A]">No reports yet</p>
                      <Link href="/lost-found" className="mt-4 inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm">
                        View Lost & Found
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {lostFoundData.reports.slice(0, 6).map((report) => (
                        <div key={report.id} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                          <div className="relative">
                            <img
                              src={report.imageUrls?.[0] || "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400"}
                              alt={report.name}
                              className="w-full h-24 object-cover"
                            />
                            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-white text-xs font-bold ${report.reportType === "lost" ? "bg-red-500" : "bg-[#00B8A0]"}`}>
                              {report.reportType === "lost" ? "LOST" : "FOUND"}
                            </span>
                          </div>
                          <div className="p-3">
                            <p className="font-bold text-sm text-[#1E2A3A]">{report.name}</p>
                            <p className="text-xs text-gray-400 capitalize">{report.type} · {report.city}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <Link href="/lost-found" className="text-primary text-sm font-bold hover:underline">
                      View All Reports →
                    </Link>
                  </div>
                </div>
              )
            )}

            {/* ── Volunteer / Settings Tabs ── */}
            {(activeTab === "Volunteer" || activeTab === "Settings") && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-lg font-semibold text-[#1E2A3A]">{activeTab}</p>
                <p className="text-sm mt-2">Coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
