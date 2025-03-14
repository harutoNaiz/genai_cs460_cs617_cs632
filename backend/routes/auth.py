from flask import Blueprint, request, jsonify
from config import get_db
from firebase_admin import firestore
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__)
db = get_db()

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Check if user already exists
        user_ref = db.collection('users').document(email)
        if user_ref.get().exists:
            return jsonify({"error": "User already exists"}), 409
        
        hashed_password = generate_password_hash(password)  # Hash the password

        user_ref.set({
            'name': name,
            'email': email,
            'password': hashed_password,
            'createdAt': firestore.SERVER_TIMESTAMP
        })

        return jsonify({"message": "User signed up successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    try:
        user_ref = db.collection('users').document(email)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        user_data = user_doc.to_dict()
        if not check_password_hash(user_data['password'], password):
            return jsonify({"success": False, "message": "Invalid email or password"}), 401

        return jsonify({"success": True, "user": {"name": user_data["name"], "email": user_data["email"], "course": user_data["course"]}}), 200
    
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500
