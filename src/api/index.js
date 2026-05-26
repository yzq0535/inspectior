// API 服务配置
const BASE_URL = 'http://localhost:3000/api';

// 请求拦截器
const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    credentials: 'include'
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${BASE_URL}${url}`, mergedOptions);
    const data = await response.json();

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      window.location.href = '/login';
      return null;
    }

    return data;
  } catch (error) {
    console.error('API 请求失败:', error);
    throw error;
  }
};

// 认证相关
export const authAPI = {
  login: async (username, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  getMe: async () => {
    return request('/auth/me');
  },

  changePassword: async (oldPassword, newPassword) => {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword })
    });
  }
};

// 用户管理
export const userAPI = {
  getAll: async () => {
    return request('/users');
  },

  getById: async (id) => {
    return request(`/users/${id}`);
  },

  create: async (user) => {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
  },

  update: async (id, updates) => {
    return request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  delete: async (id) => {
    return request(`/users/${id}`, {
      method: 'DELETE'
    });
  },

  getDepartments: async () => {
    return request('/users/meta/departments');
  }
};

// 任务管理
export const taskAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/tasks${query ? `?${query}` : ''}`);
  },

  getById: async (id) => {
    return request(`/tasks/${id}`);
  },

  create: async (task) => {
    return request('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
  },

  update: async (id, updates) => {
    return request(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  delete: async (id) => {
    return request(`/tasks/${id}`, {
      method: 'DELETE'
    });
  }
};

// 任务分配
export const assignmentAPI = {
  getMy: async () => {
    return request('/assignments/my');
  },

  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assignments${query ? `?${query}` : ''}`);
  },

  create: async (assignment) => {
    return request('/assignments', {
      method: 'POST',
      body: JSON.stringify(assignment)
    });
  },

  batchCreate: async (taskId, userIds) => {
    return request('/assignments/batch', {
      method: 'POST',
      body: JSON.stringify({ task_id: taskId, user_ids: userIds })
    });
  },

  delete: async (id) => {
    return request(`/assignments/${id}`, {
      method: 'DELETE'
    });
  }
};

// 巡检记录
export const inspectionAPI = {
  create: async (inspection) => {
    return request('/inspections', {
      method: 'POST',
      body: JSON.stringify(inspection)
    });
  },

  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/inspections${query ? `?${query}` : ''}`);
  },

  getMy: async () => {
    return request('/inspections/my');
  },

  getById: async (id) => {
    return request(`/inspections/${id}`);
  },

  review: async (id, status, remark) => {
    return request(`/inspections/${id}/review`, {
      method: 'PUT',
      body: JSON.stringify({ status, remark })
    });
  }
};

// 异常任务
export const abnormalTaskAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/abnormal-tasks${query ? `?${query}` : ''}`);
  },

  getMy: async () => {
    return request('/abnormal-tasks/my');
  },

  complete: async (id, items) => {
    return request(`/abnormal-tasks/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  }
};

// 台账管理
export const ledgerAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ledger${query ? `?${query}` : ''}`);
  },

  getStats: async () => {
    return request('/ledger/stats');
  },

  export: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/ledger/export${query ? `?${query}` : ''}`, {
      responseType: 'blob'
    });
  }
};

// 钉钉消息
export const dingtalkAPI = {
  send: async (type, content, webhook) => {
    return request('/dingtalk/send', {
      method: 'POST',
      body: JSON.stringify({ type, content, webhook })
    });
  },

  taskReminder: async (userId, taskId, message) => {
    return request('/dingtalk/task-reminder', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, task_id: taskId, message })
    });
  },

  setWebhook: async (webhook) => {
    return request('/dingtalk/config/webhook', {
      method: 'POST',
      body: JSON.stringify({ webhook })
    });
  },

  getConfig: async () => {
    return request('/dingtalk/config');
  }
};

export default {
  auth: authAPI,
  users: userAPI,
  tasks: taskAPI,
  assignments: assignmentAPI,
  inspections: inspectionAPI,
  abnormalTasks: abnormalTaskAPI,
  ledger: ledgerAPI,
  dingtalk: dingtalkAPI
};
