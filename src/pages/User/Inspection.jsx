import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { getTaskById, addInspection, saveDraft, getDraft, checkTodaySubmitted, getAbnormalTasks, getAssignments } from '../../data';

export default function Inspection() {
  const { user } = useUser();
  const [task, setTask] = useState(null);
  const [assignmentId, setAssignmentId] = useState('');
  const [formData, setFormData] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteItems, setIncompleteItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasAbnormalNotice, setHasAbnormalNotice] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const aid = params.get('assignmentId');
    const tid = params.get('taskId');
    let taskData = null;

    if (tid) {
      taskData = getTaskById(tid);
      setTask(taskData);
    }
    if (aid) {
      setAssignmentId(aid);
      const submitted = checkTodaySubmitted(aid, user.id);
      setIsSubmitted(submitted);
      
      const draft = getDraft(aid, user.id);
      if (draft) {
        setFormData(draft.items.reduce((acc, item) => {
          acc[item.itemId] = item;
          return acc;
        }, {}));
      } else if (taskData) {
        const initialData = {};
        taskData.items.forEach(item => {
          initialData[item.id] = {
            itemId: item.id,
            status: null,
            remark: '',
            photos: []
          };
        });
        setFormData(initialData);
      }
    }
    
    // 检查是否有异常任务提醒
    const abnormalTasks = getAbnormalTasks();
    const assignments = getAssignments();
    const hasAbnormal = abnormalTasks.some(at => {
      const assignment = assignments.find(a => a.taskId === at.id && a.userId === user.id);
      return assignment && at.status === 'pending';
    });
    setHasAbnormalNotice(hasAbnormal);
  }, [user]);

  useEffect(() => {
    const autoSaveTimer = setInterval(() => {
      if (Object.keys(formData).length > 0 && !isSubmitted) {
        handleSaveDraft(true);
      }
    }, 30000);

    return () => clearInterval(autoSaveTimer);
  }, [formData, isSubmitted]);

  const handleSaveDraft = async (isAutoSave = false) => {
    if (isSubmitted || !assignmentId) return;
    
    setIsSaving(true);
    const draft = {
      assignmentId,
      userId: user.id,
      taskId: task?.id,
      date: new Date().toISOString().split('T')[0],
      items: Object.values(formData)
    };
    
    saveDraft(draft);
    setLastSaved(new Date());
    setIsSaving(false);
    
    if (!isAutoSave) {
      alert('保存成功');
    }
  };

  const handleStatusChange = (itemId, status) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        itemId,
        status
      }
    }));
  };

  const handleRemarkChange = (itemId, remark) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        remark
      }
    }));
  };

  const handlePhotoUpload = (itemId) => {
    const mockPhoto = `https://via.placeholder.com/300x300?text=Photo_${itemId}_${Date.now()}`;
    setFormData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        photos: [...(prev[itemId]?.photos || []), mockPhoto]
      }
    }));
  };

  const handleRemovePhoto = (itemId, photoIndex) => {
    setFormData(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        photos: prev[itemId].photos.filter((_, i) => i !== photoIndex)
      }
    }));
  };

  const validateForm = () => {
    const incomplete = [];
    
    task.items.forEach(item => {
      const data = formData[item.id];
      
      if (!data?.status) {
        incomplete.push({
          itemId: item.id,
          title: item.title,
          reason: '未选择自评（正常/异常）',
          data: data
        });
      } else if (item.requirePhoto && (!data?.photos || data.photos.length === 0)) {
        const existing = incomplete.find(i => i.itemId === item.id);
        if (existing) {
          existing.reason += '，未上传照片';
        } else {
          incomplete.push({
            itemId: item.id,
            title: item.title,
            reason: '未上传照片',
            data: data
          });
        }
      }
    });
    
    return incomplete;
  };

  const handleSubmit = () => {
    const incomplete = validateForm();
    
    if (incomplete.length > 0) {
      setIncompleteItems(incomplete);
      setShowIncompleteModal(true);
      return;
    }

    const inspection = {
      assignmentId,
      userId: user.id,
      taskId: task?.id,
      date: new Date().toISOString().split('T')[0],
      items: Object.values(formData)
    };

    const result = addInspection(inspection);
    setIsSubmitted(true);
    
    if (result.abnormalTask) {
      alert(`提交成功！注意：检测到 ${inspection.items.filter(i => i.status === 'abnormal').length} 个异常项，已自动创建异常任务，请尽快处理！`);
    } else {
      alert('提交成功！');
    }
    window.history.back();
  };

  const handleDirectEdit = (itemId) => {
    const item = task.items.find(i => i.id === itemId);
    if (item) {
      setEditingItem({
        ...item,
        data: formData[itemId]
      });
      setShowIncompleteModal(false);
    }
  };

  const saveEditedItem = () => {
    if (editingItem) {
      setFormData(prev => ({
        ...prev,
        [editingItem.id]: editingItem.data
      }));
      setEditingItem(null);
    }
  };

  if (!task) {
    return (
      <div className="inspection-page">
        <div className="empty-state">未找到任务信息</div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="inspection-page">
        <div className="submitted-notice">
          <div className="notice-icon">✓</div>
          <h3>今日任务已完成</h3>
          <p>您已完成今日的巡检任务，感谢您的配合！</p>
          {hasAbnormalNotice && (
            <div className="abnormal-notice" style={{
              marginTop: '20px',
              padding: '16px',
              background: '#fff2f0',
              borderRadius: '8px',
              textAlign: 'left'
            }}>
              <p style={{color: '#ff4d4f', fontSize: '14px', marginBottom: '8px'}}>
                ⚠️ 您有待处理的异常任务！
              </p>
              <p style={{color: '#666', fontSize: '13px'}}>
                请在任务列表中查看并处理异常事项。
              </p>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => window.history.back()}>
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inspection-page">
      <div className="page-header">
        <h1 className="page-title">{task.name}</h1>
        <div className="save-status">
          {isSaving ? (
            <span>保存中...</span>
          ) : lastSaved ? (
            <span>已保存 {lastSaved.toLocaleTimeString()}</span>
          ) : null}
        </div>
      </div>

      {hasAbnormalNotice && (
        <div className="abnormal-notice" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#ff4d4f',
          fontWeight: '500'
        }}>
          <span style={{fontSize: '18px'}}>⚠️</span>
          <span>您有待处理的异常任务，请优先处理！</span>
        </div>
      )}

      <div className="deadline-notice">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v6l4 2"/>
        </svg>
        <span>请在次日凌晨3点前完成并提交</span>
      </div>

      <div className="questionnaire">
        {task.items.map((item, index) => (
          <div key={item.id} className="question-item">
            <div className="question-header">
              <span className="question-number">{index + 1}</span>
              <div className="question-info">
                <h3 className="question-title">{item.title}</h3>
                <p className="question-desc">{item.description}</p>
              </div>
              {item.required && <span className="required-tag">必填</span>}
            </div>

            <div className="question-body">
              <div className="self-assessment">
                <label className="label">自评 *</label>
                <div className="radio-group">
                  <label 
                    className={`radio-item ${formData[item.id]?.status === 'normal' ? 'selected normal' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`status_${item.id}`}
                      checked={formData[item.id]?.status === 'normal'}
                      onChange={() => handleStatusChange(item.id, 'normal')}
                    />
                    <span>✓ 正常</span>
                  </label>
                  <label 
                    className={`radio-item ${formData[item.id]?.status === 'abnormal' ? 'selected abnormal' : ''}`}
                  >
                    <input
                      type="radio"
                      name={`status_${item.id}`}
                      checked={formData[item.id]?.status === 'abnormal'}
                      onChange={() => handleStatusChange(item.id, 'abnormal')}
                    />
                    <span>✗ 异常</span>
                  </label>
                </div>
              </div>

              <div className="remark-section">
                <label className="label">备注说明（选填）</label>
                <textarea
                  className="form-textarea"
                  value={formData[item.id]?.remark || ''}
                  onChange={(e) => handleRemarkChange(item.id, e.target.value)}
                  placeholder="如有特殊情况请在此说明..."
                />
              </div>

              <div className="photo-section">
                <label className="label">
                  拍照上传 {item.requirePhoto && <span className="required">*</span>}
                </label>
                <div className="photo-grid">
                  {formData[item.id]?.photos?.map((photo, photoIndex) => (
                    <div key={photoIndex} className="photo-item">
                      <img src={photo} alt={`照片${photoIndex + 1}`} />
                      <button 
                        className="photo-remove"
                        onClick={() => handleRemovePhoto(item.id, photoIndex)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="photo-add" onClick={() => handlePhotoUpload(item.id)}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    <span>添加照片</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="action-buttons">
        <button className="btn btn-outline" onClick={() => handleSaveDraft()}>
          保存草稿
        </button>
        <button className="btn btn-primary" onClick={handleSubmit}>
          提交巡检
        </button>
      </div>

      {/* 未完成项弹窗 - 可直接操作 */}
      {showIncompleteModal && (
        <div className="modal-overlay" onClick={() => setShowIncompleteModal(false)}>
          <div className="modal-content" style={{maxWidth: '600px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">请完善以下内容</h2>
              <button className="modal-close" onClick={() => setShowIncompleteModal(false)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 8L2 16M10 8l8 8M10 8L2 4M10 8l8-8"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <p className="incomplete-notice">以下内容尚未填写完整，点击可直接编辑：</p>
              <div className="incomplete-list">
                {incompleteItems.map((item, index) => (
                  <div key={index} className="incomplete-item" style={{cursor: 'pointer'}} onClick={() => handleDirectEdit(item.itemId)}>
                    <span className="item-number">{index + 1}</span>
                    <div className="item-info">
                      <div className="item-title">{item.title}</div>
                      <div className="item-reason">{item.reason}</div>
                      <div className="item-action" style={{marginTop: '8px', fontSize: '12px', color: '#1890ff'}}>
                        点击此处直接编辑 →
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowIncompleteModal(false)}>
                返回填写
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 直接编辑检查项弹窗 */}
      {editingItem && (
        <div className="modal-overlay" onClick={() => setEditingItem(null)}>
          <div className="modal-content" style={{maxWidth: '600px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">编辑：{editingItem.title}</h2>
              <button className="modal-close" onClick={() => setEditingItem(null)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 8L2 16M10 8l8 8M10 8L2 4M10 8l8-8"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <p style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>{editingItem.description}</p>
              
              <div className="form-group">
                <label className="label">自评 *</label>
                <div className="radio-group">
                  <label 
                    className={`radio-item ${editingItem.data?.status === 'normal' ? 'selected normal' : ''}`}
                    onClick={() => setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, status: 'normal' }
                    })}
                  >
                    <input
                      type="radio"
                      checked={editingItem.data?.status === 'normal'}
                      readOnly
                    />
                    <span>✓ 正常</span>
                  </label>
                  <label 
                    className={`radio-item ${editingItem.data?.status === 'abnormal' ? 'selected abnormal' : ''}`}
                    onClick={() => setEditingItem({
                      ...editingItem,
                      data: { ...editingItem.data, status: 'abnormal' }
                    })}
                  >
                    <input
                      type="radio"
                      checked={editingItem.data?.status === 'abnormal'}
                      readOnly
                    />
                    <span>✗ 异常</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="label">备注说明（选填）</label>
                <textarea
                  className="form-textarea"
                  value={editingItem.data?.remark || ''}
                  onChange={(e) => setEditingItem({
                    ...editingItem,
                    data: { ...editingItem.data, remark: e.target.value }
                  })}
                  placeholder="如有特殊情况请在此说明..."
                />
              </div>

              <div className="form-group">
                <label className="label">
                  拍照上传 {editingItem.requirePhoto && <span className="required">*</span>}
                </label>
                <div className="photo-grid">
                  {editingItem.data?.photos?.map((photo, photoIndex) => (
                    <div key={photoIndex} className="photo-item">
                      <img src={photo} alt={`照片${photoIndex + 1}`} />
                      <button 
                        className="photo-remove"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingItem({
                            ...editingItem,
                            data: {
                              ...editingItem.data,
                              photos: editingItem.data.photos.filter((_, i) => i !== photoIndex)
                            }
                          });
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                  <div className="photo-add" onClick={() => {
                    const mockPhoto = `https://via.placeholder.com/300x300?text=Photo_${editingItem.id}_${Date.now()}`;
                    setEditingItem({
                      ...editingItem,
                      data: {
                        ...editingItem.data,
                        photos: [...(editingItem.data?.photos || []), mockPhoto]
                      }
                    });
                  }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                    <span>添加照片</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setEditingItem(null)}>
                取消
              </button>
              <button className="btn btn-primary" onClick={saveEditedItem}>
                保存此项
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
