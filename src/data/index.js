import { STORAGE_KEYS, setStorage, getStorage, removeStorage, generateId } from '../utils/storage';
import { authAPI, userAPI, taskAPI, assignmentAPI, inspectionAPI, abnormalTaskAPI, ledgerAPI } from '../api';

// 导出别名
export { setStorage as setCurrentUser, removeStorage as clearCurrentUser };
export { submitInspection as addInspection };

// 默认数据（用于首次初始化）
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
    id: 'task_daily_outside',
    name: '日巡检-店外区域',
    description: '每日例行检查店外各项工作',
    taskType: 'daily',
    items: [
      { id: 'item_o1', title: '门口堆头检查', description: '摆放合理、整齐干净、品类搭配合理、商品有价签、价签无破损', requirePhoto: true, required: true },
      { id: 'item_o2', title: '门口车位预留（下午班）', description: '佰和悦府店下午班预留门口车位', requirePhoto: false, required: true },
      { id: 'item_o3', title: '门口卫生', description: '地面干净、无垃圾、已清洗、休闲椅干净整齐无破损', requirePhoto: true, required: true },
      { id: 'item_o4', title: '门口垃圾桶', description: '无垃圾遗留、已清理、套袋、未满溢、需要更换', requirePhoto: true, required: true },
      { id: 'item_o5', title: '进门地垫', description: '清洗干净、无纸屑垃圾', requirePhoto: true, required: true },
      { id: 'item_o6', title: '门前电器设备', description: '冰柜、啤酒柜通电、插座电源防水安全、擦洗干净整洁', requirePhoto: true, required: true },
      { id: 'item_o7', title: '广告招牌', description: '店内外广告是新的、无歪斜、店铺广告牌亮灯', requirePhoto: true, required: true }
    ],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task_daily_inside',
    name: '日巡检-店内区域',
    description: '每日例行检查店内各项工作',
    taskType: 'daily',
    items: [
      { id: 'item_i1', title: '店内卫生', description: '各处清洁、地面无污渍水渍、卫生间干净、无卫生死角', requirePhoto: true, required: true },
      { id: 'item_i2', title: '货品排面', description: '饱满整齐、每个品类货架充足、品类齐全、补货齐全', requirePhoto: true, required: true },
      { id: 'item_i3', title: '日期检查', description: '每个班次定时检查，找出临期和过期品', requirePhoto: false, required: true },
      { id: 'item_i4', title: '价签检查', description: '一一对应、每天抽检一个品类、无遗漏标价错误、无过期活动价签', requirePhoto: true, required: true },
      { id: 'item_i5', title: '电气设备检查', description: '冰柜、冷柜、OC柜、烧烤柜、烤箱、咖啡机等正常运行，灯、监控正常', requirePhoto: true, required: true },
      { id: 'item_i6', title: '店员状态', description: '精神饱满、熟悉促销活动、工作服干净整洁无污渍', requirePhoto: false, required: true },
      { id: 'item_i7', title: '面销情况检查', description: '每个班次面销达标', requirePhoto: false, required: true },
      { id: 'item_i8', title: '群销检查', description: '按时发送群消息、质量达标、不应付', requirePhoto: false, required: true },
      { id: 'item_i9', title: '交接表检查', description: '拍照发到工作群、针对交接表进行抽检、防止应付', requirePhoto: true, required: true },
      { id: 'item_i10', title: '线上平台检查', description: '当前评分情况、无停止接单、新增差评、回复率、回复速度达标', requirePhoto: false, required: true },
      { id: 'item_i11', title: '盘点', description: '盘点进行、分区盘点进行、每天至少3个班次盘点', requirePhoto: false, required: true },
      { id: 'item_i12', title: '业绩检查', description: '查看昨天和当天班次业绩情况、分析业绩变化原因、找出问题', requirePhoto: false, required: true },
      { id: 'item_i13', title: '客诉处理', description: '线上线下客诉、当天处理完成', requirePhoto: false, required: true },
      { id: 'item_i14', title: '废弃商品检查', description: '明细检查确认', requirePhoto: true, required: true },
      { id: 'item_i15', title: '临期商品促销', description: '临期商品提前促销、店员推销、设立临期商品展销区', requirePhoto: true, required: true },
      { id: 'item_i16', title: '存缴营业款', description: '按规定存缴营业款', requirePhoto: false, required: true }
    ],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task_night_shift',
    name: '夜班工作检查',
    description: '检查夜班各项工作完成情况',
    taskType: 'daily',
    items: [
      { id: 'item_n1', title: '查看监控夜班工作', description: '工作量饱和、仓库整理完成、排面补货完成', requirePhoto: false, required: true },
      { id: 'item_n2', title: '验货情况检查', description: '无遗漏、无破损、无多验货少收货', requirePhoto: true, required: true }
    ],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task_daily_keywork',
    name: '日巡检-重点工作',
    description: '每日重点工作检查',
    taskType: 'daily',
    items: [
      { id: 'item_k1', title: '业绩分析', description: '当天和昨天业绩分析、多维度分析销量原因', requirePhoto: false, required: true },
      { id: 'item_k2', title: '订货', description: '多维度订货（天气、节假日、展会、学校、产品）', requirePhoto: false, required: true },
      { id: 'item_k3', title: '废弃检查', description: '每天80-100元控制、拍照发群、每周打印废弃表', requirePhoto: true, required: true },
      { id: 'item_k4', title: '促销活动执行', description: '抽奖、满赠等活动执行', requirePhoto: false, required: true },
      { id: 'item_k5', title: '线上平台维护', description: '差评处理、评分、在线检查、三个达标、加热、库存', requirePhoto: false, required: true },
      { id: 'item_k6', title: '面销', description: '不同时间/人群/商品推荐、下发品类、发布结果', requirePhoto: false, required: true },
      { id: 'item_k7', title: '群销', description: '按时发消息、每个班次至少2条、每天至少6条', requirePhoto: false, required: true },
      { id: 'item_k8', title: '临期商品促销', description: '长保商品、非日配商品提前促销', requirePhoto: true, required: true },
      { id: 'item_k9', title: '补货', description: '确定补货时间点', requirePhoto: false, required: true }
    ],
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

