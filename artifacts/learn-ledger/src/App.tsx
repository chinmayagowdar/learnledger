import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
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
import NotFound from "@/pages/not-found";

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

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <AppLayout><Dashboard /></AppLayout>} />
      <Route path="/assessments" component={() => <AppLayout><AssessmentsPage /></AppLayout>} />
      <Route path="/assessments/:id/quiz">
        {(params) => <AppLayout><QuizPage assessmentId={params.id || ''} /></AppLayout>}
      </Route>
      <Route path="/credentials" component={() => <AppLayout><CredentialsPage /></AppLayout>} />
      <Route path="/skills" component={() => <AppLayout><SkillsPage /></AppLayout>} />
      <Route path="/verify" component={() => <AppLayout><VerifyPage /></AppLayout>} />
      <Route path="/verify/:hash">
        {(params) => <AppLayout><VerifyHashPage hash={params.hash || ''} /></AppLayout>}
      </Route>
      <Route path="/admin/issue" component={() => <AppLayout><AdminIssuePage /></AppLayout>} />
      <Route component={() => <AppLayout><NotFound /></AppLayout>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
