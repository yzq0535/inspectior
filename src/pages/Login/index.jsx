import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { getUsers } from '../../data';

export default function Login() {
  const { login } = useUser();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [error, setError] = useState('');

  const users = getUsers();

  const handleLogin = () => {
    if (!selectedUserId) {
      setError('请选择登录用户');
      return;
    }
    const success = login(selectedUserId);
    if (!success) {
      setError('登录失败');
    }
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" fill="#0762F7"/>
            <path d="M30 55 L30 25 L50 40 Z" fill="white"/>
            <circle cx="48" cy="30" r="6" fill="white"/>
          </svg>
        </div>
        <h1>任务巡检系统</h1>
      </div>

      <div className="login-form">
        <div className="form-group">
          <label>选择登录用户</label>
          <div className="user-select">
            {users.map((user) => (
              <button
                key={user.id}
                className={`user-option ${selectedUserId === user.id ? 'selected' : ''}`}
                onClick={() => setSelectedUserId(user.id)}
              >
                <div className="user-avatar">
                  {user.name.charAt(0)}
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{user.role === 'admin' ? '管理员' : user.department}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button className="login-button" onClick={handleLogin}>
          登录
        </button>

        <div className="tips">
          <p>测试数据说明：</p>
          <p>- 管理员：管理任务、分配任务、考核评分</p>
          <p>- 普通用户：接收任务、执行巡检</p>
        </div>
      </div>
    </div>
  );
}
