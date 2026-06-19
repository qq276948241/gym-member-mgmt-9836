import React, { useState, useEffect } from 'react'
import api, { memberApi } from '../api.js'

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

const DURATION_OPTIONS = [
  { value: '1month', label: '1个月', days: 30, price: '¥299' },
  { value: '3months', label: '3个月', days: 90, price: '¥799' },
  { value: '6months', label: '6个月', days: 180, price: '¥1,499' },
  { value: '1year', label: '1年', days: 365, price: '¥2,799' }
]

const PAYMENT_OPTIONS = [
  { value: 'cash', label: '💵 现金' },
  { value: 'wechat', label: '💚 微信支付' },
  { value: 'alipay', label: '💙 支付宝' },
  { value: 'card', label: '💳 银行卡' },
  { value: 'transfer', label: '🏦 对公转账' }
]

function MemberCard({ member, selected, onToggle, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const status = statusMap[member.status] || statusMap.active

  return (
    <div className={`member-card ${expanded ? 'expanded' : ''} ${selected ? 'selected' : ''}`}
      style={selected ? { borderColor: '#FF6B00', boxShadow: '0 0 0 2px rgba(255,107,0,0.3)' } : {}}>
      <div className="member-card-header" onClick={() => setExpanded(!expanded)}>
        <div style={{
          width: 22, height: 22, flexShrink: 0, marginRight: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={(e) => { e.stopPropagation(); onToggle(member.id) }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggle(member.id)}
            style={{ width: 18, height: 18, accentColor: '#FF6B00', cursor: 'pointer' }}
          />
        </div>
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
          <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); onToggle(member.id, true); }}>🔄 单独续卡</button>
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

function RenewModal({ selectedCount, selectedMembers, onClose, onConfirm }) {
  const [duration, setDuration] = useState('1month')
  const [payment, setPayment] = useState('wechat')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await onConfirm({ duration, payment_method: payment })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">🔄 批量续卡</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{
            padding: 16, borderRadius: 10, background: 'rgba(255,107,0,0.1)',
            border: '1px solid rgba(255,107,0,0.3)', marginBottom: 20
          }}>
            <div style={{ fontSize: 14, color: '#FF6B00', fontWeight: 600, marginBottom: 6 }}>
              已选择 {selectedCount} 名会员
            </div>
            <div style={{ fontSize: 13, color: '#B0B0B0', maxHeight: 80, overflowY: 'auto' }}>
              {selectedMembers.slice(0, 8).map(m => m.name).join('、')}
              {selectedMembers.length > 8 && ` 等 ${selectedMembers.length} 人`}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">续期时长 *</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10
            }}>
              {DURATION_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => setDuration(opt.value)}
                  style={{
                    padding: 14, borderRadius: 10, cursor: 'pointer',
                    border: `2px solid ${duration === opt.value ? '#FF6B00' : '#333'}`,
                    background: duration === opt.value ? 'rgba(255,107,0,0.1)' : 'var(--bg-input)',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{opt.label}</span>
                    <span style={{ color: '#FF6B00', fontWeight: 600 }}>{opt.price}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>延长 {opt.days} 天有效期</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">扣费方式 *</label>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10
            }}>
              {PAYMENT_OPTIONS.map(opt => (
                <div
                  key={opt.value}
                  onClick={() => setPayment(opt.value)}
                  style={{
                    padding: 12, borderRadius: 8, cursor: 'pointer', textAlign: 'center',
                    border: `2px solid ${payment === opt.value ? '#FF6B00' : '#333'}`,
                    background: payment === opt.value ? 'rgba(255,107,0,0.1)' : 'var(--bg-input)',
                    transition: 'all 0.15s', fontSize: 14, fontWeight: 500
                  }}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>取消</button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? '处理中...' : `确认续卡 (${selectedCount}人)`}
          </button>
        </div>
      </div>
    </div>
  )
}

