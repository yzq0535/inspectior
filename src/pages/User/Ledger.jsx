import { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { getInspectionsByUserId, getTasks } from '../../data';
import { formatDate, getScoreLabel } from '../../utils/storage';

export default function UserLedger() {
  const { user } = useUser();
  const [inspections, setInspections] = useState([]);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [weeks, setWeeks] = useState([]);

  useEffect(() => {
    if (!user) return;

    const inspects = getInspectionsByUserId(user.id);
    setInspections(inspects);

    const weekList = [];
    const today = new Date();
    for (let i = 0; i < 8; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i * 7);
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      weekList.push({
        label: `第${8 - i}周`,
        start: formatDate(startOfWeek),
        end: formatDate(endOfWeek)
      });
    }
    setWeeks(weekList);
  }, [user]);

  const getWeekInspections = () => {
    const week = weeks[selectedWeek];
    if (!week) return inspections;

    return inspections.filter(i => {
      const date = new Date(i.inspectedAt);
      return date >= new Date(week.start) && date <= new Date(week.end);
    });
  };

  const weekInspections = getWeekInspections();
  const scoredInspections = weekInspections.filter(i => i.score !== null);
  const avgScore = scoredInspections.length > 0 
    ? Math.round(scoredInspections.reduce((sum, i) => sum + i.score, 0) / scoredInspections.length)
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">我的台账</h1>
      </div>

      <div className="card">
        <div className="week-selector">
          <select
            className="form-select"
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
          >
            {weeks.map((week, index) => (
              <option key={index} value={index}>
                {week.label} ({week.start} ~ {week.end})
              </option>
            ))}
          </select>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <span className="stat-value">{weekInspections.length}</span>
            <span className="stat-label">巡检次数</span>
          </div>
          <div className="stat-item">
            <span className="stat-value" style={{ color: avgScore >= 80 ? '#52c41a' : avgScore >= 60 ? '#faad14' : '#ff4d4f' }}>{avgScore}</span>
            <span className="stat-label">平均得分</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">巡检记录</h3>
        {weekInspections.length > 0 ? (
          <div className="record-list">
            {weekInspections.map((inspection) => {
              const task = getTasks().find(t => t.id === inspection.taskId);
              return (
                <div key={inspection.id} className="record-item">
                  <div className="record-header">
                    <div className="record-info">
                      <div className="record-name">{task?.name}</div>
                      <div className="record-time">{formatDate(inspection.inspectedAt, 'YYYY-MM-DD HH:mm')}</div>
                    </div>
                    <div className="record-status">
                      <span className={`status-tag ${inspection.status === 'pending' ? 'status-pending' : inspection.status === 'approved' ? 'status-approved' : 'status-rejected'}`}>
                        {inspection.status === 'pending' ? '待审核' : inspection.status === 'approved' ? '已通过' : '需整改'}
                      </span>
                      {inspection.score !== null && (
                        <span className={`score-badge ${inspection.score >= 80 ? 'high' : inspection.score >= 60 ? 'medium' : 'low'}`}>
                          {inspection.score}分
                        </span>
                      )}
                    </div>
                  </div>

                  {inspection.remark && (
                    <div className="record-remark">{inspection.remark}</div>
                  )}

                  {inspection.photos && inspection.photos.length > 0 && (
                    <div className="record-photos">
                      {inspection.photos.slice(0, 3).map((photo, i) => (
                        <div key={i} className="photo-thumb">
                          <img src={photo} alt="" />
                        </div>
                      ))}
                    </div>
                  )}

                  {inspection.comment && (
                    <div className="record-comment">
                      <span className="comment-label">评语：</span>
                      <span className="comment-content">{inspection.comment}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">本周暂无巡检记录</div>
        )}
      </div>
    </div>
  );
}
