from flask import Blueprint, request, jsonify
import os
from config import get_db
from sentence_transformers import SentenceTransformer

from utils.tests.clear_generated_tests import clear_generated_tests
from utils.tests.get_user_data import get_user_data
from utils.tests.validate_course import validate_course
from utils.tests.generate_test_file import generate_test_file
from utils.tests.get_content_path import get_content_path
from utils.tests.process_csv import process_csv

model = SentenceTransformer('all-MiniLM-L6-v2')
temp_start_bp = Blueprint('temp_start_bp', __name__)
csv_generation_bp = Blueprint('csv_generation_bp', __name__)
db = get_db()


@temp_start_bp.route('/temp_start_bp', methods=['POST'])
def start_test():
    clear_generated_tests()
    data = request.json
    email = data.get('email')
    chapter_ = data.get('chapter_')

    if not email or not chapter_:
        return jsonify({"error": "Missing email or chapter"}), 400

    email = email.strip()

    try:
        user_doc = get_user_data(email)
        if not user_doc:
            return jsonify({"error": "User not found"}), 404

        course = validate_course(user_doc)
        if not course:
            return jsonify({"error": "No course found for user"}), 404

        rank = user_doc.get("rank")
        print(f"Normalized course name: {course}")

        content_path = get_content_path(course)
        print(f"Looking for content at: {os.path.abspath(content_path)}")

        if not os.path.exists(content_path):
            available_courses = os.listdir(os.path.join(os.path.dirname(content_path), '..', 'content'))
            return jsonify({
                "error": f"Course directory not found. Your course: '{course}'. Available courses: {', '.join(available_courses)}"
            }), 404

        filename, _ = generate_test_file(chapter_, course)

        return jsonify({
            "success": True,
            "message": "Test questions generated successfully",
            "file": filename,
            "rank": rank,
            "chapter": chapter_
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500


@csv_generation_bp.route('/generate_csv', methods=['POST'])
def generate_csv():
    data = request.json
    chapter_ = data.get('chapter_')

    if not chapter_:
        return jsonify({"error": "Missing chapter"}), 400

    try:
        output_file, df = process_csv(chapter_)
        if not output_file:
            return jsonify({"error": f"Test file not found"}), 404

        return jsonify({
            "success": True,
            "message": "CSV generated successfully",
            "csv_file": output_file,
            "question_count": len(df)
        }), 200

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500