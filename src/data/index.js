import { STORAGE_KEYS, setStorage, getStorage, removeStorage, generateId } from '../utils/storage';

const defaultUsers = [
  {
    id: 'admin001',
    name: '管理员',
    avatar: '',
    role: 'admin',
    department: '管理部',
    email: 'admin@example.com'
  },
  {
    id: 'user001',
    name: '张三',
    avatar: '',
    role: 'user',
    department: '运营部',
    email: 'zhangsan@example.com'
  },
  {
    id: 'user002',
    name: '李四',
    avatar: '',
    role: 'user',
    department: '仓储部',
    email: 'lisi@example.com'
  }
];

const defaultTasks = [
  {
    id: 'task001',
    name: '日常巡检',
    description: '每日例行巡检任务，请仔细检查每个项目',
    items: [
      {
        id: 'item001',
        title: '检查桌面卫生',
        description: '检查办公区域桌面是否整洁、无垃圾、无灰尘',
        requirePhoto: true,
        required: true
      },
      {
        id: 'item002',
        title: '检查货品摆放',
        description: '检查货架/仓库货品摆放是否整齐有序',
        requirePhoto: true,
        required: true
      },
      {
        id: 'item003',
        title: '检查门窗状态',
        description: '检查门窗是否关闭正常',
        requirePhoto: false,
        required: true
      },
      {
        id: 'item004',
        title: '检查设备运行',
        description: '检查办公设备是否正常运行',
        requirePhoto: false,
        required: false
      }
    ],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task002',
    name: '安全检查',
    description: '定期安全检查任务',
    items: [
      {
        id: 'item005',
        title: '检查消防设施',
        description: '检查消防栓、灭火器是否完好',
        requirePhoto: true,
        required: true
      },
      {
        id: 'item006',
        title: '检查安全通道',
        description: '检查安全通道是否畅通',
        requirePhoto: true,
        required: true
      }
    ],
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

export function initData() {
  if (!getStorage(STORAGE_KEYS.USERS)) {
    setStorage(STORAGE_KEYS.USERS, defaultUsers);
  }
  if (!getStorage(STORAGE_KEYS.TASKS)) {
    setStorage(STORAGE_KEYS.TASKS, defaultTasks);
  }
  if (!getStorage(STORAGE_KEYS.ASSIGNMENTS)) {
    const assignments = [
      { id: 'assign001', taskId: 'task001', userId: 'user001', createdAt: new Date().toISOString() },
      { id: 'assign002', taskId: 'task001', userId: 'user002', createdAt: new Date().toISOString() },
      { id: 'assign003', taskId: 'task002', userId: 'user001', createdAt: new Date().toISOString() }
    ];
    setStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  }
  if (!getStorage(STORAGE_KEYS.INSPECTIONS)) {
    setStorage(STORAGE_KEYS.INSPECTIONS, []);
  }
  if (!getStorage(STORAGE_KEYS.DRAFTS)) {
    setStorage(STORAGE_KEYS.DRAFTS, []);
  }
  if (!getStorage(STORAGE_KEYS.ABNORMAL_TASKS)) {
    setStorage(STORAGE_KEYS.ABNORMAL_TASKS, []);
  }
}

export function getUsers() {
  return getStorage(STORAGE_KEYS.USERS) || [];
}

export function getTasks() {
  return getStorage(STORAGE_KEYS.TASKS) || [];
}

export function getAssignments() {
  return getStorage(STORAGE_KEYS.ASSIGNMENTS) || [];
}

export function getInspections() {
  return getStorage(STORAGE_KEYS.INSPECTIONS) || [];
}

export function getDrafts() {
  return getStorage(STORAGE_KEYS.DRAFTS) || [];
}

export function getAbnormalTasks() {
  return getStorage(STORAGE_KEYS.ABNORMAL_TASKS) || [];
}

export function getCurrentUser() {
  return getStorage(STORAGE_KEYS.CURRENT_USER);
}

export function setCurrentUser(user) {
  return setStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export function clearCurrentUser() {
  removeStorage(STORAGE_KEYS.CURRENT_USER);
}

export function addTask(task) {
  const tasks = getTasks();
  tasks.push({
    ...task,
    id: `task_${Date.now()}`,
    status: 'active',
    createdAt: new Date().toISOString()
  });
  setStorage(STORAGE_KEYS.TASKS, tasks);
  return tasks;
}

export function updateTask(id, updates) {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...updates };
    setStorage(STORAGE_KEYS.TASKS, tasks);
  }
  return tasks;
}

export function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  setStorage(STORAGE_KEYS.TASKS, tasks);
  return tasks;
}

