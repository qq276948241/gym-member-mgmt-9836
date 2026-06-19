import React, { useState, useEffect } from 'react'
import { memberApi } from '../api.js'

const statusMap = {
  active: { label: '正常', cls: 'badge-success' },
  inactive: { label: '停用', cls: 'badge-secondary' },
  expired: { label: '已过期', cls: 'badge-danger' }
}

const membershipMap = {
  monthly: '月卡',
  quarterly: '季卡',
  yearly: '年卡'
}

function MemberCard({ member, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusMap[member.status] || statusMap.active

  return (
    <div className={`member-card ${expanded ? 'expanded' : ''}`}>
      <div className="member-card-header" onClick={() => setExpanded(!expanded)}>
        <div className={`member-avatar ${member.gender === '女' ? 'female' : ''}`}>
          {member.name?.[0]}
        </div>
        <div className="member-info">
          <div className="member-name">
            {member.name}
            <span className={`badge ${status.cls}`} style={{ marginLeft: 8 }}>{status.label}</span>
          </div>
          <div className="member-meta">
            <span className="membership-badge">{membershipMap[member.membership_type] || member.membership_type}</span>
            <span>📱 {member.phone}</span>
          </div>
          <div className="member-meta" style={{ marginTop: 4 }}>
            <span>有效期: {member.membership_start || '-'} 至 {member.membership_end || '-'}</span>
          </div>
        </div>
        <span style={{ color: '#888', fontSize: 18 }}>{expanded ? '▲' : '▼'}</span>
      </div>
      <div className="member-details">
        <div className="member-details-grid">
          <div className="member-detail-item">
            <label>性别</label>
            <span>{member.gender || '-'}</span>
          </div>
          <div className="member-detail-item">
            <label>生日</label>
            <span>{member.birthday || '-'}</span>
          </div>
          <div className="member-detail-item">
            <label>邮箱</label>
            <span>{member.email || '-'}</span>
          </div>
          <div className="member-detail-item">
            <label>累计到店</label>
            <span>{member.total_visits || 0} 次</span>
          </div>
          <div className="member-detail-item">
            <label>最近到店</label>
            <span>{member.last_visit ? member.last_visit.slice(0, 10) : '-'}</span>
          </div>
          <div className="member-detail-item">
            <label>注册时间</label>
            <span>{member.created_at ? member.created_at.slice(0, 10) : '-'}</span>
          </div>
        </div>
        {member.notes && (
          <div className="member-notes">
            <strong style={{ color: '#FF6B00' }}>备注: </strong>{member.notes}
          </div>
        )}
        <div className="member-actions">
          <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); onEdit(member) }}>✏️ 编辑</button>
          <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); onDelete(member) }}>🗑️ 删除</button>
        </div>
      </div>
    </div>
  )
}

function MemberModal({ member, onClose, onSave }) {
  const [form, setForm] = useState({
    name: member?.name || '',
    gender: member?.gender || '男',
    phone: member?.phone || '',
    email: member?.email || '',
    birthday: member?.birthday || '',
    membership_type: member?.membership_type || 'monthly',
    membership_start: member?.membership_start || '',
    membership_end: member?.membership_end || '',
    status: member?.status || 'active',
    notes: member?.notes || ''
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name) return alert('请输入姓名')
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{member ? '编辑会员' : '新增会员'}</h3>
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
                <label className="form-label">邮箱</label>
                <input name="email" type="email" className="form-input" value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">生日</label>
                <input name="birthday" type="date" className="form-input" value={form.birthday} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">状态</label>
                <select name="status" className="form-select" value={form.status} onChange={handleChange}>
                  <option value="active">正常</option>
                  <option value="inactive">停用</option>
                  <option value="expired">已过期</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">会员卡类型</label>
                <select name="membership_type" className="form-select" value={form.membership_type} onChange={handleChange}>
                  <option value="monthly">月卡</option>
                  <option value="quarterly">季卡</option>
                  <option value="yearly">年卡</option>
                </select>
              </div>
              <div></div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">开始日期</label>
                <input name="membership_start" type="date" className="form-input" value={form.membership_start} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">到期日期</label>
                <input name="membership_end" type="date" className="form-input" value={form.membership_end} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">备注</label>
              <textarea name="notes" className="form-textarea" value={form.notes} onChange={handleChange}></textarea>
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

export default function Members() {
  const [members, setMembers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [perPage] = useState(8)
  const [filters, setFilters] = useState({ search: '', status: '', membership_type: '', gender: '' })
  const [modalOpen, setModalOpen] = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMembers = async () => {
    setLoading(true)
    try {
      const res = await memberApi.list({ page, per_page: perPage, ...filters })
      setMembers(res.data.items)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [page, filters])

  const handleSave = async (data) => {
    try {
      if (editMember) {
        await memberApi.update(editMember.id, data)
      } else {
        await memberApi.create(data)
      }
      setModalOpen(false)
      setEditMember(null)
      loadMembers()
    } catch (err) {
      alert('保存失败')
    }
  }

  const handleDelete = async (member) => {
    if (!confirm(`确定删除会员 "${member.name}" 吗？`)) return
    try {
      await memberApi.delete(member.id)
      loadMembers()
    } catch (err) {
      alert('删除失败')
    }
  }

  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">会员列表 ({total}人)</h2>
        <button className="btn btn-primary" onClick={() => { setEditMember(null); setModalOpen(true) }}>
          ➕ 新增会员
        </button>
      </div>

      <div className="filter-bar">
        <div className="filter-item">
          <label>搜索</label>
          <input
            type="text"
            className="form-input"
            placeholder="姓名/手机号/邮箱"
            value={filters.search}
            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1) }}
          />
        </div>
        <div className="filter-item">
          <label>状态</label>
          <select
            className="form-select"
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1) }}
          >
            <option value="">全部</option>
            <option value="active">正常</option>
            <option value="inactive">停用</option>
            <option value="expired">已过期</option>
          </select>
        </div>
        <div className="filter-item">
          <label>卡类型</label>
          <select
            className="form-select"
            value={filters.membership_type}
            onChange={(e) => { setFilters({ ...filters, membership_type: e.target.value }); setPage(1) }}
          >
            <option value="">全部</option>
            <option value="monthly">月卡</option>
            <option value="quarterly">季卡</option>
            <option value="yearly">年卡</option>
          </select>
        </div>
        <div className="filter-item">
          <label>性别</label>
          <select
            className="form-select"
            value={filters.gender}
            onChange={(e) => { setFilters({ ...filters, gender: e.target.value }); setPage(1) }}
          >
            <option value="">全部</option>
            <option value="男">男</option>
            <option value="女">女</option>
          </select>
        </div>
        <div className="filter-item" style={{ marginLeft: 'auto' }}>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => { setFilters({ search: '', status: '', membership_type: '', gender: '' }); setPage(1) }}
          >
            🔄 重置
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>加载中...</div>
      ) : members.length === 0 ? (
        <div className="empty-state">暂无会员数据</div>
      ) : (
        <>
          <div className="members-grid">
            {members.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                onEdit={(mem) => { setEditMember(mem); setModalOpen(true) }}
                onDelete={handleDelete}
              />
            ))}
          </div>
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>上一页</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map(p => (
              <button
                key={p}
                className={page === p ? 'active' : ''}
                onClick={() => setPage(p)}
              >{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>下一页</button>
            <span className="pagination-info">共 {total} 条，第 {page}/{totalPages} 页</span>
          </div>
        </>
      )}

      {modalOpen && (
        <MemberModal
          member={editMember}
          onClose={() => { setModalOpen(false); setEditMember(null) }}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
