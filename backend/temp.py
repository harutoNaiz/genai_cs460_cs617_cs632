from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import faiss
import pickle
import os
import numpy as np
from pathlib import Path
import glob
import PyPDF2

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
def setup_gemini():
    genai.configure(api_key=GEMINI_API_KEY)
    return genai.GenerativeModel('gemini-pro')

def load_data():
    TEMP_DIR = "temp_data"  # Update this path as needed
    index = faiss.read_index(os.path.join(TEMP_DIR, "faiss_index.bin"))
    with open(os.path.join(TEMP_DIR, "texts.pkl"), "rb") as f:
        texts = pickle.load(f)
    return index, texts

def reconstruct_document(chunks):
    if not chunks:
        return ""
    return "\n".join(chunks)

def load_files_from_directory(directory_path):

    files_content = {}
    
    if not os.path.exists(directory_path):
        raise ValueError(f"Directory not found: {directory_path}")

    # Handle PDF files
    for pdf_path in glob.glob(os.path.join(directory_path, "*.pdf")):
        filename = os.path.basename(pdf_path)
        try:
            pdf_reader = PyPDF2.PdfReader(pdf_path)
            text = ""
            for page in pdf_reader.pages:
                extracted_text = page.extract_text()
                if extracted_text:
                    text += extracted_text + "\n"
            files_content[filename] = text.strip()
        except Exception as e:
            print(f"Error reading PDF {filename}: {e}")

    # Handle text files
    for text_path in glob.glob(os.path.join(directory_path, "*.txt")):
        filename = os.path.basename(text_path)
        try:
            with open(text_path, 'r', encoding='utf-8') as f:
                files_content[filename] = f.read().strip()
        except Exception as e:
            print(f"Error reading text file {filename}: {e}")

    return files_content

def process_content(reference_content, files_content, tasks, model):
 
    results = {}
    
    for filename, content in files_content.items():
        # Generate task-specific response
        task_prompt = f"""
        Tasks to perform: {tasks}
        Reference content: {reference_content}
        Content to process: {content}
        
        Analyze the content based on the specified tasks and provide detailed results.
        """
        
        try:
            response = model.generate_content(task_prompt)
            results[filename] = {
                'status': 'success',
                'analysis': response.text
            }
        except Exception as e:
            results[filename] = {
                'status': 'error',
                'error': str(e)
            }
    
    return results

@app.route('/build-agent', methods=['POST'])
def build_agent():
    try:
        data = request.json
        tasks = data.get('tasks')
        directory = data.get('directory')
        user_email = data.get('userEmail')
        llm_id = data.get('llmId')

        if not tasks:
            return jsonify({'error': 'Tasks description is required'}), 400

        # Setup AI model
        model = setup_gemini()
        
        # Load reference data
        reference_content = reconstruct_document(load_data()[1])
        
        # Process directory if provided
        files_content = {}
        if directory and directory.strip():
            try:
                files_content = load_files_from_directory(directory)
                if not files_content:
                    return jsonify({'error': 'No compatible files found in the specified directory'}), 400
            except ValueError as e:
                return jsonify({'error': str(e)}), 400
            except Exception as e:
                return jsonify({'error': f'Error processing directory: {str(e)}'}), 500

        # Process content
        results = process_content(reference_content, files_content, tasks, model)
        
        # Save results (you can modify this based on your needs)
        output_dir = os.path.join('outputs', user_email, llm_id)
        os.makedirs(output_dir, exist_ok=True)
        
        output_path = os.path.join(output_dir, 'analysis_results.txt')
        with open(output_path, 'w', encoding='utf-8') as f:
            for filename, result in results.items():
                f.write(f"\n\nFile: {filename}\n")
                f.write("="*50 + "\n")
                if result['status'] == 'success':
                    f.write(result['analysis'])
                else:
                    f.write(f"Error: {result['error']}")

        return jsonify({
            'status': 'success',
            'message': 'Agent built successfully',
            'results': results,
            'output_path': output_path
        })

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001)
