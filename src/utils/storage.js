export const STORAGE_KEYS = {
  USERS: 'dingtalk_users',
  TASKS: 'dingtalk_tasks',
  ASSIGNMENTS: 'dingtalk_assignments',
  INSPECTIONS: 'dingtalk_inspections',
  CURRENT_USER: 'dingtalk_current_user',
  DRAFTS: 'dingtalk_drafts',
  ABNORMAL_TASKS: 'dingtalk_abnormal_tasks'
};

export function getStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeStorage(key) {
  localStorage.removeItem(key);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes);
}

export function isToday(date) {
  if (!date) return false;
  return new Date(date).toDateString() === new Date().toDateString();
}

export function getStatusLabel(status) {
  const labels = {
    pending: '待审核',
    approved: '已通过',
    rejected: '需整改',
    active: '进行中',
    inactive: '已停用'
  };
  return labels[status] || status;
}

export function getScoreLabel(score) {
  if (score >= 80) return '优秀';
  if (score >= 60) return '合格';
  return '不合格';
}
