import React from 'react';
import { RouterProvider, Outlet } from 'react-router-dom';
// DD's createBrowserRouter wraps the standard one to report route changes to RUM automatically
import { createBrowserRouter } from '@datadog/browser-rum-react/react-router-v6';
import { ErrorBoundary } from '@datadog/browser-rum-react';
import ScrollToTop from './components/ScrollToTop';
import './styles/globals.css';
import { IndexPage } from './pages/IndexPage';
import { GuitarPage } from './pages/GuitarPage';
import { PianoPage } from './pages/PianoPage';
import { ProgressionsPage } from './pages/ProgressionsPage';

// Layout wraps every route so ScrollToTop fires on every navigation
const Layout = () => (
  <>
    <ScrollToTop />
    <Outlet />
  </>
);

// DD's createBrowserRouter is a drop-in replacement — same API, adds RUM view tracking
const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/',       element: <IndexPage /> },
      { path: '/guitar',       element: <GuitarPage /> },
      { path: '/piano',        element: <PianoPage /> },
      { path: '/progressions', element: <ProgressionsPage /> },
    ],
  },
]);

function ErrorFallback({ resetError, error }) {
  return (
    <div className="bg-background text-textMain min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-lg">Something went wrong: <strong>{String(error)}</strong></p>
      <button
        onClick={resetError}
        className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

const App = () => (
  // ErrorBoundary reports caught errors to RUM automatically
  <ErrorBoundary fallback={ErrorFallback}>
    <RouterProvider router={router} />
  </ErrorBoundary>
);

export default App;
