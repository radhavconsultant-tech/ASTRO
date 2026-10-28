import { useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";
import Dashboard from "@/pages/Dashboard";
import ObservatoryPage from "@/pages/ObservatoryPage";
import ExplorerPage from "@/pages/ExplorerPage";
import NewChartPage from "@/pages/NewChartPage";
import ModulePage from "@/pages/ModulePage";
import DashaPage from "@/pages/DashaPage";
import SadeSatiPage from "@/pages/SadeSatiPage";
import RulingPage from "@/pages/RulingPage";
import DashaPrint from "@/pages/DashaPrint";
import ReportPrint from "@/pages/ReportPrint";
import HoraryPage from "@/pages/HoraryPage";
import CareerPage from "@/pages/CareerPage";
import ComparePage from "@/pages/ComparePage";
import TransitCalendarPage from "@/pages/TransitCalendarPage";

function Shell() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="star-noise flex min-h-screen bg-[#0b0f19] text-slate-100">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/observatory" element={<ObservatoryPage />} />
            <Route path="/explorer" element={<ExplorerPage />} />
            <Route path="/charts/new" element={<NewChartPage />} />
            <Route path="/dasha" element={<DashaPage />} />
            <Route path="/modules/dasha" element={<Navigate to="/dasha" replace />} />
            <Route path="/sade-sati" element={<SadeSatiPage />} />
            <Route path="/modules/sade-sati" element={<Navigate to="/sade-sati" replace />} />
            <Route path="/ruling" element={<RulingPage />} />
            <Route path="/horary" element={<HoraryPage />} />
            <Route path="/career" element={<CareerPage />} />
            <Route path="/modules/career" element={<Navigate to="/career" replace />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/transits" element={<TransitCalendarPage />} />
            <Route path="/modules/horary" element={<Navigate to="/horary" replace />} />
            <Route path="/modules/ruling-planets" element={<Navigate to="/ruling" replace />} />
            <Route path="/modules/:id" element={<ModulePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <TooltipProvider delayDuration={200}>
          <Routes>
            <Route path="/print/dasha" element={<DashaPrint />} />
            <Route path="/print/report" element={<ReportPrint />} />
            <Route path="*" element={<Shell />} />
          </Routes>
          <Toaster theme="dark" position="bottom-right" />
        </TooltipProvider>
      </AppProvider>
    </BrowserRouter>
  );
}
