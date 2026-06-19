from datetime import datetime, date, timedelta
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from config import Config
from models import db, User, Member, Coach, Course

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, supports_credentials=True)
jwt = JWTManager(app)
db.init_app(app)


def init_db():
    with app.app_context():
        db.drop_all()
        db.create_all()

        admin = User(username='admin', role='admin')
        admin.set_password('admin123')
        db.session.add(admin)

        sample_coaches = [
            Coach(name='张教练', gender='男', phone='13800138001', specialty='力量训练', experience_years=5, status='active'),
            Coach(name='李教练', gender='女', phone='13800138002', specialty='瑜伽', experience_years=3, status='active'),
            Coach(name='王教练', gender='男', phone='13800138003', specialty='有氧训练', experience_years=7, status='active'),
            Coach(name='陈教练', gender='女', phone='13800138004', specialty='普拉提', experience_years=4, status='active'),
        ]
        db.session.add_all(sample_coaches)
        db.session.flush()

        membership_types = ['monthly', 'quarterly', 'yearly']
        genders = ['男', '女']
        statuses = ['active', 'inactive', 'expired']
        sample_members = []
        for i in range(35):
            days_offset = (i * 3) % 180
            start_date = date.today() - timedelta(days=days_offset)
            mtype = membership_types[i % 3]
            if mtype == 'monthly':
                end_date = start_date + timedelta(days=30)
            elif mtype == 'quarterly':
                end_date = start_date + timedelta(days=90)
            else:
                end_date = start_date + timedelta(days=365)
            sample_members.append(Member(
                name=f'会员{i+1:02d}',
                gender=genders[i % 2],
                phone=f'139{10000000+i:08d}',
                email=f'member{i+1}@gym.com',
                birthday=date(1990 + (i % 20), (i % 12) + 1, (i % 28) + 1),
                membership_type=mtype,
                membership_start=start_date,
                membership_end=end_date,
                total_visits=(i * 7) % 120,
                last_visit=datetime.now() - timedelta(days=(i % 14)),
                status=statuses[i % 3],
                notes=f'这是会员{i+1}的备注信息，包含健康状况和训练偏好等内容。'
            ))
        db.session.add_all(sample_members)

        sample_courses = []
        course_names = ['力量训练', '瑜伽放松', '动感单车', '普拉提', '有氧搏击', 'HIIT训练', '拉伸放松']
        locations = ['1号训练厅', '2号训练厅', '瑜伽室', '单车房', '私教区']
        for i in range(20):
            course_date = date.today() + timedelta(days=(i - 5))
            start_hour = 8 + (i % 11)
            sample_courses.append(Course(
                name=course_names[i % len(course_names)],
                description=f'专业的{course_names[i % len(course_names)]}课程，由资深教练带队。',
                coach_id=sample_coaches[i % 4].id,
                duration_minutes=60,
                capacity=15 + (i % 10),
                course_date=course_date,
                start_time=datetime.strptime(f'{start_hour:02d}:00', '%H:%M').time(),
                end_time=datetime.strptime(f'{start_hour+1:02d}:00', '%H:%M').time(),
                location=locations[i % len(locations)],
                status='scheduled' if course_date >= date.today() else 'completed'
            ))
        db.session.add_all(sample_courses)
        db.session.commit()
        print('Database initialized with sample data.')


@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'username' not in data or 'password' not in data:
        return jsonify({'message': '请输入用户名和密码'}), 400
    user = User.query.filter_by(username=data['username']).first()
    if not user or not user.check_password(data['password']):
        return jsonify({'message': '用户名或密码错误'}), 401
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200


@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': '用户不存在'}), 404
    return jsonify(user.to_dict()), 200


@app.route('/api/members', methods=['GET'])
@jwt_required()
def get_members():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    search = request.args.get('search', '')
    status = request.args.get('status', '')
    membership_type = request.args.get('membership_type', '')
    gender = request.args.get('gender', '')

    query = Member.query
    if search:
        query = query.filter(
            (Member.name.contains(search)) |
            (Member.phone.contains(search)) |
            (Member.email.contains(search))
        )
    if status:
        query = query.filter(Member.status == status)
    if membership_type:
        query = query.filter(Member.membership_type == membership_type)
    if gender:
        query = query.filter(Member.gender == gender)

    query = query.order_by(Member.created_at.desc())
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'items': [m.to_dict() for m in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    }), 200


@app.route('/api/members/<int:member_id>', methods=['GET'])
@jwt_required()
def get_member(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'message': '会员不存在'}), 404
    return jsonify(member.to_dict(detailed=True)), 200


