// WHAT: Suspense owns loading feedback for modules downloaded on navigation.
import { lazy, Suspense } from 'react';
// WHAT: Declarative routes map browser locations to elements.
import { NavLink, Route, Routes } from 'react-router-dom';
// BOUNDARY: Reuse presentation through the frontend library's public API.
import { PageState } from '@nx-fullstack-learning/frontend-ui';

// WHY: Split feature routes into separate production chunks.
const TasksPage = lazy(() => import('../pages/tasks-page'));
const PerformancePage = lazy(() => import('../pages/performance-page'));
const ArchitecturePage = lazy(() => import('../pages/architecture-page'));

export function App() {
  return (
    <div className="shell">
      <header>
        <h1>Full-stack learning lab</h1>
        {/* WHAT: Give assistive technology a name for the primary navigation landmark. */}
        <nav aria-label="Primary navigation">
          <NavLink to="/">Tasks</NavLink>
          <NavLink to="/performance">Virtualization</NavLink>
          <NavLink to="/architecture">Architecture</NavLink>
        </nav>
      </header>

      <main>
        {/* WHAT: Render useful feedback while the selected route chunk loads. */}
        <Suspense fallback={<PageState>Loading route…</PageState>}>
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            {/* CHECK: Unknown browser locations have an intentional UI outcome. */}
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;