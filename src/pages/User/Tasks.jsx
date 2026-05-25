import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { getAssignmentsByUserId, getTasks, checkTodaySubmitted, getAbnormalTasks, getAssignments } from '../../data';

export default function UserTasks() {
  const { user } = useUser();
  const [tasks, setTasks] = useState([]);
  const [abnormalTasks, setAbnormalTasks] = useState([]);

  useEffect(() => {
    if (!user) return;

    // 获取普通任务
    const assignments = getAssignmentsByUserId(user.id);
    
    const taskList = assignments
      .filter(a => {
        if (a.isAbnormal) return false; // 排除异常任务，在单独列表显示
        const task = getTasks().find(t => t.id === a.taskId);
        return task && task.status === 'active';
      })
      .map(a => {
        const task = getTasks().find(t => t.id === a.taskId);
        const submitted = checkTodaySubmitted(a.id, user.id);
        return {
          ...a,
          task,
          submitted,
          itemCount: task?.items?.length || 0,
          isAbnormal: false
        };
      });

    // 获取异常任务
    const allAbnormalTasks = getAbnormalTasks();
    const allAssignments = getAssignments();
    const abnormalList = allAbnormalTasks
      .filter(at => {
        const assignment = allAssignments.find(a => a.taskId === at.id && a.userId === user.id);
        return assignment && at.status === 'pending';
      })
      .map(at => {
        const assignment = allAssignments.find(a => a.taskId === at.id && a.userId === user.id);
        return {
          id: assignment?.id,
          taskId: at.id,
          task: {
            id: at.id,
            name: at.name,
            description: at.description,
            items: at.items,
            status: 'active'
          },
          submitted: false,
          itemCount: at.items?.length || 0,
          isAbnormal: true,
          abnormalTask: at
        };
      });

    setTasks(taskList);
    setAbnormalTasks(abnormalList);
  }, [user]);

  const goToInspection = (assignmentId, taskId, isAbnormal = false) => {
    if (isAbnormal) {
      window.history.pushState({}, '', `/user/inspection?assignmentId=${assignmentId}&taskId=${taskId}&isAbnormal=true`);
    } else {
      window.history.pushState({}, '', `/user/inspection?assignmentId=${assignmentId}&taskId=${taskId}`);
    }
    window.dispatchEvent(new Event('popstate'));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">我的任务</h1>
      </div>

      {/* 异常任务提醒 */}
      {abnormalTasks.length > 0 && (
        <div className="card" style={{marginBottom: '20px', borderLeft: '4px solid #ff4d4f'}}>
          <div style={{padding: '16px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px'}}>
              <span style={{fontSize: '20px'}}>⚠️</span>
              <h3 style={{fontSize: '16px', fontWeight: '600', color: '#ff4d4f', margin: 0}}>
                待处理异常任务 ({abnormalTasks.length})
              </h3>
            </div>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '16px'}}>
              请尽快处理以下异常事项
            </p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
              {abnormalTasks.map((item) => (
                <div key={item.id} style={{
                  padding: '14px',
                  background: '#fff2f0',
                  borderRadius: '8px',
                  border: '1px solid #ffccc7'
                }}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{flex: 1}}>
                      <div style={{fontWeight: '600', marginBottom: '4px', color: '#333'}}>
                        {item.task.name}
                      </div>
                      <div style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>
                        {item.task.description}
                      </div>
                      <div style={{fontSize: '12px', color: '#ff4d4f'}}>
                        异常项：{item.itemCount}项
                      </div>
                    </div>
                    <button 
                      className="btn btn-danger"
                      style={{padding: '8px 16px', fontSize: '13px'}}
                      onClick={() => goToInspection(item.id, item.taskId, true)}
                    >
                      立即处理
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 普通任务列表 */}
      <div className="card">
        <h3 style={{fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#333'}}>
          日常任务
        </h3>
        {tasks.length > 0 ? (
          <div className="task-list">
            {tasks.map((item) => (
              <div key={item.id} className="task-card">
                <div className="task-header">
                  <div className="task-status">
                    {item.submitted ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M9 12l2 2 4-4"/>
                      </svg>
                    ) : (
                      <div className="status-dot"></div>
                    )}
                  </div>
                  <div className="task-info">
                    <div className="task-name">{item.task?.name}</div>
                    <div className="task-meta">
                      {item.submitted ? '今日已完成' : '今日待执行'} · {item.itemCount}个检查项
                    </div>
                  </div>
                </div>

                <div className="task-body">
                  <p className="task-desc">{item.task?.description}</p>
                  <div className="item-preview">
                    <span className="item-label">检查项：</span>
                    {item.task?.items?.slice(0, 3).map((it, i) => (
                      <span key={it.id} className="item-tag">{it.title}</span>
                    ))}
                    {item.task?.items?.length > 3 && (
                      <span className="item-more">+{item.task.items.length - 3}项</span>
                    )}
                  </div>
                </div>

                <div className="task-footer">
                  <button 
                    className={`btn ${item.submitted ? 'btn-outline' : 'btn-primary'}`}
                    onClick={() => goToInspection(item.id, item.taskId)}
                  >
                    {item.submitted ? '查看详情' : '执行巡检'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">暂无分配的任务</div>
        )}
      </div>
    </div>
  );
}
