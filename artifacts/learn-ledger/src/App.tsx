import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import NavBar from "@/components/nav-bar";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import ParticleBackground from "@/components/particle-background";
import PageWrapper from "@/components/page-wrapper";
import Dashboard from "@/pages/dashboard";
import AssessmentsPage from "@/pages/assessments";
import QuizPage from "@/pages/quiz";
import CredentialsPage from "@/pages/credentials";
import SkillsPage from "@/pages/skills";
import VerifyPage from "@/pages/verify";
import VerifyHashPage from "@/pages/verify-hash";
import AdminIssuePage from "@/pages/admin-issue";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import NotFound from "@/pages/not-found";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <ParticleBackground />
      <NavBar />
      <Sidebar />
      <main className="md:ml-[260px] pt-16 pb-16 md:pb-0 transition-all duration-300">
        <PageWrapper>{children}</PageWrapper>
      </main>
      <MobileNav />
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <ParticleBackground />
      {children}
    </div>
  );
}

function ProtectedRoute({ component: Component, ...rest }: { component: React.ComponentType<any>; [key: string]: any }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Redirect to="/sign-in" />;

  return (
    <AppLayout>
      <Component {...rest} />
    </AppLayout>
  );
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ParticleBackground />
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public auth routes — redirect to dashboard if already signed in */}
      <Route path="/sign-in">
        {user ? <Redirect to="/" /> : <AuthLayout><SignInPage /></AuthLayout>}
      </Route>
      <Route path="/sign-up">
        {user ? <Redirect to="/" /> : <AuthLayout><SignUpPage /></AuthLayout>}
      </Route>

      {/* Public verify routes — no auth needed */}
      <Route path="/verify">
        <AppLayout><VerifyPage /></AppLayout>
      </Route>
      <Route path="/verify/:hash">
        {(params) => <AppLayout><VerifyHashPage hash={params.hash || ''} /></AppLayout>}
      </Route>

      {/* Protected routes */}
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/assessments" component={() => <ProtectedRoute component={AssessmentsPage} />} />
      <Route path="/assessments/:id/quiz">
        {(params) => <ProtectedRoute component={QuizPage} assessmentId={params.id || ''} />}
      </Route>
      <Route path="/credentials" component={() => <ProtectedRoute component={CredentialsPage} />} />
      <Route path="/skills" component={() => <ProtectedRoute component={SkillsPage} />} />
      <Route path="/admin/issue" component={() => <ProtectedRoute component={AdminIssuePage} />} />
      <Route component={() => <AppLayout><NotFound /></AppLayout>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
