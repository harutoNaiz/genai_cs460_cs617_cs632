from flask import Blueprint, request, jsonify
import os
from utils import extract_number, get_stripped_name
from config import get_db
import subprocess

summarize_bp = Blueprint('summarize', __name__)
db = get_db()

@summarize_bp.route('/get-topic-content', methods=['POST'])
def get_topic_content():
    data = request.json
    email = data.get('email')
    chapter_name = data.get('chapterName')
    topic_name = data.get('topicName')
    # topic_name = data.get('topicName')
    topic_name = topic_name + ".txt"
    
    if not all([email, chapter_name, topic_name]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    email = email.strip()
    
    try:
        # 1. Query Firestore to find the user by email
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).get()

        if not query:
            return jsonify({"error": "User not found"}), 404
            
        user_doc = query[0].to_dict()
        course = user_doc.get('course')
        
        if not course:
            return jsonify({"error": "No course found for user"}), 404
        
        # 2. Build the path to the specific topic file
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        course_path = os.path.join(current_dir, '..', 'content/core', course) 
        
        # Find the chapter directory that matches the chapter name
        chapter_path = os.path.join(course_path, chapter_name)
        topic_path = os.path.join(chapter_path, topic_name)
        
        with open(topic_path, 'r', encoding='utf-8') as file:
            topic_content = file.read()

        return jsonify({
            "topicContent": topic_content,
            "enhancedContent": topic_content,
            "courseTitle": course,
            "chapterTitle": chapter_name,
            "topicTitle": topic_name
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Print full traceback for debugging
        return jsonify({"error": str(e)}), 500
    
@summarize_bp.route('/summarize-content', methods=['POST'])
def summarize_content():
    data = request.json
    content = data.get('content')
    
    if not content:
        return jsonify({"error": "Missing content to summarize"}), 400
    
    try:
        # Use Ollama to generate a summary
        model_name = "deepseek-r1:1.5b"  # Use the same model as before
        prompt = f"""
        Summarize the following text concisely while retaining the key points:
        
        {content}
        
        Provide a summary that:
        1. Covers the main concepts
        2. Is approximately 25% of the original length
        3. Maintains clarity and educational value
        """

        # Run Ollama command using subprocess
        command = ["ollama", "run", model_name, prompt]
        result = subprocess.run(command, capture_output=True, text=True)

        if result.returncode != 0:
            return jsonify({"error": "Ollama failed to generate summary", "details": result.stderr}), 500
        
        summary = result.stdout.strip()

        return jsonify({
            "summary": summary
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500