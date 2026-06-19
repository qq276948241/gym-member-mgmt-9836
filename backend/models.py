from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='admin')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat()
        }

class Coach(db.Model):
    __tablename__ = 'coaches'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    gender = db.Column(db.String(10))
    phone = db.Column(db.String(20))
    specialty = db.Column(db.String(120))
    experience_years = db.Column(db.Integer, default=0)
    avatar = db.Column(db.String(255))
    status = db.Column(db.String(20), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    courses = db.relationship('Course', backref='coach', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'gender': self.gender,
            'phone': self.phone,
            'specialty': self.specialty,
            'experience_years': self.experience_years,
            'avatar': self.avatar,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

class Member(db.Model):
    __tablename__ = 'members'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    gender = db.Column(db.String(10))
    phone = db.Column(db.String(20))
    email = db.Column(db.String(120))
    birthday = db.Column(db.Date)
    avatar = db.Column(db.String(255))
    membership_type = db.Column(db.String(50), default='monthly')
    membership_start = db.Column(db.Date)
    membership_end = db.Column(db.Date)
    total_visits = db.Column(db.Integer, default=0)
    last_visit = db.Column(db.DateTime)
    status = db.Column(db.String(20), default='active')
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self, detailed=False):
        data = {
            'id': self.id,
            'name': self.name,
            'gender': self.gender,
            'phone': self.phone,
            'email': self.email,
            'birthday': self.birthday.isoformat() if self.birthday else None,
            'avatar': self.avatar,
            'membership_type': self.membership_type,
            'membership_start': self.membership_start.isoformat() if self.membership_start else None,
            'membership_end': self.membership_end.isoformat() if self.membership_end else None,
            'total_visits': self.total_visits,
            'last_visit': self.last_visit.isoformat() if self.last_visit else None,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
        if detailed:
            data['notes'] = self.notes
        return data

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text)
    coach_id = db.Column(db.Integer, db.ForeignKey('coaches.id'))
    duration_minutes = db.Column(db.Integer, default=60)
    capacity = db.Column(db.Integer, default=20)
    course_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    location = db.Column(db.String(100))
    status = db.Column(db.String(20), default='scheduled')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'coach_id': self.coach_id,
            'coach_name': self.coach.name if self.coach else None,
            'duration_minutes': self.duration_minutes,
            'capacity': self.capacity,
            'course_date': self.course_date.isoformat(),
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'location': self.location,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }
