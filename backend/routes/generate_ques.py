from flask import Blueprint, request, jsonify, session
import time
from firebase_admin import firestore

test_bp = Blueprint('test_bp', __name__)
db = firestore.client()

@test_bp.route('/start_test', methods=['POST'])
def start_test(): 

    data = request.json
    email = data.get('email')
    chapter = data.get('chapter_')

    if not email or not chapter:
        return jsonify({"success": False, "message": "Missing email or chapter"}), 400

    try:
        # Open database connection
        user_ref = db.collection('users').document(email)
        user_doc = user_ref.get()

        print(email, chapter)

        if not user_doc.exists:
            return jsonify({"success": False, "message": "User not found"}), 404

        # Simulate delay
        time.sleep(5)

        return jsonify({"success": True, "message": "OK"}), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500