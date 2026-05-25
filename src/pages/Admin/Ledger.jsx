import { useState } from 'react';
import { getInspections, getTasks, getUsers } from '../../data';

export default function AdminLedger() {
  const [viewMode, setViewMode] = useState('date');
  const [selectedUser, setSelectedUser] = useState('');
  const users = getUsers().filter(u => u.role === 'user');
  
  let inspections = getInspections();
  
  if (viewMode === 'user' && selectedUser) {
    inspections = inspections.filter(i => i.userId === selectedUser);
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">台账查看</h1>
      </div>

      <div className="view-tabs">
        <button
          className={`tab ${viewMode === 'date' ? 'active' : ''}`}
          onClick={() => setViewMode('date')}
        >
          按日期
        </button>
        <button
          className={`tab ${viewMode === 'user' ? 'active' : ''}`}
          onClick={() => setViewMode('user')}
        >
          按人员
        </button>
      </div>

      {viewMode === 'user' && (
        <div className="card">
          <select
            className="form-select"
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
          >
            <option value="">全部人员</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>执行人</th>
              <th>执行时间</th>
              <th>状态</th>
              <th>得分</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((inspection) => {
              const task = getTasks().find(t => t.id === inspection.taskId);
              const user = getUsers().find(u => u.id === inspection.userId);
              return (
                <tr key={inspection.id}>
                  <td>{task?.name}</td>
                  <td>{user?.name}</td>
                  <td>{new Date(inspection.inspectedAt).toLocaleString()}</td>
                  <td>
                    <span className={`status-tag ${inspection.status === 'pending' ? 'status-pending' : inspection.status === 'approved' ? 'status-approved' : 'status-rejected'}`}>
                      {inspection.status === 'pending' ? '待审核' : inspection.status === 'approved' ? '已通过' : '需整改'}
                    </span>
                  </td>
                  <td>{inspection.score ?? '-'}</td>
                  <td>
                    <a href={`/admin/review?id=${inspection.id}`} className="btn btn-primary">
                      {inspection.status === 'pending' ? '考核' : '查看'}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {inspections.length === 0 && (
          <div className="empty-state">暂无巡检记录</div>
        )}
      </div>
    </div>
  );
}
