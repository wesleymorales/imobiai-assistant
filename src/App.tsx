import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";
import HomePage from "./pages/HomePage";
import LeadsPage from "./pages/LeadsPage";
import AssistantPage from "./pages/AssistantPage";
import ImoveisPage from "./pages/ImoveisPage";
import ConfigPage from "./pages/ConfigPage";
import MetasPage from "./pages/MetasPage";
import LoginPage from "./pages/LoginPage";
import CadastroPage from "./pages/CadastroPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/leads" element={<LeadsPage />} />
            <Route path="/assistente" element={<AssistantPage />} />
            <Route path="/imoveis" element={<ImoveisPage />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/metas" element={<MetasPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
