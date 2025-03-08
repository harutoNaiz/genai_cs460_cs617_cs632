from flask import Blueprint, request, jsonify
from config import get_db

user_bp = Blueprint('user', __name__)
db = get_db()

@user_bp.route('/update-details', methods=['POST'])
def update_details():
    data = request.json
    email = data.get('email')
    course = data.get('course')
    dob = data.get('dob')
    
    if not all([email, course, dob]):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).limit(1)
        docs = query.stream()
        
        user_found = False
        for doc in docs:
            user_found = True
            doc.reference.update({
                'course': course,
                'dob': dob
            })
        
        if not user_found:
            return jsonify({"error": "User not found"}), 404
            
        return jsonify({"message": "User details updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500