from flask import Blueprint, request, jsonify, send_from_directory
import os

serve_bp = Blueprint('serve', __name__)

@serve_bp.route('/serve', methods=['GET'])
def serve():
    filename = request.args.get('filename')
    print(f"Received request for file: {filename}")

    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    generated_test_path = os.path.join(current_dir,'generated_tests')
    file_path = os.path.join(generated_test_path, filename)

    print(f"Looking for file at: {file_path}")
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404
    try:
        return send_from_directory(generated_test_path, filename)
    except Exception as e:
        print(f"Error serving file: {str(e)}")
        return jsonify({"error": str(e)}), 500