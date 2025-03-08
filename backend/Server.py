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

@app.route('/get-chapters', methods=['POST'])
def get_chapters():
    data = request.json
    email = data.get('email')
    email = email.strip()
    if not email:
        return jsonify({"error": "Missing email"}), 400

    # 1. Find the user in Firestore to get the 'course'
    try:
         # 1. Query Firestore to find the user by email
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).get()

        # 2. Check if we got a document back
        if query:
            user_doc = query[0].to_dict()
            course = user_doc.get('course')
            print(course)
            if not course:
                return jsonify({"error": "No course found for user"}), 404
        else:
            return jsonify({"error": "User not found"}), 404

        # 2. Build the path to the content/<course> directory
        #    This assumes 'content' is a sibling directory to 'backend'.
        content_path = os.path.join(os.path.dirname(__file__), '..', 'content', course)

        if not os.path.exists(content_path):
            return jsonify({"error": f"Course directory '{course}' does not exist"}), 404

        # 3. Gather chapters and topics
        chapters = []
        for chapter_name in os.listdir(content_path):
            chapter_path = os.path.join(content_path, chapter_name)
            if os.path.isdir(chapter_path):
                topics = []
                for file_name in os.listdir(chapter_path):
                    file_path = os.path.join(chapter_path, file_name)
                    if os.path.isfile(file_path):
                        topics.append(file_name)
                chapters.append({
                    "chapterName": chapter_name,
                    "topics": topics
                })

        return jsonify({"chapters": chapters}), 200

    except StopIteration:
        return jsonify({"error": "User not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)
