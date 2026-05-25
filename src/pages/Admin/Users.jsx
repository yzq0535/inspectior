import { useState } from 'react';
import { getUsers, addUser, updateUser, deleteUser } from '../../data';
import { generateId } from '../../utils/storage';

export default function AdminUsers() {
  const [users, setUsers] = useState(getUsers().filter(u => u.role === 'user'));
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    department: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      alert('请填写姓名');
      return;
    }

    if (editingUser) {
      setUsers(updateUser(editingUser.id, {
        name: formData.name,
        department: formData.department
      }));
    } else {
      const newUser = {
        id: generateId(),
        name: formData.name,
        avatar: '',
        role: 'user',
        department: formData.department || '未分配',
        email: ''
      };
      const allUsers = getUsers();
      allUsers.push(newUser);
      localStorage.setItem('feishu_users', JSON.stringify(allUsers));
      setUsers([...users, newUser]);
    }

    setShowModal(false);
    setEditingUser(null);
    setFormData({ name: '', department: '' });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      department: user.department
    });
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (confirm(`确定删除用户 "${user.name}" 吗？`)) {
      const allUsers = getUsers().filter(u => u.id !== user.id);
      localStorage.setItem('feishu_users', JSON.stringify(allUsers));
      setUsers(users.filter(u => u.id !== user.id));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">用户管理</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          添加用户
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>部门</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar-small">{user.name.charAt(0)}</div>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td>{user.department}</td>
                <td>
                  <button className="btn btn-outline" onClick={() => handleEdit(user)}>编辑</button>
                  <button className="btn btn-danger" onClick={() => handleDelete(user)}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="empty-state">暂无用户</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingUser ? '编辑用户' : '添加用户'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 8L2 16M10 8l8 8M10 8L2 4M10 8l8-8"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">姓名</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">部门</label>
                <input
                  className="form-input"
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">保存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
