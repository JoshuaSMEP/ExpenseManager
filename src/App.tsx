import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AnimatedBackground, Navigation, Sidebar } from './components/layout';
import {
  OnboardingPage,
  LoginPage,
  DashboardPage,
  NewExpensePage,
  ExpenseDetailPage,
  ExpensesPage,
  ApprovalPage,
  APDashboardPage,
  SettingsPage,
  NotificationsPage,
  ReportsPage,
  CardsPage,
  TripsPage,
  PolicyPage,
  SearchPage,
  AdminPage,
  EditExpensePage,
  ManualExpensePage,
  AnalyticsPage,
  CategoryBreakdownPage,
} from './pages';
import { useStore } from './store/useStore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isOnboarded } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isOnboarded } = useStore();

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to={isOnboarded ? '/dashboard' : '/onboarding'} replace />
            ) : (
              <LoginPage />
            )
          }
        />

        {/* Onboarding - requires auth but not onboarding completion */}
        <Route
          path="/onboarding"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : isOnboarded ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <OnboardingPage />
            )
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <ExpensesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense/new"
          element={
            <ProtectedRoute>
              <NewExpensePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense/:id"
          element={
            <ProtectedRoute>
              <ExpenseDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/approvals"
          element={
            <ProtectedRoute>
              <ApprovalPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ap-dashboard"
          element={
            <ProtectedRoute>
              <APDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cards"
          element={
            <ProtectedRoute>
              <CardsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trips"
          element={
            <ProtectedRoute>
              <TripsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/policy"
          element={
            <ProtectedRoute>
              <PolicyPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <SearchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense/edit/:id"
          element={
            <ProtectedRoute>
              <EditExpensePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/expense/manual"
          element={
            <ProtectedRoute>
              <ManualExpensePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoryBreakdownPage />
            </ProtectedRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function MainContent() {
  const location = useLocation();

  // Pages that don't need sidebar/nav spacing
  const noSidebarPages = ['/login', '/onboarding'];
  const noNavPages = ['/login', '/onboarding', '/expense/new'];

  const needsSidebarSpacing = !noSidebarPages.some(p => location.pathname.startsWith(p));
  const needsNavSpacing = !noNavPages.some(p => location.pathname.startsWith(p));

  return (
    <main className={needsSidebarSpacing ? 'sidebar-offset' : ''}>
      <div className={needsNavSpacing ? 'pb-24 md:pb-0' : ''}>
        <AppRoutes />
      </div>
    </main>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <AnimatedBackground />
        <Sidebar />
        <MainContent />
        <Navigation />
      </div>
    </Router>
  );
}

export default App;
