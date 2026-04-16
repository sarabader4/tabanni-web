import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import OnboardingModal from "@/components/onboarding-modal";
import CityGateModal from "@/components/city-gate-modal";
import Home from "@/pages/home";
import Adopt from "@/pages/adopt";
import Foster from "@/pages/foster";
import PetDetail from "@/pages/pet-detail";
import LostFound from "@/pages/lost-found";
import LostFoundDetail from "@/pages/lost-found-detail";
import Donate from "@/pages/donate";
import Gallery from "@/pages/gallery";
import GalleryDetail from "@/pages/gallery-detail";
import About from "@/pages/about";
import Shop from "@/pages/shop";
import Profile from "@/pages/profile";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin/index";
import AdminPets from "@/pages/admin/pets";
import AdminUsers from "@/pages/admin/users";
import AdminAdoptions from "@/pages/admin/adoptions";
import AdminFosters from "@/pages/admin/fosters";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminDonors from "@/pages/admin/donors";
import AdminVolunteers from "@/pages/admin/volunteers";
import AdminLostFound from "@/pages/admin/lost-found";
import AdminContactMessages from "@/pages/admin/contact-messages";
import AdminNotifications from "@/pages/admin/notifications";
import NotFound from "@/pages/not-found";
import AIChatWidget from "@/components/ai-chat-widget";

const queryClient = new QueryClient();

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#1E2A3A" }}>
        <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }
  return <>{children}</>;
}

function OnboardingGate() {
  const { onboardingVisible, skipOnboarding } = useAuth();
  if (!onboardingVisible) return null;
  return <OnboardingModal onClose={skipOnboarding} />;
}

function CityGate() {
  const { cityGateVisible } = useAuth();
  if (!cityGateVisible) return null;
  return <CityGateModal />;
}

function AppRoutes() {
  return (
    <>
    <OnboardingGate />
    <CityGate />
    <Switch>
      {/* Auth pages — no layout wrapper */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Admin routes */}
      <Route path="/admin">
        {() => <AdminGuard><AdminDashboard /></AdminGuard>}
      </Route>
      <Route path="/admin/pets">
        {() => <AdminGuard><AdminPets /></AdminGuard>}
      </Route>
      <Route path="/admin/users">
        {() => <AdminGuard><AdminUsers /></AdminGuard>}
      </Route>
      <Route path="/admin/adoptions">
        {() => <AdminGuard><AdminAdoptions /></AdminGuard>}
      </Route>
      <Route path="/admin/fosters">
        {() => <AdminGuard><AdminFosters /></AdminGuard>}
      </Route>
      <Route path="/admin/analytics">
        {() => <AdminGuard><AdminAnalytics /></AdminGuard>}
      </Route>
      <Route path="/admin/donors">
        {() => <AdminGuard><AdminDonors /></AdminGuard>}
      </Route>
      <Route path="/admin/volunteers">
        {() => <AdminGuard><AdminVolunteers /></AdminGuard>}
      </Route>
      <Route path="/admin/lost-found">
        {() => <AdminGuard><AdminLostFound /></AdminGuard>}
      </Route>
      <Route path="/admin/contact-messages">
        {() => <AdminGuard><AdminContactMessages /></AdminGuard>}
      </Route>
      <Route path="/admin/notifications">
        {() => <AdminGuard><AdminNotifications /></AdminGuard>}
      </Route>

      {/* All other routes use the Layout with navbar */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/adopt" component={Adopt} />
            <Route path="/foster" component={Foster} />
            <Route path="/pets/:id" component={PetDetail} />
            <Route path="/lost-found/:id" component={LostFoundDetail} />
            <Route path="/lost-found" component={LostFound} />
            <Route path="/donate" component={Donate} />
            <Route path="/gallery/:id" component={GalleryDetail} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/about" component={About} />
            <Route path="/shop" component={Shop} />
            <Route path="/profile" component={Profile} />
            <Route component={NotFound} />
          </Switch>
          <AIChatWidget />
        </Layout>
      </Route>
    </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
