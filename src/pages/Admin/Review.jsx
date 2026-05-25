import { useState, useEffect } from 'react';
import { getInspectionById, getTaskById, getUserById, updateInspection, adminMarkAbnormal } from '../../data';

export default function AdminReview() {
  const [inspection, setInspection] = useState(null);
  const [task, setTask] = useState(null);
  const [user, setUser] = useState(null);
  const [score, setScore] = useState(80);
  const [comment, setComment] = useState('');
  const [selectedResult, setSelectedResult] = useState('pass');
  const [itemResults, setItemResults] = useState({});
  const [abnormalItems, setAbnormalItems] = useState([]);
  const [abnormalReason, setAbnormalReason] = useState('');
  const [showAbnormalModal, setShowAbnormalModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    
    if (id) {
      const inspect = getInspectionById(id);
      if (inspect) {
        setInspection(inspect);
        setTask(getTaskById(inspect.taskId));
        setUser(getUserById(inspect.userId));
        setScore(inspect.score || 80);
        setComment(inspect.comment || '');
        setSelectedResult(inspect.status === 'approved' ? 'pass' : inspect.status === 'rejected' ? 'reject' : 'pass');
        
        // 初始化每个检查项的审核结果
        if (inspect.items) {
          const results = {};
          inspect.items.forEach(item => {
            results[item.itemId] = {
              status: item.status === 'normal' ? 'pass' : 'abnormal',
              remark: ''
            };
          });
          setItemResults(results);
        }
      }
    }
  }, []);

  const handleItemStatusChange = (itemId, status) => {
    setItemResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        status
      }
    }));
  };

  const handleItemRemarkChange = (itemId, remark) => {
    setItemResults(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        remark
      }
    }));
  };

  const handleMarkAbnormal = (item) => {
    setAbnormalItems([item]);
    setAbnormalReason('');
    setShowAbnormalModal(true);
  };

  const handleSubmitAbnormal = () => {
    if (!abnormalItems.length || !abnormalReason.trim()) {
      alert('请填写异常原因');
      return;
    }

    if (!inspection) return;

    // 创建异常子任务
    const abnormalTask = adminMarkAbnormal(
      inspection.id,
      abnormalItems.map(item => ({
        itemId: item.itemId,
        title: task.items.find(t => t.id === item.itemId)?.title,
        description: task.items.find(t => t.id === item.itemId)?.description,
        requirePhoto: task.items.find(t => t.id === item.itemId)?.requirePhoto,
        required: true,
        originalStatus: item.status
      })),
      abnormalReason
    );

    setShowAbnormalModal(false);
    alert(`已标记异常并创建任务：${abnormalTask.name}`);
    window.history.back();
  };

  const handleSubmit = () => {
    if (!inspection) return;

    // 检查是否有被标记为异常的项
    const markedAbnormal = Object.entries(itemResults)
      .filter(([_, result]) => result.status === 'abnormal')
      .map(([itemId, result]) => ({
        itemId,
        status: 'abnormal',
        remark: result.remark
      }));

    if (markedAbnormal.length > 0) {
      const confirmMark = confirm(`检测到 ${markedAbnormal.length} 个检查项被标记为异常，将创建异常任务。是否继续？`);
      if (!confirmMark) return;

      // 创建异常任务
      const abnormalTask = adminMarkAbnormal(
        inspection.id,
        markedAbnormal.map(item => ({
          itemId: item.itemId,
          title: task.items.find(t => t.id === item.itemId)?.title,
          description: task.items.find(t => t.id === item.itemId)?.description,
          requirePhoto: task.items.find(t => t.id === item.itemId)?.requirePhoto,
          required: true,
          originalStatus: item.status
        })),
        '管理员审核标记异常'
      );

      updateInspection(inspection.id, {
        status: 'rejected',
        score: 0,
        comment: comment + (comment ? '\n' : '') + `管理员标记 ${markedAbnormal.length} 个检查项异常`
      });

      alert(`提交成功！已创建异常任务：${abnormalTask.name}`);
    } else {
      const status = selectedResult === 'pass' ? 'approved' : 'rejected';
      updateInspection(inspection.id, {
        status,
        score: selectedResult === 'reject' ? 0 : score,
        comment
      });

      alert('考核完成');
    }

    window.history.back();
  };

  if (!inspection) {
    return <div className="empty-state">未找到巡检记录</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">考核评分</h1>
      </div>

      {/* 巡检详情卡片 */}
      <div className="card">
        <div className="review-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h3 style={{margin: 0, fontSize: '18px', fontWeight: '600'}}>{task?.name}</h3>
          <span className={`status-tag ${inspection.status === 'pending' ? 'status-pending' : inspection.status === 'approved' ? 'status-approved' : 'status-rejected'}`}>
            {inspection.status === 'pending' ? '待审核' : inspection.status === 'approved' ? '已通过' : '需整改'}
          </span>
        </div>

        <div style={{display: 'flex', gap: '20px', marginBottom: '20px', padding: '12px', background: '#f7f8fa', borderRadius: '8px'}}>
          <div>
            <div style={{fontSize: '12px', color: '#999', marginBottom: '4px'}}>执行人</div>
            <div style={{fontSize: '14px', fontWeight: '500'}}>{user?.name}</div>
          </div>
          <div>
            <div style={{fontSize: '12px', color: '#999', marginBottom: '4px'}}>执行时间</div>
            <div style={{fontSize: '14px', fontWeight: '500'}}>{new Date(inspection.submittedAt).toLocaleString()}</div>
          </div>
        </div>

        {/* 检查项列表 */}
        <div style={{marginBottom: '20px'}}>
          <h4 style={{fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#333'}}>检查项详情</h4>
          {task?.items?.map((item, index) => {
            const itemData = inspection.items?.find(i => i.itemId === item.id);
            const result = itemResults[item.id] || {};
            const isAdminMarkedAbnormal = result.status === 'abnormal';
            
            return (
              <div key={item.id} style={{
                padding: '16px',
                background: isAdminMarkedAbnormal ? '#fff2f0' : '#fafafa',
                borderRadius: '8px',
                marginBottom: '12px',
                border: isAdminMarkedAbnormal ? '1px solid #ffccc7' : '1px solid #e8e8e8'
              }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px'}}>
                  <div style={{flex: 1}}>
                    <div style={{fontWeight: '600', marginBottom: '4px', fontSize: '14px'}}>
                      {index + 1}. {item.title}
                    </div>
                    <div style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>{item.description}</div>
                  </div>
                  <div style={{display: 'flex', gap: '8px'}}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: itemData?.status === 'normal' ? '#f6ffed' : '#fff2f0',
                      color: itemData?.status === 'normal' ? '#52c41a' : '#ff4d4f'
                    }}>
                      {itemData?.status === 'normal' ? '✓ 正常' : '✗ 异常'}
                    </span>
                    {isAdminMarkedAbnormal && (
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: '#ff4d4f',
                        color: 'white'
                      }}>
                        管理员标记
                      </span>
                    )}
                  </div>
                </div>

                {itemData?.remark && (
                  <div style={{fontSize: '13px', color: '#666', marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px'}}>
                    <strong>用户备注：</strong>{itemData.remark}
                  </div>
                )}

                {itemData?.photos && itemData.photos.length > 0 && (
                  <div style={{marginBottom: '8px'}}>
                    <div style={{fontSize: '12px', color: '#999', marginBottom: '6px'}}>照片：</div>
                    <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                      {itemData.photos.map((photo, idx) => (
                        <div key={idx} style={{width: '80px', height: '80px', borderRadius: '4px', overflow: 'hidden'}}>
                          <img src={photo} alt={`照片${idx + 1}`} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 管理员审核操作 */}
                <div style={{marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8e8e8'}}>
                  <div style={{fontSize: '12px', color: '#666', marginBottom: '8px'}}>管理员审核：</div>
                  <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                    <label style={{display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'}}>
                      <input
                        type="radio"
                        checked={result.status === 'pass'}
                        onChange={() => handleItemStatusChange(item.id, 'pass')}
                      />
                      <span style={{fontSize: '13px'}}>合格</span>
                    </label>
                    <label style={{display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer'}}>
                      <input
                        type="radio"
                        checked={result.status === 'abnormal'}
                        onChange={() => handleItemStatusChange(item.id, 'abnormal')}
                      />
                      <span style={{fontSize: '13px'}}>标记异常</span>
                    </label>
                    {result.status === 'abnormal' && (
                      <input
                        type="text"
                        className="form-input"
                        style={{flex: 1, height: '36px', fontSize: '13px'}}
                        placeholder="填写异常原因"
                        value={result.remark || ''}
                        onChange={(e) => handleItemRemarkChange(item.id, e.target.value)}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 考核评分卡片 */}
      <div className="card">
        <h3 className="card-title">考核评分</h3>

        <div className="form-group">
          <label className="form-label">审核结果</label>
          <div className="radio-group">
            <label className={`radio-item ${selectedResult === 'pass' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="result"
                value="pass"
                checked={selectedResult === 'pass'}
                onChange={(e) => setSelectedResult(e.target.value)}
              />
              <span>通过</span>
            </label>
            <label className={`radio-item ${selectedResult === 'reject' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="result"
                value="reject"
                checked={selectedResult === 'reject'}
                onChange={(e) => setSelectedResult(e.target.value)}
              />
              <span>需整改</span>
            </label>
          </div>
        </div>

        {selectedResult === 'pass' && (
          <div className="form-group">
            <label className="form-label">考核得分：{score}分</label>
            <input
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
              className="score-slider"
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">评语</label>
          <textarea
            className="form-textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="请输入考核评语"
          />
        </div>

        <div style={{display: 'flex', gap: '12px', marginTop: '20px'}}>
          <button className="btn btn-outline" onClick={() => window.history.back()} style={{flex: 1}}>
            返回
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} style={{flex: 2}}>
            提交考核
          </button>
        </div>
      </div>
    </div>
  );
}
