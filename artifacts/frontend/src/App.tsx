import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import OnboardingModal from "@/components/onboarding-modal";
import CityGateModal from "@/components/city-gate-modal";

import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
const Adopt = lazy(() => import("@/pages/adopt"));
const Foster = lazy(() => import("@/pages/foster"));
const PetDetail = lazy(() => import("@/pages/pet-detail"));
const LostFound = lazy(() => import("@/pages/lost-found"));
const LostFoundDetail = lazy(() => import("@/pages/lost-found-detail"));
const Donate = lazy(() => import("@/pages/donate"));
const Gallery = lazy(() => import("@/pages/gallery"));
const GalleryDetail = lazy(() => import("@/pages/gallery-detail"));
const About = lazy(() => import("@/pages/about"));
const Team = lazy(() => import("@/pages/team"));
const Programs = lazy(() => import("@/pages/programs"));
const Sustainability = lazy(() => import("@/pages/sustainability"));
const FAQs = lazy(() => import("@/pages/faqs"));
const Network = lazy(() => import("@/pages/network"));
const Shop = lazy(() => import("@/pages/shop"));
const Profile = lazy(() => import("@/pages/profile"));
const AdminDashboard = lazy(() => import("@/pages/admin/index"));
const AdminPets = lazy(() => import("@/pages/admin/pets"));
const AdminUsers = lazy(() => import("@/pages/admin/users"));
const AdminAdoptions = lazy(() => import("@/pages/admin/adoptions"));
const AdminFosters = lazy(() => import("@/pages/admin/fosters"));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics"));
const AdminDonors = lazy(() => import("@/pages/admin/donors"));
const AdminVolunteers = lazy(() => import("@/pages/admin/volunteers"));
const AdminLostFound = lazy(() => import("@/pages/admin/lost-found"));
const AdminContactMessages = lazy(() => import("@/pages/admin/contact-messages"));
const AdminNotifications = lazy(() => import("@/pages/admin/notifications"));
const AdminGallery = lazy(() => import("@/pages/admin/gallery"));
const NotFound = lazy(() => import("@/pages/not-found"));
const AIChatWidget = lazy(() => import("@/components/ai-chat-widget"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

function PageLoader() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#333E48" }}>
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
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      <Route path="/admin">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminDashboard /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/pets">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminPets /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/users">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminUsers /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/adoptions">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminAdoptions /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/fosters">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminFosters /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/analytics">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminAnalytics /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/donors">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminDonors /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/volunteers">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminVolunteers /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/lost-found">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminLostFound /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/contact-messages">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminContactMessages /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/notifications">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminNotifications /></Suspense></AdminGuard>}
      </Route>
      <Route path="/admin/gallery">
        {() => <AdminGuard><Suspense fallback={<PageLoader />}><AdminGallery /></Suspense></AdminGuard>}
      </Route>

      <Route>
        <Layout>
          <Suspense fallback={<PageLoader />}>
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
              <Route path="/team" component={Team} />
              <Route path="/programs" component={Programs} />
              <Route path="/sustainability" component={Sustainability} />
              <Route path="/faqs" component={FAQs} />
              <Route path="/network" component={Network} />
              <Route path="/shop" component={Shop} />
              <Route path="/profile" component={Profile} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
          <Suspense fallback={null}><AIChatWidget /></Suspense>
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
