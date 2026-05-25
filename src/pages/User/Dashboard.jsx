import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { getAssignmentsByUserId, getTasks, getTodayInspections, getInspectionsByUserId } from '../../data';

export default function UserDashboard() {
  const { user } = useUser();
  const [todayTasks, setTodayTasks] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const assignments = getAssignmentsByUserId(user.id);
    const todayInspections = getTodayInspections(user.id);
    const completedIds = todayInspections.map(i => i.assignmentId);

    const tasks = assignments
      .filter(a => {
        const task = getTasks().find(t => t.id === a.taskId);
        return task && task.status === 'active';
      })
      .map(a => {
        const task = getTasks().find(t => t.id === a.taskId);
        return {
          ...a,
          task,
          completed: completedIds.includes(a.id)
        };
      });

    setTodayTasks(tasks);
    setCompletedCount(tasks.filter(t => t.completed).length);
  }, [user]);

  const goToInspection = (assignmentId, taskId) => {
    window.history.pushState({}, '', `/user/inspection?assignmentId=${assignmentId}&taskId=${taskId}`);
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">任务巡检</h1>
        <span className="welcome-text">您好，{user?.name}</span>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#52c41a' }}>{completedCount}</div>
          <div className="stat-label">已完成</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#0762F7' }}>{todayTasks.length}</div>
          <div className="stat-label">总任务</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#faad14' }}>{todayTasks.length - completedCount}</div>
          <div className="stat-label">待完成</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#13c2c2' }}>{getInspectionsByUserId(user?.id).length}</div>
          <div className="stat-label">累计完成</div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">今日任务</h3>
        {todayTasks.length > 0 ? (
          <div className="task-list">
            {todayTasks.map((item) => (
              <div key={item.id} className={`task-item ${item.completed ? 'completed' : ''}`}>
                <div className="task-info">
                  <div className="task-name">{item.task?.name}</div>
                  <div className="task-desc">{item.task?.description}</div>
                </div>
                <div className="task-action">
                  {item.completed ? (
                    <span className="status-tag status-approved">已完成</span>
                  ) : (
                    <button className="btn btn-primary" onClick={() => goToInspection(item.id, item.taskId)}>
                      执行巡检
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">暂无今日任务</div>
        )}
      </div>

      <div className="card">
        <h3 className="card-title">检查标准</h3>
        <div className="standards-list">
          {todayTasks.slice(0, 2).map((item) => (
            <div key={item.id} className="standards-item">
              <h4 className="standards-title">{item.task?.name}</h4>
              {item.task?.standards.map((std, i) => (
                <div key={i} className="standard-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#52c41a" strokeWidth="2">
                    <path d="M2 8l3 3L14 3"/>
                  </svg>
                  <span>{std}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