@app.route('/api/members', methods=['POST'])
@jwt_required()
def create_member():
    data = request.get_json()
    member = Member(
        name=data.get('name'),
        gender=data.get('gender'),
        phone=data.get('phone'),
        email=data.get('email'),
        birthday=datetime.strptime(data['birthday'], '%Y-%m-%d').date() if data.get('birthday') else None,
        membership_type=data.get('membership_type', 'monthly'),
        membership_start=datetime.strptime(data['membership_start'], '%Y-%m-%d').date() if data.get('membership_start') else date.today(),
        membership_end=datetime.strptime(data['membership_end'], '%Y-%m-%d').date() if data.get('membership_end') else None,
        status=data.get('status', 'active'),
        notes=data.get('notes', '')
    )
    db.session.add(member)
    db.session.commit()
    return jsonify(member.to_dict(detailed=True)), 201


@app.route('/api/members/<int:member_id>', methods=['PUT'])
@jwt_required()
def update_member(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'message': '会员不存在'}), 404
    data = request.get_json()
    if 'name' in data: member.name = data['name']
    if 'gender' in data: member.gender = data['gender']
    if 'phone' in data: member.phone = data['phone']
    if 'email' in data: member.email = data['email']
    if 'birthday' in data: member.birthday = datetime.strptime(data['birthday'], '%Y-%m-%d').date()
    if 'membership_type' in data: member.membership_type = data['membership_type']
    if 'membership_start' in data: member.membership_start = datetime.strptime(data['membership_start'], '%Y-%m-%d').date()
    if 'membership_end' in data: member.membership_end = datetime.strptime(data['membership_end'], '%Y-%m-%d').date()
    if 'status' in data: member.status = data['status']
    if 'notes' in data: member.notes = data['notes']
    db.session.commit()
    return jsonify(member.to_dict(detailed=True)), 200


@app.route('/api/members/<int:member_id>', methods=['DELETE'])
@jwt_required()
def delete_member(member_id):
    member = Member.query.get(member_id)
    if not member:
        return jsonify({'message': '会员不存在'}), 404
    db.session.delete(member)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200


@app.route('/api/coaches', methods=['GET'])
@jwt_required()
def get_coaches():
    status = request.args.get('status', '')
    query = Coach.query
    if status:
        query = query.filter(Coach.status == status)
    coaches = query.order_by(Coach.created_at.desc()).all()
    return jsonify([c.to_dict() for c in coaches]), 200


@app.route('/api/coaches/<int:coach_id>', methods=['GET'])
@jwt_required()
def get_coach(coach_id):
    coach = Coach.query.get(coach_id)
    if not coach:
        return jsonify({'message': '教练不存在'}), 404
    return jsonify(coach.to_dict()), 200


@app.route('/api/coaches', methods=['POST'])
@jwt_required()
def create_coach():
    data = request.get_json()
    coach = Coach(
        name=data.get('name'),
        gender=data.get('gender'),
        phone=data.get('phone'),
        specialty=data.get('specialty'),
        experience_years=data.get('experience_years', 0),
        status=data.get('status', 'active')
    )
    db.session.add(coach)
    db.session.commit()
    return jsonify(coach.to_dict()), 201


@app.route('/api/coaches/<int:coach_id>', methods=['PUT'])
@jwt_required()
def update_coach(coach_id):
    coach = Coach.query.get(coach_id)
    if not coach:
        return jsonify({'message': '教练不存在'}), 404
    data = request.get_json()
    if 'name' in data: coach.name = data['name']
    if 'gender' in data: coach.gender = data['gender']
    if 'phone' in data: coach.phone = data['phone']
    if 'specialty' in data: coach.specialty = data['specialty']
    if 'experience_years' in data: coach.experience_years = data['experience_years']
    if 'status' in data: coach.status = data['status']
    db.session.commit()
    return jsonify(coach.to_dict()), 200


@app.route('/api/coaches/<int:coach_id>', methods=['DELETE'])
@jwt_required()
def delete_coach(coach_id):
    coach = Coach.query.get(coach_id)
    if not coach:
        return jsonify({'message': '教练不存在'}), 404
    db.session.delete(coach)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200


@app.route('/api/courses', methods=['GET'])
@jwt_required()
def get_courses():
    start_date = request.args.get('start_date', '')
    end_date = request.args.get('end_date', '')
    coach_id = request.args.get('coach_id', type=int)
    status = request.args.get('status', '')

    query = Course.query
    if start_date:
        query = query.filter(Course.course_date >= datetime.strptime(start_date, '%Y-%m-%d').date())
    if end_date:
        query = query.filter(Course.course_date <= datetime.strptime(end_date, '%Y-%m-%d').date())
    if coach_id:
        query = query.filter(Course.coach_id == coach_id)
    if status:
        query = query.filter(Course.status == status)

    courses = query.order_by(Course.course_date.asc(), Course.start_time.asc()).all()
    return jsonify([c.to_dict() for c in courses]), 200