// API 是否可用
let apiAvailable = true;

// 测试 API 连接
export async function testAPI() {
  try {
    const response = await fetch('http://192.168.47.135:3000/health');
    apiAvailable = response.ok;
    return apiAvailable;
  } catch {
    apiAvailable = false;
    return false;
  }
}

export function initData() {
  if (!getStorage(STORAGE_KEYS.USERS)) {
    setStorage(STORAGE_KEYS.USERS, defaultUsers);
  }
  if (!getStorage(STORAGE_KEYS.TASKS)) {
    setStorage(STORAGE_KEYS.TASKS, defaultTasks);
  }
  if (!getStorage(STORAGE_KEYS.ASSIGNMENTS)) {
    const assignments = [
      { id: 'assign001', taskId: 'task_daily_outside', userId: 'user001', createdAt: new Date().toISOString() },
      { id: 'assign002', taskId: 'task_daily_inside', userId: 'user001', createdAt: new Date().toISOString() },
      { id: 'assign003', taskId: 'task_daily_outside', userId: 'user002', createdAt: new Date().toISOString() }
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

// 登录 - 优先使用 API
export async function login(username, password) {
  if (apiAvailable) {
    try {
      const result = await authAPI.login(username, password);
      if (result.code === 200) {
        localStorage.setItem('token', result.data.token);
        setStorage(STORAGE_KEYS.CURRENT_USER, result.data.user);
        return result.data.user;
      }
    } catch (error) {
      console.error('API 登录失败，回退到本地存储');
      apiAvailable = false;
    }
  }

  // 回退到本地存储
  const users = getUsers();
  const user = users.find(u => u.id === username || u.email === username);
  
  // 本地存储不验证密码（演示模式）
  if (user) {
    setStorage(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  }
  return null;
}

export function logout() {
  localStorage.removeItem('token');
  removeStorage(STORAGE_KEYS.CURRENT_USER);
}

export function getUsers() {
  return getStorage(STORAGE_KEYS.USERS) || [];
}

export async function fetchUsers() {
  if (apiAvailable) {
    try {
      const result = await userAPI.getAll();
      if (result.code === 200) {
        setStorage(STORAGE_KEYS.USERS, result.data);
        return result.data;
      }
    } catch {
      apiAvailable = false;
    }
  }
  return getUsers();
}

export function getTasks() {
  return getStorage(STORAGE_KEYS.TASKS) || [];
}

export async function fetchTasks() {
  if (apiAvailable) {
    try {
      const result = await taskAPI.getAll();
      if (result.code === 200) {
        setStorage(STORAGE_KEYS.TASKS, result.data);
        return result.data;
      }
    } catch {
      apiAvailable = false;
    }
  }
  return getTasks();
}

export function getAssignments() {
  return getStorage(STORAGE_KEYS.ASSIGNMENTS) || [];
}

export async function fetchMyAssignments() {
  if (apiAvailable) {
    try {
      const result = await assignmentAPI.getMy();
      if (result.code === 200) {
        setStorage(STORAGE_KEYS.ASSIGNMENTS, result.data);
        return result.data;
      }
    } catch {
      apiAvailable = false;
    }
  }
  return getAssignments();
}

export function getInspections() {
  return getStorage(STORAGE_KEYS.INSPECTIONS) || [];
}

export async function fetchInspections(params = {}) {
  if (apiAvailable) {
    try {
      const result = await inspectionAPI.getAll(params);
      if (result.code === 200) {
        setStorage(STORAGE_KEYS.INSPECTIONS, result.data);
        return result.data;
      }
    } catch {
      apiAvailable = false;
    }
  }
  return getInspections();
}

export function getDrafts() {
  return getStorage(STORAGE_KEYS.DRAFTS) || [];
}

export function getAbnormalTasks() {
  return getStorage(STORAGE_KEYS.ABNORMAL_TASKS) || [];
}

export async function fetchMyAbnormalTasks() {
  if (apiAvailable) {
    try {
      const result = await abnormalTaskAPI.getMy();
      if (result.code === 200) {
        setStorage(STORAGE_KEYS.ABNORMAL_TASKS, result.data);
        return result.data;
      }
    } catch {
      apiAvailable = false;
    }
  }
  return getAbnormalTasks();
}

export function getCurrentUser() {
  return getStorage(STORAGE_KEYS.CURRENT_USER);
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

export async function createTask(task) {
  if (apiAvailable) {
    try {
      const result = await taskAPI.create(task);
      if (result.code === 200) {
        await fetchTasks();
        return result.data;
      }
    } catch {
      apiAvailable = false;
    }
  }
  return addTask(task);
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

export async function createAssignment(assignment) {
  if (apiAvailable) {
    try {
      const result = await assignmentAPI.create({
        task_id: assignment.taskId,
        user_id: assignment.userId
      });
      if (result.code === 200) {
        await fetchMyAssignments();
        return result.data;
      }
    } catch {
      apiAvailable = false;
    }
  }
  return addAssignment(assignment);
}

export function deleteAssignment(id) {
  const assignments = getAssignments().filter(a => a.id !== id);
  setStorage(STORAGE_KEYS.ASSIGNMENTS, assignments);
  return assignments;
}

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
  
  addAssignment({
    taskId: abnormalTask.id,
    userId: abnormalItems[0]?.userId || createdBy,
    isAbnormal: true,
    abnormalTaskId: abnormalTask.id
  });
  
  return abnormalTask;
}

export function getUserAbnormalTasks(userId) {
  const abnormalTasks = getAbnormalTasks();
  const assignments = getAssignments();
  
  return abnormalTasks.filter(task => {
    const assignment = assignments.find(a => a.taskId === task.id && a.userId === userId);
    return assignment && task.status === 'pending';
  });
}

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

export async function submitInspection(inspection) {
  if (apiAvailable) {
    try {
      const result = await inspectionAPI.create({
        assignment_id: inspection.assignmentId,
        task_id: inspection.taskId,
        items: inspection.items.map(item => ({
          item_id: item.itemId,
          status: item.status,
          remark: item.remark,
          photos: item.photos || []
        }))
      });
      if (result.code === 200) {
        await fetchInspections();
        await fetchMyAbnormalTasks();
        return result.data;
      }
    } catch {
      apiAvailable = false;
    }
  }
  
  // 回退到本地存储
  const inspections = getInspections();
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
  
  if (abnormalItems.length > 0) {
    const task = getTaskById(inspection.taskId);
    if (task) {
      const abnormalTask = createAbnormalTask(
        task,
        abnormalItems.map(item => ({ ...item, userId: inspection.userId })),
        inspection.userId,
        '用户自评异常'
      );
      newInspection.abnormalTaskId = abnormalTask.id;
    }
  }
  
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

export async function reviewInspection(id, status, remark) {
  if (apiAvailable) {
    try {
      const result = await inspectionAPI.review(id, status, remark);
      if (result.code === 200) {
        await fetchInspections();
        return result.data;
      }
    } catch {
      apiAvailable = false;
    }
  }
  return updateInspection(id, { status, remark });
}

export function adminMarkAbnormal(inspectionId, abnormalItems, reason) {
  const inspections = getInspections();
  const inspection = inspections.find(i => i.id === inspectionId);
  
  if (!inspection) return null;
  
  const task = getTaskById(inspection.taskId);
  if (!task) return null;
  
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
  
  const abnormalTask = createAbnormalTask(
    task,
    abnormalItems.map(item => ({ ...item, userId: inspection.userId })),
    inspection.userId,
    reason || '管理员审核异常'
  );
  
  return abnormalTask;
}

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

export function getAbnormalTaskById(id) {
  return getAbnormalTasks().find(t => t.id === id);
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
