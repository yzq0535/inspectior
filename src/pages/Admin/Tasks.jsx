import { useState } from 'react';
import { getTasks, addTask, updateTask, deleteTask } from '../../data';

export default function AdminTasks() {
  const [tasks, setTasks] = useState(getTasks());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    items: []
  });
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    requirePhoto: false,
    required: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description) {
      alert('请填写完整信息');
      return;
    }

    if (formData.items.length === 0) {
      alert('请至少添加一个检查项');
      return;
    }

    const taskData = {
      ...formData,
      items: formData.items.map((item, index) => ({
        ...item,
        id: `item_${Date.now()}_${index}`
      }))
    };

    if (editingTask) {
      setTasks(updateTask(editingTask.id, taskData));
    } else {
      setTasks(addTask(taskData));
    }

    setShowModal(false);
    setEditingTask(null);
    setFormData({ name: '', description: '', items: [] });
    setNewItem({ title: '', description: '', requirePhoto: false, required: true });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      description: task.description,
      items: [...task.items]
    });
    setShowModal(true);
  };

  const handleDelete = (task) => {
    if (confirm(`确定删除任务 "${task.name}" 吗？`)) {
      setTasks(deleteTask(task.id));
    }
  };

  const toggleStatus = (task) => {
    const newStatus = task.status === 'active' ? 'inactive' : 'active';
    setTasks(updateTask(task.id, { status: newStatus }));
  };

  const addItem = () => {
    if (!newItem.title.trim()) {
      alert('请输入检查项标题');
      return;
    }
    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem }]
    });
    setNewItem({ title: '', description: '', requirePhoto: false, required: true });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">任务管理</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          添加任务
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>描述</th>
              <th>检查项</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td><strong>{task.name}</strong></td>
                <td className="truncate" style={{maxWidth: '200px'}}>{task.description}</td>
                <td>
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                    {task.items?.slice(0, 2).map((item, i) => (
                      <span key={i} className="item-tag">{item.title}</span>
                    ))}
                    {task.items?.length > 2 && (
                      <span className="item-more">+{task.items.length - 2}项</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-tag ${task.status === 'active' ? 'status-approved' : 'status-pending'}`}>
                    {task.status === 'active' ? '进行中' : '已停用'}
                  </span>
                </td>
                <td>
                  <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                    <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '13px'}} onClick={() => handleEdit(task)}>编辑</button>
                    <button className="btn btn-warning" style={{padding: '6px 12px', fontSize: '13px'}} onClick={() => toggleStatus(task)}>
                      {task.status === 'active' ? '停用' : '启用'}
                    </button>
                    <button className="btn btn-danger" style={{padding: '6px 12px', fontSize: '13px'}} onClick={() => handleDelete(task)}>删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="empty-state">暂无任务，点击上方按钮添加</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" style={{maxWidth: '600px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingTask ? '编辑任务' : '添加任务'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 8L2 16M10 8l8 8M10 8L2 4M10 8l8-8"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{maxHeight: '60vh', overflowY: 'auto'}}>
                <div className="form-group">
                  <label className="form-label">任务名称</label>
                  <input
                    className="form-input"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：日常巡检"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">任务描述</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="描述任务的整体要求..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">检查项列表</label>
                  
                  <div style={{marginBottom: '16px'}}>
                    <div style={{display: 'flex', gap: '8px', marginBottom: '8px'}}>
                      <input
                        className="form-input"
                        type="text"
                        value={newItem.title}
                        onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                        placeholder="检查项标题（如：桌面卫生）"
                        style={{flex: 1}}
                      />
                    </div>
                    <textarea
                      className="form-textarea"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="检查项说明..."
                      style={{marginBottom: '8px', minHeight: '60px'}}
                    />
                    <div style={{display: 'flex', gap: '16px', marginBottom: '8px'}}>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={newItem.requirePhoto}
                          onChange={(e) => setNewItem({ ...newItem, requirePhoto: e.target.checked })}
                        />
                        <span>需要拍照</span>
                      </label>
                      <label className="checkbox-item">
                        <input
                          type="checkbox"
                          checked={newItem.required}
                          onChange={(e) => setNewItem({ ...newItem, required: e.target.checked })}
                        />
                        <span>必填项</span>
                      </label>
                    </div>
                    <button type="button" className="btn btn-outline" onClick={addItem} style={{width: '100%'}}>
                      + 添加检查项
                    </button>
                  </div>

                  <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    {formData.items.map((item, index) => (
                      <div key={index} style={{
                        padding: '12px',
                        background: '#f7f8fa',
                        borderRadius: '8px',
                        border: '1px solid #e8e8e8'
                      }}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                          <div style={{flex: 1}}>
                            <div style={{fontWeight: '600', marginBottom: '4px'}}>
                              {index + 1}. {item.title}
                              {item.required && <span style={{color: '#ff4d4f', marginLeft: '4px'}}>*</span>}
                            </div>
                            {item.description && (
                              <div style={{fontSize: '13px', color: '#666'}}>{item.description}</div>
                            )}
                            <div style={{fontSize: '12px', marginTop: '6px', display: 'flex', gap: '8px'}}>
                              {item.requirePhoto && (
                                <span style={{color: '#1890ff'}}>需要拍照</span>
                              )}
                            </div>
                          </div>
                          <button 
                            type="button"
                            className="btn btn-danger"
                            style={{padding: '4px 8px', fontSize: '12px'}}
                            onClick={() => removeItem(index)}
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.items.length === 0 && (
                    <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>
                      暂无检查项，请添加
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? '保存修改' : '创建任务'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
