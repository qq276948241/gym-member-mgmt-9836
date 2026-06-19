import React, { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { courseApi, coachApi } from '../api.js'

const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']

function CourseModal({ course, coaches, onClose, onSave }) {
  const [form, setForm] = useState({
    name: course?.name || '',
    description: course?.description || '',
    coach_id: course?.coach_id || (coaches[0]?.id || ''),
    duration_minutes: course?.duration_minutes || 60,
    capacity: course?.capacity || 20,
    course_date: course?.course_date || dayjs().format('YYYY-MM-DD'),
    start_time: course?.start_time?.slice(0, 5) || '09:00',
    end_time: course?.end_time?.slice(0, 5) || '10:00',
    location: course?.location || '',
    status: course?.status || 'scheduled'
  })

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name) return alert('请输入课程名称')
    onSave(form)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{course ? '编辑课程' : '新增课程'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">课程名称 *</label>
              <input name="name" className="form-input" value={form.name} onChange={handleChange} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">授课教练</label>
                <select name="coach_id" className="form-select" value={form.coach_id} onChange={handleChange}>
                  {coaches.map(c => <option key={c.id} value={c.id}>{c.name} - {c.specialty}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">上课地点</label>
                <input name="location" className="form-input" value={form.location} onChange={handleChange} placeholder="如:1号训练厅" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">课程日期</label>
                <input name="course_date" type="date" className="form-input" value={form.course_date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">容纳人数</label>
                <input name="capacity" type="number" min="1" className="form-input" value={form.capacity} onChange={handleChange} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">开始时间</label>
                <input name="start_time" type="time" className="form-input" value={form.start_time} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">结束时间</label>
                <input name="end_time" type="time" className="form-input" value={form.end_time} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">课程描述</label>
              <textarea name="description" className="form-textarea" value={form.description} onChange={handleChange}></textarea>
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

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [coaches, setCoaches] = useState([])
  const [currentDate, setCurrentDate] = useState(dayjs())
  const [view, setView] = useState('month')
  const [modalOpen, setModalOpen] = useState(false)
  const [editCourse, setEditCourse] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    setLoading(true)
    try {
      const start = currentDate.startOf(view === 'month' ? 'month' : 'week').format('YYYY-MM-DD')
      const end = currentDate.endOf(view === 'month' ? 'month' : 'week').format('YYYY-MM-DD')
      const [cRes, coachRes] = await Promise.all([
        courseApi.list({ start_date: start, end_date: end }),
        coachApi.list({ status: 'active' })
      ])
      setCourses(cRes.data)
      setCoaches(coachRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [currentDate, view])

  const handleSave = async (data) => {
    try {
      if (editCourse) {
        await courseApi.update(editCourse.id, data)
      } else {
        await courseApi.create(data)
      }
      setModalOpen(false)
      setEditCourse(null)
      loadData()
    } catch (err) {
      alert('保存失败')
    }
  }

  const handleDelete = async (course) => {
    if (!confirm(`确定删除课程 "${course.name}" 吗？`)) return
    try {
      await courseApi.delete(course.id)
      loadData()
    } catch (err) {
      alert('删除失败')
    }
  }

  const getMonthDays = () => {
    const start = currentDate.startOf('month').startOf('week')
    const end = currentDate.endOf('month').endOf('week')
    const days = []
    let d = start
    while (d.isBefore(end) || d.isSame(end, 'day')) {
      days.push(d)
      d = d.add(1, 'day')
    }
    return days
  }

  const getWeekDays = () => {
    const start = currentDate.startOf('week')
    return Array.from({ length: 7 }, (_, i) => start.add(i, 'day'))
  }

  const getCoursesByDate = (date) => {
    return courses.filter(c => dayjs(c.course_date).isSame(date, 'day'))
  }

  const handleCellClick = (date) => {
    setSelectedDate(date)
    setEditCourse(null)
    setModalOpen(true)
  }

  const renderMonthView = () => {
    const days = getMonthDays()
    return (
      <>
        <div className="calendar-weekdays">
          {weekdayNames.map(w => <div key={w} className="calendar-weekday">{w}</div>)}
        </div>
        <div className="calendar-grid">
          {days.map((d, i) => {
            const isOtherMonth = !d.isSame(currentDate, 'month')
            const isToday = d.isSame(dayjs(), 'day')
            const dayCourses = getCoursesByDate(d)
            return (
              <div
                key={i}
                className={`calendar-cell ${isOtherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                onClick={() => handleCellClick(d)}
              >
                <div className="calendar-date">{d.date()}</div>
                <div className="calendar-events">
                  {dayCourses.slice(0, 3).map(c => (
                    <div
                      key={c.id}
                      className="calendar-event"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditCourse(c)
                        setModalOpen(true)
                      }}
                      title={`${c.start_time?.slice(0, 5)} ${c.name} - ${c.coach_name}`}
                    >
                      {c.start_time?.slice(0, 5)} {c.name}
                    </div>
                  ))}
                  {dayCourses.length > 3 && (
                    <div className="calendar-event" style={{ background: 'rgba(107,114,128,0.2)', color: '#888' }}>
                      +{dayCourses.length - 3} 更多
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  const renderDayView = () => {
    const hours = Array.from({ length: 14 }, (_, i) => i + 7)
    const dayCourses = getCoursesByDate(currentDate)
    return (
      <div className="day-view">
        <div className="day-view-hours">
          {hours.map(h => (
            <React.Fragment key={h}>
              <div className="day-view-hour-label">{h}:00</div>
              <div className="day-view-slot">
                {dayCourses
                  .filter(c => parseInt(c.start_time?.slice(0, 2)) === h)
                  .map(c => (
                    <div
                      key={c.id}
                      className="day-view-event"
                      onClick={() => { setEditCourse(c); setModalOpen(true) }}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="day-view-event-name">{c.name}</div>
                      <div className="day-view-event-meta">
                        {c.start_time?.slice(0, 5)} - {c.end_time?.slice(0, 5)} | {c.coach_name} | {c.location}
                      </div>
                    </div>
                  ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    )
  }

  const navigateDate = (delta) => {
    if (view === 'month') setCurrentDate(currentDate.add(delta, 'month'))
    else if (view === 'week') setCurrentDate(currentDate.add(delta, 'week'))
    else setCurrentDate(currentDate.add(delta, 'day'))
  }

  const formatTitle = () => {
    if (view === 'month') return currentDate.format('YYYY年 M月')
    if (view === 'week') {
      const start = currentDate.startOf('week')
      const end = currentDate.endOf('week')
      return `${start.format('YYYY/M/D')} - ${end.format('M/D')}`
    }
    return currentDate.format('YYYY年 M月 D日')
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 600 }}>
      <div className="calendar-header">
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={() => navigateDate(-1)}>‹</button>
          <button className="calendar-nav-btn" onClick={() => setCurrentDate(dayjs())}>今天</button>
          <button className="calendar-nav-btn" onClick={() => navigateDate(1)}>›</button>
          <h2 className="calendar-title">{formatTitle()}</h2>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="calendar-views">
            {[
              { k: 'month', label: '月' },
              { k: 'week', label: '周' },
              { k: 'day', label: '日' }
            ].map(v => (
              <button
                key={v.k}
                className={`calendar-view-btn ${view === v.k ? 'active' : ''}`}
                onClick={() => setView(v.k)}
              >
                {v.label}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary"
            onClick={() => { setEditCourse(null); setSelectedDate(currentDate); setModalOpen(true) }}
          >
            ➕ 新增课程
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#666' }}>加载中...</div>
      ) : view === 'day' ? (
        renderDayView()
      ) : (
        <div className="calendar" style={{ flex: 1 }}>
          {renderMonthView()}
        </div>
      )}

      {modalOpen && (
        <CourseModal
          course={editCourse}
          coaches={coaches}
          onClose={() => { setModalOpen(false); setEditCourse(null) }}
          onSave={handleSave}
        />
      )}

      {selectedDate && !editCourse && modalOpen && null}
    </div>
  )
}
