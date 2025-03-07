from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os

app = Flask(__name__)
CORS(app)

# Initialize Firebase Admin SDK
cred = credentials.Certificate("Credentials.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400
    try:
        db.collection('users').add({
            'name': name,
            'email': email,
            'password': password,
            'createdAt': firestore.SERVER_TIMESTAMP
        })
        return jsonify({"message": "User signed up successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/update-details', methods=['POST'])
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
        for doc in docs:
            doc.reference.update({
                'course': course,
                'dob': dob
            })
        return jsonify({"message": "User details updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    if not all([email, password]):
        return jsonify({"success": False, "message": "Missing required fields"}), 400
    try:
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).where('password', '==', password).get()
        if query:
            user = query[0].to_dict()
            return jsonify({"success": True, "user": {"name": user["name"], "email": user["email"]}}), 200
        else:
            return jsonify({"success": False, "message": "Invalid email or password"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