@app.route('/api/courses/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'message': '课程不存在'}), 404
    return jsonify(course.to_dict()), 200


@app.route('/api/courses', methods=['POST'])
@jwt_required()
def create_course():
    data = request.get_json()
    course = Course(
        name=data.get('name'),
        description=data.get('description', ''),
        coach_id=data.get('coach_id'),
        duration_minutes=data.get('duration_minutes', 60),
        capacity=data.get('capacity', 20),
        course_date=datetime.strptime(data['course_date'], '%Y-%m-%d').date(),
        start_time=datetime.strptime(data['start_time'], '%H:%M').time(),
        end_time=datetime.strptime(data['end_time'], '%H:%M').time(),
        location=data.get('location', ''),
        status=data.get('status', 'scheduled')
    )
    db.session.add(course)
    db.session.commit()
    return jsonify(course.to_dict()), 201


@app.route('/api/courses/<int:course_id>', methods=['PUT'])
@jwt_required()
def update_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'message': '课程不存在'}), 404
    data = request.get_json()
    if 'name' in data: course.name = data['name']
    if 'description' in data: course.description = data['description']
    if 'coach_id' in data: course.coach_id = data['coach_id']
    if 'duration_minutes' in data: course.duration_minutes = data['duration_minutes']
    if 'capacity' in data: course.capacity = data['capacity']
    if 'course_date' in data: course.course_date = datetime.strptime(data['course_date'], '%Y-%m-%d').date()
    if 'start_time' in data: course.start_time = datetime.strptime(data['start_time'], '%H:%M').time()
    if 'end_time' in data: course.end_time = datetime.strptime(data['end_time'], '%H:%M').time()
    if 'location' in data: course.location = data['location']
    if 'status' in data: course.status = data['status']
    db.session.commit()
    return jsonify(course.to_dict()), 200


@app.route('/api/courses/<int:course_id>', methods=['DELETE'])
@jwt_required()
def delete_course(course_id):
    course = Course.query.get(course_id)
    if not course:
        return jsonify({'message': '课程不存在'}), 404
    db.session.delete(course)
    db.session.commit()
    return jsonify({'message': '删除成功'}), 200


@app.route('/api/stats/summary', methods=['GET'])
@jwt_required()
def get_stats_summary():
    total_members = Member.query.count()
    active_members = Member.query.filter_by(status='active').count()
    total_coaches = Coach.query.filter_by(status='active').count()
    today = date.today()
    today_courses = Course.query.filter_by(course_date=today).count()
    upcoming_courses = Course.query.filter(Course.course_date >= today, Course.status == 'scheduled').count()
    total_visits = db.session.query(db.func.sum(Member.total_visits)).scalar() or 0
    expired_members = Member.query.filter_by(status='expired').count()

    return jsonify({
        'total_members': total_members,
        'active_members': active_members,
        'expired_members': expired_members,
        'total_coaches': total_coaches,
        'today_courses': today_courses,
        'upcoming_courses': upcoming_courses,
        'total_visits': total_visits
    }), 200


@app.route('/api/stats/membership-trend', methods=['GET'])
@jwt_required()
def get_membership_trend():
    days = request.args.get('days', 30, type=int)
    trend_data = []
    for i in range(days - 1, -1, -1):
        d = date.today() - timedelta(days=i)
        count = Member.query.filter(Member.membership_start <= d).count()
        trend_data.append({
            'date': d.isoformat(),
            'count': count,
            'new_count': Member.query.filter(Member.membership_start == d).count()
        })
    return jsonify(trend_data), 200


@app.route('/api/stats/membership-type', methods=['GET'])
@jwt_required()
def get_membership_type_stats():
    result = db.session.query(
        Member.membership_type,
        db.func.count(Member.id)
    ).group_by(Member.membership_type).all()
    type_map = {'monthly': '月卡', 'quarterly': '季卡', 'yearly': '年卡'}
    data = []
    for mtype, count in result:
        data.append({
            'type': type_map.get(mtype, mtype),
            'key': mtype,
            'count': count
        })
    return jsonify(data), 200


if __name__ == '__main__':
    import os
    db_path = os.path.join(os.path.dirname(__file__), 'instance', 'gym.db')
    if not os.path.exists(db_path):
        print('Initializing database...')
        init_db()
    app.run(host='0.0.0.0', port=5000, debug=True)