export function addAssignment(assignment) {
  const assignments = getAssignments();
  assignments.push({
    ...assignment,
    id: `assign_${Date.now()}`,
    createdAt: new Date().toISOString()
  });
  setStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  return assignments;
}

export function deleteAssignment(id) {
  const assignments = getAssignments().filter(a => a.id !== id);
  setStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  return assignments;
}

// 创建异常子任务
export function createAbnormalTask(originalTask, abnormalItems, createdBy, reason) {
  const abnormalTasks = getAbnormalTasks();
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  const abnormalTask = {
    id: `abnormal_${Date.now()}`,
    originalTaskId: originalTask.id,
    originalTaskName: originalTask.name,
    name: `${originalTask.name}的异常事项-${timestamp}`,
    description: `异常检查项：${abnormalItems.map(i => i.title).join('、')}`,
    items: abnormalItems.map(item => ({
      ...item,
      id: `${item.id}_abnormal_${Date.now()}`
    })),
    status: 'pending',
    createdBy,
    reason,
    createdAt: now.toISOString(),
    deadline: null
  };
  
  abnormalTasks.push(abnormalTask);
  setStorage(STORAGE_KEYS.ABNORMAL_TASKS, abnormalTasks);
  
  // 同时创建分配记录
  addAssignment({
    taskId: abnormalTask.id,
    userId: abnormalItems[0]?.userId || createdBy,
    isAbnormal: true,
    abnormalTaskId: abnormalTask.id
  });
  
  return abnormalTask;
}

// 获取用户的异常任务
export function getUserAbnormalTasks(userId) {
  const abnormalTasks = getAbnormalTasks();
  const assignments = getAssignments();
  
  return abnormalTasks.filter(task => {
    const assignment = assignments.find(a => a.taskId === task.id && a.userId === userId);
    return assignment && task.status === 'pending';
  });
}

// 完成异常任务
export function completeAbnormalTask(abnormalTaskId, userId) {
  const abnormalTasks = getAbnormalTasks();
  const index = abnormalTasks.findIndex(t => t.id === abnormalTaskId);
  if (index !== -1) {
    abnormalTasks[index].status = 'completed';
    abnormalTasks[index].completedAt = new Date().toISOString();
    abnormalTasks[index].completedBy = userId;
    setStorage(STORAGE_KEYS.ABNORMAL_TASKS, abnormalTasks);
  }
  return abnormalTasks;
}

// 提交巡检记录
export function addInspection(inspection) {
  const inspections = getInspections();
  
  // 检查是否有异常项
  const abnormalItems = inspection.items.filter(item => item.status === 'abnormal');
  
  const newInspection = {
    ...inspection,
    id: `inspect_${Date.now()}`,
    status: 'pending',
    hasAbnormal: abnormalItems.length > 0,
    abnormalItems: abnormalItems,
    submittedAt: new Date().toISOString()
  };
  
  inspections.push(newInspection);
  setStorage(STORAGE_KEYS.INSPECTIONS, inspections);
  
  // 如果有异常项，自动创建异常子任务
  if (abnormalItems.length > 0) {
    const task = getTaskById(inspection.taskId);
    const originalAssignment = getAssignments().find(a => a.id === inspection.assignmentId);
    
    if (task && originalAssignment) {
      const abnormalTask = createAbnormalTask(
        task,
        abnormalItems.map(item => ({
          ...item,
          userId: inspection.userId
        })),
        inspection.userId,
        '用户自评异常'
      );
      newInspection.abnormalTaskId = abnormalTask.id;
    }
  }
  
  // 删除草稿
  deleteDraft(inspection.assignmentId, inspection.userId);
  return { inspections, abnormalTask: newInspection.abnormalTaskId };
}

