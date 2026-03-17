import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';
import { Sd_ProtectedRoute } from './routes/Sd_ProtectedRoute';
import { Sd_PublicRoute } from './routes/Sd_PublicRoute';

// Pages
import { Sd_LoginPage } from './routes/auth/Sd_LoginPage';
import { Sd_RegisterPage } from './routes/auth/Sd_RegisterPage';
import { Sd_DashboardPage } from './routes/dashboard/Sd_DashboardPage';
import { Sd_ActivityPage } from './routes/activity/Sd_ActivityPage';
import { Sd_AthletesPage } from './routes/athletes/Sd_AthletesPage';
import { Sd_AthleteDetailPage } from './routes/athletes/Sd_AthleteDetailPage';
import { Sd_NotFoundPage } from './routes/error/Sd_NotFoundPage';
import { Sd_AppLayout } from './routes/layout/Sd_AppLayout';
import { Sd_NotesPage } from './routes/notes/Sd_NotesPage';
import { Sd_ProfilePage } from './routes/profile/Sd_ProfilePage';
import { Sd_SettingsPage } from './routes/settings/Sd_SettingsPage';
import { Sd_HelpPage } from './routes/help/Sd_HelpPage';
import { Sd_CalculatorPage } from './routes/calculator/Sd_CalculatorPage';
import { Sd_ProgramsPage } from './routes/programs/Sd_ProgramsPage';
import { Sd_ProgramBuilderPage } from './routes/programs/Sd_ProgramBuilderPage';
import { Sd_ClientProgramTrackerPage } from './routes/athletes/Sd_ClientProgramTrackerPage';
import { Sd_FullProgramBuilderPage } from './routes/programs/Sd_FullProgramBuilderPage';
import { Sd_ReportsPage } from './routes/reports/Sd_ReportsPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    element: <Sd_PublicRoute />,
    children: [
      { path: '/login', element: <Sd_LoginPage /> },
      { path: '/register', element: <Sd_RegisterPage /> },
    ],
  },
  {
    element: <Sd_ProtectedRoute />,
    children: [
      {
        element: <Sd_AppLayout />,
        children: [
          { path: '/dashboard', element: <Sd_DashboardPage /> },
          { path: '/activity', element: <Sd_ActivityPage /> },
          { path: '/athletes', element: <Sd_AthletesPage /> },
          { path: '/athletes/:id', element: <Sd_AthleteDetailPage /> },
          { path: '/athletes/:id/program/:programId', element: <Sd_ClientProgramTrackerPage /> },
          { path: '/reports', element: <Sd_ReportsPage /> },
          { path: '/programs', element: <Sd_ProgramsPage /> },
          { path: '/programs/new', element: <Sd_FullProgramBuilderPage /> },
          { path: '/programs/:id/edit', element: <Sd_FullProgramBuilderPage /> },
          { path: '/programs/:id', element: <Sd_ProgramBuilderPage /> },
          { path: '/notes', element: <Sd_NotesPage /> },
          { path: '/profile', element: <Sd_ProfilePage /> },
          { path: '/settings', element: <Sd_SettingsPage /> },
          { path: '/help', element: <Sd_HelpPage /> },
          { path: '/calculator', element: <Sd_CalculatorPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Sd_NotFoundPage />,
  },
]);

export const Sd_AppRouter = () => {
  return <RouterProvider router={router} />;
};
