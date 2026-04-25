import { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AuthBootstrap from "@/components/AuthBootstrap";

const Index = lazy(() => import("./pages/Index.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

function RouteFallback() {
  return (
    <div className="min-h-[100dvh] bg-background px-safe pb-safe font-mono text-sm text-muted-foreground flex items-center justify-center">
      Loading…
    </div>
  );
}

const App = () => (
  <>
    <AuthBootstrap />
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </>
);

export default App;
