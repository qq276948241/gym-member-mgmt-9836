import React, { useState, useEffect } from 'react'
import { coachApi } from '../api.js'

const statusMap = {
  active: { label: '在职', cls: 'badge-success' },
  inactive: { label: '离职', cls: 'badge-secondary' }
}

function CoachModal({ coach, onClose, onSave }) {
  const [form, setForm] = useState({
    name: coach?.name || '',
    gender: coach?.gender || '男',
    phone: coach?.phone || '',
    specialty: coach?.specialty || '',
    experience_years: coach?.experience_years || 0,
    status: coach?.status || 'active'
  })

  const handleChange = (e) => {
    const val = e.target.name === 'experience_years' ? parseInt(e.target.value) || 0 : e.target.value
    setForm({ ...form, [e.target.name]: val })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name) return alert('请输入姓名')
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{coach ? '编辑教练' : '新增教练'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">姓名 *</label>
                <input name="name" className="form-input" value={form.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">性别</label>
                <select name="gender" className="form-select" value={form.gender} onChange={handleChange}>
                  <option value="男">男</option>
                  <option value="女">女</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">手机号</label>
                <input name="phone" className="form-input" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">从业年限</label>
                <input name="experience_years" type="number" min="0" className="form-input" value={form.experience_years} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">专长</label>
              <input name="specialty" className="form-input" value={form.specialty} onChange={handleChange} placeholder="如:力量训练、瑜伽、有氧" />
            </div>
            <div className="form-group">
              <label className="form-label">状态</label>
              <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                <option value="active">在职</option>
                <option value="inactive">离职</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>取消</button>
            <button type="submit" className="btn btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Coaches() {
  const [coaches, setCoaches] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editCoach, setEditCoach] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const loadCoaches = async () => {
    setLoading(true)
    try {
      const res = await coachApi.list({ status: statusFilter })
      setCoaches(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCoaches()
  }, [statusFilter])

  const handleSave = async (data) => {
    try {
      if (editCoach) {
        await coachApi.update(editCoach.id, data)
      } else {
        await coachApi.create(data)
      }
      setModalOpen(false)
      setEditCoach(null)
      loadCoaches()
    } catch (err) {
      alert('保存失败')
    }
  }

  const handleDelete = async (coach) => {
    if (!confirm(`确定删除教练 "${coach.name}" 吗？`)) return
    try {
      await coachApi.delete(coach.id)
      loadCoaches()
    } catch (err) {
      alert('删除失败')
    }
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">教练列表 ({coaches.length}人)</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <select
            className="form-input"
            style={{ width: 'auto', minWidth: 120 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">全部状态</option>
            <option value="active">在职</option>
            <option value="inactive">离职</option>
          </select>
          <button className="btn btn-primary" onClick={() => { setEditCoach(null); setModalOpen(true) }}>
            ➕ 新增教练
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>加载中...</div>
      ) : coaches.length === 0 ? (
        <div className="empty-state">暂无教练数据</div>
      ) : (
        <div className="card-body">
          <div className="coaches-grid">
            {coaches.map(c => {
              const status = statusMap[c.status] || statusMap.active
              return (
                <div key={c.id} className="coach-card">
                  <div className={`coach-avatar ${c.gender === '女' ? 'female' : ''}`}
                    style={c.gender === '女' ? { background: '#EC4899' } : {}}>
                    {c.name?.[0]}
                  </div>
                  <div className="coach-name">
                    {c.name}
                    <span className={`badge ${status.cls}`} style={{ marginLeft: 8 }}>{status.label}</span>
                  </div>
                  <div className="coach-specialty">🏋️ {c.specialty || '-'}</div>
                  <div className="coach-meta">
                    {c.experience_years}年经验 · {c.phone || '暂无电话'}
                  </div>
                  <div className="coach-actions">
                    <button className="btn btn-sm btn-primary" onClick={() => { setEditCoach(c); setModalOpen(true) }}>
                      ✏️ 编辑
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c)}>
                      🗑️ 删除
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {modalOpen && (
        <CoachModal
          coach={editCoach}
          onClose={() => { setModalOpen(false); setEditCoach(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
