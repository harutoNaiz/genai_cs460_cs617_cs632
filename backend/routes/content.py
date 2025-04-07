from flask import Blueprint, request, jsonify
import os
from utils import extract_number, get_stripped_name
from config import get_db
import google.generativeai as genai

content_bp = Blueprint('content', __name__)
db = get_db()

@content_bp.route('/get-chapters', methods=['POST'])
def get_chapters():
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({"error": "Missing email"}), 400
    
    email = email.strip()
    
    try:
        # 1. Query Firestore to find the user by email
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).get()

        # 2. Check if we got a document back
        if not query:
            return jsonify({"error": "User not found"}), 404
            
        user_doc = query[0].to_dict()
        course = user_doc.get('course')
        rank = user_doc.get("rank")
        
        if not course:
            return jsonify({"error": "No course found for user"}), 404

        # 3. Build the path to the content/<course> directory
        # Fix the path resolution to correctly find the content directory
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        content_path = os.path.join(current_dir, '..', 'content', course)
        
        print(f"Looking for content at: {content_path}")  # Debugging

        if not os.path.exists(content_path):
            return jsonify({"error": f"Course directory '{course}' does not exist"}), 404

        # 4. Gather chapters and topics
        chapters = []
        for chapter_name in sorted(os.listdir(content_path), key=extract_number):
            chapter_path = os.path.join(content_path, chapter_name)
            
            if os.path.isdir(chapter_path):
                topics = sorted(
                    [file for file in os.listdir(chapter_path) 
                     if os.path.isfile(os.path.join(chapter_path, file))],
                    key=extract_number
                )

                # Strip numeric prefix from chapter and topics
                chapter_rank = extract_number(chapter_name)
                stripped_chapter_name = get_stripped_name(chapter_name)
                stripped_topics = [get_stripped_name(topic) for topic in topics]

                chapters.append({
                    "chapter_" : chapter_rank,
                    "chapterName": stripped_chapter_name,
                    "topics": stripped_topics 
                })

        return jsonify({"chapters": chapters,"rank": rank}), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Print full traceback for debugging
        return jsonify({"error": str(e)}), 500