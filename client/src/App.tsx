/** Clinical Cartography: every route is served within one disciplined command shell so operational context is never lost. */
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { AppShell } from "./components/AppShell";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Procurement from "./pages/Procurement";
import Shipments from "./pages/Shipments";
import Alerts from "./pages/Alerts";
import Insights from "./pages/Insights";
import OperationsReference from "./pages/OperationsReference";
import NotFound from "./pages/NotFound";

function Router() {
  return <AppShell><Switch>
    <Route path="/" component={Dashboard} />
    <Route path="/inventory" component={Inventory} />
    <Route path="/procurement" component={Procurement} />
    <Route path="/shipments" component={Shipments} />
    <Route path="/alerts" component={Alerts} />
    <Route path="/insights" component={Insights} />
    <Route path="/facilities" component={() => <OperationsReference kind="facilities" />} />
    <Route path="/vendors" component={() => <OperationsReference kind="vendors" />} />
    <Route path="/reports" component={() => <OperationsReference kind="reports" />} />
    <Route path="/audit" component={() => <OperationsReference kind="audit" />} />
    <Route path="/settings" component={() => <OperationsReference kind="settings" />} />
    <Route component={NotFound} />
  </Switch></AppShell>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster richColors position="bottom-right" closeButton /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
