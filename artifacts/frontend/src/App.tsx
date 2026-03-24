import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Home from "@/pages/home";
import Adopt from "@/pages/adopt";
import Foster from "@/pages/foster";
import PetDetail from "@/pages/pet-detail";
import LostFound from "@/pages/lost-found";
import Donate from "@/pages/donate";
import Gallery from "@/pages/gallery";
import GalleryDetail from "@/pages/gallery-detail";
import About from "@/pages/about";
import Shop from "@/pages/shop";
import Profile from "@/pages/profile";
import AdminDashboard from "@/pages/admin/index";
import AdminPets from "@/pages/admin/pets";
import AdminUsers from "@/pages/admin/users";
import AdminAdoptions from "@/pages/admin/adoptions";
import AdminFosters from "@/pages/admin/fosters";
import NotFound from "@/pages/not-found";
import AIChatWidget from "@/components/ai-chat-widget";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <Switch>
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/pets" component={AdminPets} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/adoptions" component={AdminAdoptions} />
      <Route path="/admin/fosters" component={AdminFosters} />
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/adopt" component={Adopt} />
            <Route path="/foster" component={Foster} />
            <Route path="/pets/:id" component={PetDetail} />
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
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
