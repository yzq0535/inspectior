import { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { getUsers, testAPI } from '../../data';

export default function Login() {
  const { login } = useUser();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [useApiLogin, setUseApiLogin] = useState(false);

  const users = getUsers();

  const handleApiLogin = async () => {
    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await login(username, password);
      if (!success) {
        setError('登录失败：用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败：无法连接到服务器');
    } finally {
      setLoading(false);
    }
  };

  const handleLocalLogin = () => {
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
        {/* 登录方式切换 */}
        <div className="login-tabs">
          <button
            className={`tab ${!useApiLogin ? 'active' : ''}`}
            onClick={() => setUseApiLogin(false)}
          >
            本地登录
          </button>
          <button
            className={`tab ${useApiLogin ? 'active' : ''}`}
            onClick={() => setUseApiLogin(true)}
          >
            API登录
          </button>
        </div>

        {useApiLogin ? (
          // API 登录方式
          <>
            <div className="form-group">
              <label>用户名</label>
              <input
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
              />
            </div>
            <div className="form-group">
              <label>密码</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
              />
            </div>
            <button 
              className="login-button" 
              onClick={handleApiLogin}
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </button>
            <div className="tips">
              <p>测试账号：</p>
              <p>- boss001 / 123456（老板）</p>
              <p>- manager001 / 123456（店长）</p>
              <p>- staff001 / 123456（店员）</p>
            </div>
          </>
        ) : (
          // 本地登录方式
          <>
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

            <button className="login-button" onClick={handleLocalLogin}>
              登录
            </button>

            <div className="tips">
              <p>测试数据说明：</p>
              <p>- 管理员：管理任务、分配任务、考核评分</p>
              <p>- 普通用户：接收任务、执行巡检</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
