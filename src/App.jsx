import { useState, useEffect } from 'react';
import { UserProvider, useUser } from './context/UserContext';
import Login from './pages/Login';
import Layout from './components/Layout';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminTasks from './pages/Admin/Tasks';
import AdminUsers from './pages/Admin/Users';
import AdminAssign from './pages/Admin/Assign';
import AdminLedger from './pages/Admin/Ledger';
import AdminReview from './pages/Admin/Review';
import UserDashboard from './pages/User/Dashboard';
import UserTasks from './pages/User/Tasks';
import UserLedger from './pages/User/Ledger';
import Inspection from './pages/User/Inspection';

function AppContent() {
  const { user, loading } = useUser();
  const [currentPage, setCurrentPage] = useState(getCurrentPage());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getCurrentPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <PageRenderer page={currentPage} />
    </Layout>
  );
}

function getCurrentPage() {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) {
    return path;
  }
  if (path.startsWith('/user')) {
    return path;
  }
  return '/user';
}

function PageRenderer({ page }) {
  switch (page) {
    case '/admin':
      return <AdminDashboard />;
    case '/admin/tasks':
      return <AdminTasks />;
    case '/admin/users':
      return <AdminUsers />;
    case '/admin/assign':
      return <AdminAssign />;
    case '/admin/ledger':
      return <AdminLedger />;
    case '/admin/review':
      return <AdminReview />;
    case '/user':
      return <UserDashboard />;
    case '/user/tasks':
      return <UserTasks />;
    case '/user/ledger':
      return <UserLedger />;
    case '/user/inspection':
      return <Inspection />;
    default:
      return <UserDashboard />;
  }
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
