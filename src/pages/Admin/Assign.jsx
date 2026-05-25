import { useState } from 'react';
import { getTasks, getUsers, getAssignments, addAssignment, deleteAssignment } from '../../data';

export default function AdminAssign() {
  const tasks = getTasks().filter(t => t.status === 'active');
  const users = getUsers().filter(u => u.role === 'user');
  const [assignments, setAssignments] = useState(getAssignments());
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleSubmit = () => {
    if (!selectedTask) {
      alert('请选择任务');
      return;
    }
    if (selectedUsers.length === 0) {
      alert('请选择执行人');
      return;
    }

    selectedUsers.forEach(userId => {
      const exists = assignments.some(a => a.taskId === selectedTask && a.userId === userId);
      if (!exists) {
        setAssignments(addAssignment({ taskId: selectedTask, userId }));
      }
    });

    setShowModal(false);
    setSelectedTask('');
    setSelectedUsers([]);
  };

  const handleDelete = (assignment) => {
    if (confirm('确定取消该任务分配吗？')) {
      setAssignments(deleteAssignment(assignment.id));
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">任务分配</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          新建分配
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>执行人</th>
              <th>分配时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => {
              const task = getTasks().find(t => t.id === assignment.taskId);
              const user = getUsers().find(u => u.id === assignment.userId);
              return (
                <tr key={assignment.id}>
                  <td>{task?.name}</td>
                  <td>{user?.name}</td>
                  <td>{new Date(assignment.createdAt).toLocaleString()}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(assignment)}>取消</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {assignments.length === 0 && (
          <div className="empty-state">暂无任务分配</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">分配任务</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 8L2 16M10 8l8 8M10 8L2 4M10 8l8-8"/>
                </svg>
              </button>
            </div>

            <div className="form-group">
              <label className="form-label">选择任务</label>
              <select
                className="form-select"
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                <option value="">请选择任务</option>
                {tasks.map(task => (
                  <option key={task.id} value={task.id}>{task.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <div className="form-header">
                <label className="form-label">选择执行人</label>
                <button type="button" className="btn btn-outline" onClick={selectAllUsers}>
                  {selectedUsers.length === users.length ? '取消全选' : '全选'}
                </button>
              </div>
              <div className="checkbox-group">
                {users.map(user => (
                  <label key={user.id} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                    <span>{user.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>取消</button>
              <button type="button" className="btn btn-primary" onClick={handleSubmit}>确认分配</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