export function updateInspection(id, updates) {
  const inspections = getInspections();
  const index = inspections.findIndex(i => i.id === id);
  if (index !== -1) {
    inspections[index] = { 
      ...inspections[index], 
      ...updates,
      reviewedAt: new Date().toISOString()
    };
    setStorage(STORAGE_KEYS.INSPECTIONS, inspections);
  }
  return inspections;
}

// 管理员标记异常并创建子任务
export function adminMarkAbnormal(inspectionId, abnormalItems, reason) {
  const inspections = getInspections();
  const inspection = inspections.find(i => i.id === inspectionId);
  
  if (!inspection) return null;
  
  const task = getTaskById(inspection.taskId);
  if (!task) return null;
  
  // 更新inspection的审核状态
  const updatedAbnormalItems = inspection.abnormalItems || [];
  abnormalItems.forEach(item => {
    if (!updatedAbnormalItems.find(i => i.itemId === item.itemId)) {
      updatedAbnormalItems.push({
        ...item,
        markedBy: 'admin',
        reason
      });
    }
  });
  
  updateInspection(inspectionId, {
    abnormalItems: updatedAbnormalItems,
    hasAbnormal: true,
    status: 'rejected'
  });
  
  // 创建异常子任务
  const abnormalTask = createAbnormalTask(
    task,
    abnormalItems.map(item => ({
      ...item,
      userId: inspection.userId
    })),
    inspection.userId,
    reason || '管理员审核异常'
  );
  
  return abnormalTask;
}

// 草稿操作
export function saveDraft(draft) {
  const drafts = getDrafts();
  const index = drafts.findIndex(
    d => d.assignmentId === draft.assignmentId && d.userId === draft.userId && d.date === draft.date
  );
  
  if (index !== -1) {
    drafts[index] = { ...drafts[index], ...draft, updatedAt: new Date().toISOString() };
  } else {
    drafts.push({
      ...draft,
      id: `draft_${Date.now()}`,
      updatedAt: new Date().toISOString()
    });
  }
  setStorage(STORAGE_KEYS.DRAFTS, drafts);
}

export function getDraft(assignmentId, userId) {
  const today = new Date().toISOString().split('T')[0];
  const drafts = getDrafts();
  return drafts.find(
    d => d.assignmentId === assignmentId && d.userId === userId && d.date === today
  );
}

export function deleteDraft(assignmentId, userId) {
  const today = new Date().toISOString().split('T')[0];
  const drafts = getDrafts().filter(
    d => !(d.assignmentId === assignmentId && d.userId === userId && d.date === today)
  );
  setStorage(STORAGE_KEYS.DRAFTS, drafts);
}

export function getUserById(id) {
  return getUsers().find(u => u.id === id);
}

export function getTaskById(id) {
  return getTasks().find(t => t.id === id);
}

export function getAssignmentById(id) {
  return getAssignments().find(a => a.id === id);
}

export function getInspectionById(id) {
  return getInspections().find(i => i.id === id);
}

export function getAssignmentsByUserId(userId) {
  return getAssignments().filter(a => a.userId === userId);
}

export function getInspectionsByUserId(userId) {
  return getInspections().filter(i => i.userId === userId);
}

export function getPendingInspections() {
  return getInspections().filter(i => i.status === 'pending');
}

export function getTodayInspections(userId) {
  const today = new Date().toISOString().split('T')[0];
  return getInspections().filter(i => {
    return i.date === today && (!userId || i.userId === userId);
  });
}

export function checkTodaySubmitted(assignmentId, userId) {
  const today = new Date().toISOString().split('T')[0];
  return getInspections().some(
    i => i.assignmentId === assignmentId && i.userId === userId && i.date === today
  );
}

export function isPastDeadline() {
  const now = new Date();
  const deadline = new Date();
  deadline.setHours(3, 0, 0, 0);
  
  if (now.getHours() >= 3) {
    return false;
  }
  return true;
}

export function addUser(user) {
  const users = getUsers();
  users.push({
    ...user,
    id: generateId(),
    role: 'user',
    avatar: ''
  });
  setStorage(STORAGE_KEYS.USERS, users);
  return users;
}

export function updateUser(id, updates) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    setStorage(STORAGE_KEYS.USERS, users);
  }
  return users;
}

export function deleteUser(id) {
  const users = getUsers().filter(u => u.id !== id);
  setStorage(STORAGE_KEYS.USERS, users);
  return users;
}
