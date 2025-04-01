from flask import Blueprint, request, jsonify
from config import get_db

profile_bp = Blueprint('profile', __name__)
db = get_db()

@profile_bp.route('/update-details', methods=['POST'])
def update_details():
    data = request.json
    email = data.get('email')
    course = data.get('course')
    dob = data.get('dob')

    if not all([email, course, dob]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        user_ref = db.collection('users').document(email)
        user_ref.update({
            'course': course,
            'dob': dob
        })
        return jsonify({"message": "User details updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@profile_bp.route('/get-user-data', methods=['GET'])
def get_user_data():
    email = request.args.get('email')
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    try:
        user_ref = db.collection('users').document(email)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return jsonify({"error": "User not found"}), 404
            
        user_data = user_doc.to_dict()
        
        # Don't return password hash
        if 'password' in user_data:
            del user_data['password']
            
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500