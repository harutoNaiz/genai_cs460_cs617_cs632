from flask import Blueprint, request, jsonify, send_from_directory
import os

serve_bp = Blueprint('serve', __name__)

@serve_bp.route('/serve', methods=['GET'])
def serve():
    filename = request.args.get('filename')
    print(f"Received request for file: {filename}")
    file_path = os.path.join('/home/pes2ug22cs632/gen_ai/backend/generated_tests', filename)
    print(f"Looking for file at: {file_path}")
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404
    try:
        return send_from_directory('/home/pes2ug22cs632/gen_ai/backend/generated_tests', filename)
    except Exception as e:
        print(f"Error serving file: {str(e)}")
        return jsonify({"error": str(e)}), 500