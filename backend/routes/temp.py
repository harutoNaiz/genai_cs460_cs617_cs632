from flask import Blueprint, request, jsonify
import os
from utils import extract_number, get_stripped_name
from config import get_db
from groq import Groq

temp_start_bp = Blueprint('temp_start_bp', __name__)
db = get_db()

def generate_questions(topic, subtopic, model="llama3-70b-8192"):
    prompt = (f"Generate 5 multiple choice questions on {topic} under {subtopic}. "
              "Each question should have 4 options (a, b, c, d) with one correct answer. "
              "Go from easy to very hard. Format as follows:\n\n"

              "<question>\n"
              "a.<option1>\n"
              "b.<option2>\n"
              "c.<option3>\n"
              "d.<option4>\n\n"
              "<correct option>\n"
              "<subtopic>\n"
              "<what in that subtopic exactly>\n"
              "<a flag for difficulty (e,m,h)(easy medium hard)>\n"
              "<####>"
              "\n\n"
              "for example the structure of out put must look exactly as follows permitting no variation:\n" 
              " **Question 1**\n"
              "What is the primary advantage of using Bubble Sort?\n"
                    "a. It is the fastest sorting algorithm.\n"
                    "b. It is easy to implement.\n"
                    "c. It uses the least amount of memory.\n"
                    "d. It is used for large datasets.\n\n"

                    "**Correct answer: b. It is easy to implement.**\n"
                    "**Subtopic: Bubble Sort**\n"
                    "**What in that subtopic exactly: Characteristics of Bubble Sort**\n"
                    "**Difficulty: e**"
              
              )
    
    client = Groq(api_key="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")
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
        temperature=1.2
    )
    return response.choices[0].message.content

@temp_start_bp.route('/temp_start_bp', methods=['POST'])
def start_test():
    data = request.json
    email = data.get('email')
    chapter_ = data.get('chapter_')
    
    if not email or not chapter_:
        return jsonify({"error": "Missing email or chapter"}), 400
    
    email = email.strip()
    
    try:
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).get()

        if not query:
            return jsonify({"error": "User not found"}), 404
            
        user_doc = query[0].to_dict()
        course = user_doc.get('course')
        rank = user_doc.get("rank")
        
        if not course:
            return jsonify({"error": "No course found for user"}), 404

        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        content_path = os.path.join(current_dir, '..', 'content/sort', course)
        
        if not os.path.exists(content_path):
            return jsonify({"error": f"Course directory '{course}' does not exist"}), 404

        questions_text = ""
        for chapter_name in sorted(os.listdir(content_path), key=extract_number):
            chapter_path = os.path.join(content_path, chapter_name)
            
            if os.path.isdir(chapter_path) and extract_number(chapter_name) == int(chapter_):
                topics = sorted(
                    [file for file in os.listdir(chapter_path) 
                     if os.path.isfile(os.path.join(chapter_path, file))],
                    key=extract_number
                )

                for topic in topics:
                    topic_name = get_stripped_name(topic)
                    questions = generate_questions(chapter_name, topic_name)
                    questions_text += questions + "\n"

        output_file1 = os.path.join(current_dir, "generated_tests")
        # output_file = os.path.join(output_file1, "generated_test_{chapter_}.txt")
        output_file = os.path.join(output_file1, f"generated_test_{chapter_}.txt")
        with open(output_file, "w", encoding="utf-8") as f:
            f.write(questions_text)

        return jsonify({"success": True, "message": "OK", "file": output_file, "rank": rank}), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500