function RenewResultModal({ result, onClose, onRefresh }) {
  if (!result) return null
  const { summary, success_list, failed_list } = result
  const allSuccess = summary.failed === 0

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {allSuccess ? '✅ 续卡完成' : '📋 续卡结果'}
          </h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24
          }}>
            <div style={{
              padding: 20, borderRadius: 10, background: 'var(--bg-input)', textAlign: 'center'
            }}>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>总计</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{summary.total}</div>
            </div>
            <div style={{
              padding: 20, borderRadius: 10, background: 'rgba(34,197,94,0.1)', textAlign: 'center',
              border: '1px solid rgba(34,197,94,0.3)'
            }}>
              <div style={{ fontSize: 13, color: '#22C55E', marginBottom: 6 }}>成功</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#22C55E' }}>{summary.success}</div>
            </div>
            <div style={{
              padding: 20, borderRadius: 10,
              background: summary.failed > 0 ? 'rgba(239,68,68,0.1)' : 'var(--bg-input)',
              textAlign: 'center',
              border: summary.failed > 0 ? '1px solid rgba(239,68,68,0.3)' : 'none'
            }}>
              <div style={{ fontSize: 13, color: summary.failed > 0 ? '#EF4444' : '#888', marginBottom: 6 }}>失败</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: summary.failed > 0 ? '#EF4444' : '#888' }}>{summary.failed}</div>
            </div>
          </div>

          {success_list && success_list.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{
                fontSize: 15, fontWeight: 600, marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8, color: '#22C55E'
              }}>
                ✅ 续卡成功 ({success_list.length})
              </div>
              <div style={{
                maxHeight: 180, overflowY: 'auto',
                border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden'
              }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', top: 0, background: 'var(--bg-input)' }}>姓名</th>
                      <th>操作</th>
                      <th>原到期日</th>
                      <th>新到期日</th>
                      <th>扣费方式</th>
                    </tr>
                  </thead>
                  <tbody>
                    {success_list.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td>
                          <span className={`badge ${item.renew_type === 'extended' ? 'badge-primary' : 'badge-success'}`}>
                            {item.renew_type === 'extended' ? '有效期延长' : '过期重开'}
                          </span>
                        </td>
                        <td style={{ color: '#888' }}>{item.old_end || '-'}</td>
                        <td style={{ color: '#22C55E', fontWeight: 500 }}>{item.new_end}</td>
                        <td>{item.payment_method}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {failed_list && failed_list.length > 0 && (
            <div>
              <div style={{
                fontSize: 15, fontWeight: 600, marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8, color: '#EF4444'
              }}>
                ❌ 续卡失败 ({failed_list.length})
              </div>
              <div style={{
                maxHeight: 180, overflowY: 'auto',
                border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, overflow: 'hidden',
                background: 'rgba(239,68,68,0.03)'
              }}>
                <table style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ position: 'sticky', top: 0, background: 'var(--bg-input)' }}>姓名</th>
                      <th style={{ color: '#EF4444' }}>失败原因</th>
                    </tr>
                  </thead>
                  <tbody>
                    {failed_list.map(item => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 500 }}>{item.name}</td>
                        <td style={{ color: '#EF4444' }}>⚠️ {item.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>关闭</button>
          <button type="button" className="btn btn-primary" onClick={() => { onClose(); onRefresh(); }}>
            刷新列表
          </button>
        </div>
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

  const [selectedIds, setSelectedIds] = useState(new Set())
  const [renewModalOpen, setRenewModalOpen] = useState(false)
  const [renewResult, setRenewResult] = useState(null)

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

  const toggleSelect = (id, openRenew = false) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    if (openRenew) {
      setTimeout(() => {
        const s = new Set([id])
        setSelectedIds(s)
        setRenewModalOpen(true)
      }, 50)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === members.length && members.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(members.map(m => m.id)))
    }
  }

  const clearSelection = () => setSelectedIds(new Set())

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

  const handleBatchRenew = async ({ duration, payment_method }) => {
    try {
      const ids = Array.from(selectedIds)
      const res = await api.post('/members/batch-renew', {
        member_ids: ids,
        duration,
        payment_method
      })
      setRenewModalOpen(false)
      setRenewResult(res.data)
    } catch (err) {
      alert(err.response?.data?.message || '续卡失败，请重试')
    }
  }

  const afterResultCloseRefresh = () => {
    setRenewResult(null)
    setSelectedIds(new Set())
    loadMembers()
  }

  const totalPages = Math.ceil(total / perPage)
  const allChecked = members.length > 0 && selectedIds.size === members.length
  const selectedMembers = members.filter(m => selectedIds.has(m.id))
  const indeterminate = selectedIds.size > 0 && selectedIds.size < members.length

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">会员列表 ({total}人)</h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {selectedIds.size > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '8px 16px', background: 'rgba(255,107,0,0.1)',
              borderRadius: 8, border: '1px solid rgba(255,107,0,0.3)',
              fontSize: 14
            }}>
              <span>
                已选 <strong style={{ color: '#FF6B00' }}>{selectedIds.size}</strong> 项
              </span>
              <button className="btn btn-sm btn-primary" onClick={() => setRenewModalOpen(true)}>
                🔄 批量续卡
              </button>
              <button className="btn btn-sm btn-secondary" onClick={clearSelection}>
                取消选择
              </button>
            </div>
          )}
          <button className="btn btn-primary" onClick={() => { setEditMember(null); setModalOpen(true) }}>
            ➕ 新增会员
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-item">
          <label>全选</label>
          <input
            type="checkbox"
            checked={allChecked}
            ref={el => { if (el) el.indeterminate = indeterminate }}
            onChange={toggleSelectAll}
            style={{ width: 18, height: 18, accentColor: '#FF6B00', cursor: 'pointer' }}
          />
        </div>
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
                selected={selectedIds.has(m.id)}
                onToggle={toggleSelect}
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

      {renewModalOpen && (
        <RenewModal
          selectedCount={selectedIds.size}
          selectedMembers={selectedMembers}
          onClose={() => setRenewModalOpen(false)}
          onConfirm={handleBatchRenew}
        />
      )}

      {renewResult && (
        <RenewResultModal
          result={renewResult}
          onClose={() => setRenewResult(null)}
          onRefresh={afterResultCloseRefresh}
        />
      )}
    </div>
  )
}
