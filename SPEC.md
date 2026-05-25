# 钉钉任务巡检应用 - 项目规范

## 1. 项目概述

**项目名称**: 钉钉任务巡检应用

**项目类型**: 钉钉自建应用（前端）

**核心功能**: 
- 管理员发布调查问卷式巡检任务
- 用户按检查项执行自评（正常/异常）并拍照上传
- 自动保存进度，支持断点续填
- 每日任务必须在次日凌晨3点前提交
- 管理员复核打分

**技术栈**:
- 框架: React 18 + Vite
- UI组件: Ant Design Mobile（移动端友好）
- 状态管理: React Context + localStorage
- 样式: CSS3 + 移动端适配

## 2. 功能需求

### 2.1 用户角色管理
- 管理员和普通用户（通过钉钉用户ID区分）
- 自动获取钉钉用户信息（模拟）

### 2.2 管理员功能
- **任务管理**：创建、编辑、删除问卷式任务
  - 任务以调查问卷形式呈现
  - 每个任务包含多个检查项
  - 每个检查项需要用户自评（正常/异常）
  - 支持为每个检查项添加备注
- **任务分配**：选择用户分配任务
- **台账查看**：查看所有巡检记录
- **考核评分**：对待审核记录打分

### 2.3 用户功能
- **任务列表**：查看已分配任务
- **执行巡检**：
  - 问卷式任务展示（类似调查问卷）
  - 每个检查项需要：
    - 自评：正常 / 异常（必填）
    - 备注：选填
    - 拍照：至少上传1张照片（必填）
  - 支持自动保存（每30秒或输入时保存）
  - 支持断点续填（重新打开后恢复上次填写内容）
  - 提交前验证必填项并弹窗提示
- **查看台账**：查看自己的巡检历史和得分

## 3. 页面结构

```
src/
├── components/          # 公共组件
├── pages/
│   ├── Login/          # 登录页（模拟钉钉SSO）
│   ├── Admin/          # 管理员端
│   │   ├── Dashboard/  # 管理首页
│   │   ├── Tasks/      # 任务管理（问卷式）
│   │   ├── Users/      # 用户管理
│   │   ├── Assign/     # 任务分配
│   │   ├── Ledger/     # 台账查看
│   │   └── Review/     # 考核评分
│   └── User/           # 用户端
│       ├── Dashboard/  # 用户首页
│       ├── Tasks/      # 我的任务
│       ├── Inspection/ # 执行巡检（问卷）
│       └── Ledger/     # 我的台账
├── context/            # 状态管理
├── utils/              # 工具函数
└── data/              # 模拟数据
```

## 4. 数据模型

```javascript
// 用户
{ 
  id: string,           // 钉钉用户ID
  name: string,        // 用户名
  avatar: string,      // 头像URL
  role: 'admin' | 'user',
  department: string    // 部门
}

// 任务
{ 
  id: string,
  name: string,        // 任务名称（如"日常巡检"）
  description: string,  // 任务描述
  items: [             // 检查项列表（问卷题目）
    {
      id: string,
      title: string,   // 检查项标题（如"桌面卫生"）
      description: string, // 检查说明
      requirePhoto: boolean, // 是否需要拍照
      required: boolean     // 是否必填
    }
  ],
  status: 'active' | 'inactive',
  createdAt: string
}

// 任务分配
{ 
  id: string,
  taskId: string,
  userId: string,
  createdAt: string
}

// 巡检记录（每次提交）
{ 
  id: string,
  assignmentId: string,
  userId: string,
  taskId: string,
  date: string,                    // 巡检日期
  items: [                         // 每个检查项的填写结果
    {
      itemId: string,
      status: 'normal' | 'abnormal', // 自评：正常/异常
      remark: string,                // 备注
      photos: string[]               // 照片列表
    }
  ],
  status: 'pending' | 'approved' | 'rejected',
  score: number | null,
  comment: string,
  submittedAt: string,
  reviewedAt: string | null
}

// 草稿（自动保存）
{ 
  id: string,
  assignmentId: string,
  userId: string,
  taskId: string,
  date: string,
  items: [...],  // 同上
  updatedAt: string
}
```

## 5. 业务规则

### 5.1 提交时间限制
- 每日任务必须在次日凌晨3点前提交
- 超过时间未提交视为未完成

### 5.2 自动保存规则
- 每30秒自动保存一次
- 输入时实时保存
- 保存到草稿箱，不影响提交状态

### 5.3 提交验证规则
- 每个检查项必须选择"正常"或"异常"
- 至少需要上传1张照片
- 验证失败时弹窗提示未完成的项

## 6. 部署说明

1. 在钉钉开放平台创建自建应用
2. 配置应用权限（通讯录、消息等）
3. 将前端代码部署到静态服务器
4. 配置钉钉应用的工作台首页URL

## 7. 注意事项

- 当前使用localStorage存储数据，生产环境需要对接后端
- 需要在钉钉开放平台完成应用配置和认证
- 拍照功能需要后端文件存储服务（或对接钉钉拍照API）
