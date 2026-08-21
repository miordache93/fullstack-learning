import { lazy, Suspense } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { PageState } from '@nx-fullstack-learning/frontend-ui';

const TasksPage = lazy(() => import('../pages/tasks-page'));
const PerformancePage = lazy(() => import('../pages/performance-page'));
const ArchitecturePage = lazy(() => import('../pages/architecture-page'));

export function App() {
  return (
    <div className="shell">
      <header>
        <h1>Full-stack learning lab</h1>
        <nav aria-label="Primary navigation">
          <NavLink to="/">Tasks</NavLink>
          <NavLink to="/performance">Virtualization</NavLink>
          <NavLink to="/architecture">Architecture</NavLink>
        </nav>
      </header>

      <main>
        <Suspense fallback={<PageState>Loading route…</PageState>}>
          <Routes>
            <Route path="/" element={<TasksPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/architecture" element={<ArchitecturePage />} />
            <Route path="*" element={<p>Page not found.</p>} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
