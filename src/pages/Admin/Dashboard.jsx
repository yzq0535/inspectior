import { useUser } from '../../context/UserContext';
import { getTasks, getUsers, getPendingInspections, getTodayInspections } from '../../data';

export default function AdminDashboard() {
  const { user } = useUser();
  
  const tasks = getTasks();
  const activeTasks = tasks.filter(t => t.status === 'active');
  const users = getUsers();
  const activeUsers = users.filter(u => u.role === 'user');
  const pendingInspections = getPendingInspections();
  const todayInspections = getTodayInspections();

  const stats = [
    { label: '任务总数', value: activeTasks.length, color: '#0762F7' },
    { label: '员工数量', value: activeUsers.length, color: '#52c41a' },
    { label: '待审核', value: pendingInspections.length, color: '#faad14' },
    { label: '今日巡检', value: todayInspections.length, color: '#13c2c2' }
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">管理后台</h1>
        <span className="welcome-text">欢迎回来，{user.name}</span>
      </div>

      <div className="stat-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-value" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="card-title">待审核巡检记录</h3>
        {pendingInspections.length > 0 ? (
          <div className="task-list">
            {pendingInspections.slice(0, 5).map((inspection) => {
              const task = getTasks().find(t => t.id === inspection.taskId);
              const user = getUsers().find(u => u.id === inspection.userId);
              return (
                <div key={inspection.id} className="task-item">
                  <div>
                    <div className="task-name">{task?.name}</div>
                    <div className="task-meta">{user?.name} | {new Date(inspection.inspectedAt).toLocaleString()}</div>
                  </div>
                  <span className="status-tag status-pending">待审核</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">暂无待审核记录</div>
        )}
      </div>

      <div className="card">
        <h3 className="card-title">快捷操作</h3>
        <div className="quick-actions">
          <a href="/admin/tasks" className="action-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
            </svg>
            <span>添加任务</span>
          </a>
          <a href="/admin/users" className="action-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>管理用户</span>
          </a>
          <a href="/admin/assign" className="action-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 11H5"/>
              <path d="M12 19V7"/>
            </svg>
            <span>任务分配</span>
          </a>
          <a href="/admin/review" className="action-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span>考核评分</span>
          </a>
        </div>
      </div>
    </div>
  );
}
