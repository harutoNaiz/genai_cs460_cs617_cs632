from flask import Blueprint, request, jsonify
import os
from utils import extract_number, get_stripped_name
from config import get_db
import google.generativeai as genai

generate_bp = Blueprint('generate', __name__)
db = get_db()

@generate_bp.route('/get-topic-content', methods=['POST'])
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
            topic_content = topic_content[0:100]

        # 4. Use Gemini API to generate enhanced explanation
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        def setup_gemini():
            genai.configure(api_key=GEMINI_API_KEY)
            return genai.GenerativeModel('gemini-1.5-pro')
            
        model = setup_gemini()
        
        prompt = f"""
        You are an expert educational assistant. Given the following topic from a {course} course, 
        provide a detailed, clear, and engaging explanation for students.
        Chapter: {chapter_name}
        Topic: {topic_name}
        
        Content to enhance:
        {topic_content}
        
        Generate a comprehensive explanation that includes:
        1. A clear introduction to the topic
        2. Thorough explanation of key concepts
        3. Examples and applications where relevant
        4. Diagrams or illustrations (described in text)
        5. A summary of the main points
        
        Make the explanation educational, engaging, and easy to understand for students.
        """
        
        response = model.generate_content(prompt)
        enhanced_content = response.text
            
        return jsonify({
            "topicContent": topic_content,
            "enhancedContent": enhanced_content,
            "courseTitle": course,
            "chapterTitle": chapter_name,
            "topicTitle": topic_name
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())  # Print full traceback for debugging
        return jsonify({"error": str(e)}), 500