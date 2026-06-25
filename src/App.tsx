import { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "@/pages/404";
import { SeoRouteMeta } from "@/components/SeoRouteMeta";
import { appRoutes, renderRouteElement } from "@/routes/appRoutes";

const routeFallback = (
  <div role="status" className="min-h-screen bg-slate-950 p-6 text-slate-100">
    Loading screen...
  </div>
);

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <SeoRouteMeta />
      <Suspense fallback={routeFallback}>
        <Routes>
          {appRoutes.map(route => (
            <Route key={route.path} path={route.path} element={renderRouteElement(route)} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
