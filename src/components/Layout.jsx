import { useUser } from '../context/UserContext';

export default function Layout({ children }) {
  const { user, logout } = useUser();

  if (!user) return null;

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" fill="#0762F7"/>
              <path d="M12 22 L12 10 L20 16 Z" fill="white"/>
            </svg>
          </div>
          <span className="title">任务巡检系统</span>
        </div>
        <div className="header-right">
          <span className="user-name">{user.name}</span>
          <button className="logout-btn" onClick={logout}>退出</button>
        </div>
      </header>

      <div className="app-content">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {(user.role === 'admin' || user.role === 'boss') ? (
              <>
                <NavItem href="/admin">管理首页</NavItem>
                <NavItem href="/admin/tasks">任务管理</NavItem>
                <NavItem href="/admin/users">用户管理</NavItem>
                <NavItem href="/admin/assign">任务分配</NavItem>
                <NavItem href="/admin/ledger">台账查看</NavItem>
                <NavItem href="/admin/review">考核评分</NavItem>
              </>
            ) : (
              <>
                <NavItem href="/user">首页</NavItem>
                <NavItem href="/user/tasks">我的任务</NavItem>
                <NavItem href="/user/ledger">我的台账</NavItem>
              </>
            )}
          </nav>
        </aside>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, children }) {
  const currentPath = window.location.pathname;
  const isActive = currentPath === href;

  return (
    <a
      href={href}
      className={`nav-item ${isActive ? 'active' : ''}`}
      onClick={(e) => {
        e.preventDefault();
        window.history.pushState({}, '', href);
        window.dispatchEvent(new Event('popstate'));
      }}
    >
      {children}
    </a>
  );
}
