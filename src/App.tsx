
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import RaftSwcPage from "./pages/RaftSwcPage";
import NotFound from "./pages/NotFound";
import SiteHeader from "@/components/SiteHeader";

function GoToMainPagePage({ label }: { label: string }) {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <div className="mb-6 flex justify-end">
        <button
          className="px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/80 transition"
          onClick={() => navigate("/")}
        >
          Go to Main Page
        </button>
      </div>
      <div>{label}</div>
    </div>
  );
}

const queryClient = new QueryClient();


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SiteHeader />
        <div className="pt-36">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/ecu-extract-parser" element={<Index />} />
            <Route path="/raft-swc" element={<RaftSwcPage />} />
            <Route path="/did-integration" element={<GoToMainPagePage label="DID Integration module coming soon." />} />
            <Route path="/c-code-generation" element={<GoToMainPagePage label="C Code Generation module coming soon." />} />
            <Route path="/capl-generation" element={<GoToMainPagePage label="CAPL Generation module coming soon." />} />
            <Route path="/report-generation" element={<GoToMainPagePage label="Report Generation module coming soon." />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
