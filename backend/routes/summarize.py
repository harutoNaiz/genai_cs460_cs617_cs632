from flask import Blueprint, request, jsonify
from config import get_db
from groq import Groq
import os
import traceback
from dotenv import load_dotenv
from utils.regex.get_stripped_name import get_stripped_name
import faiss
from sentence_transformers import SentenceTransformer

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable not set")

summarize_bp = Blueprint('summarize', __name__)
db = get_db()
client = Groq(api_key=api_key)

# Initialize sentence transformer model for embeddings
model = SentenceTransformer('all-MiniLM-L6-v2')

def create_faiss_index(text_chunks):
    # Generate embeddings for text chunks
    embeddings = model.encode(text_chunks)
    dimension = embeddings.shape[1]
    
    # Create FAISS index
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    return index, embeddings

def search_relevant_chunks(query, index, text_chunks, embeddings, k=3):
    query_embedding = model.encode([query])
    distances, indices = index.search(query_embedding, k)
    
    relevant_chunks = [text_chunks[i] for i in indices[0]]
    return relevant_chunks

def get_topic_content_from_file(topic_path):
    try:
        with open(topic_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Split content into chunks (simple implementation)
        chunks = [chunk for chunk in content.split('\n\n') if chunk.strip()]
        return chunks
    except Exception as e:
        print(f"Error reading topic file: {e}")
        return None

def get_user_weak_topics(email, chapter_name):
    try:
        user_ref = db.collection('users').document(email)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            return None
            
        user_data = user_doc.to_dict()
        performance_data = user_data.get('performance_data', {})
        chapter_data = performance_data.get(str(chapter_name), {})
        
        return chapter_data.get('weak_topics', [])
        
    except Exception as e:
        print(f"Error fetching weak topics: {str(e)}")
        return None

def generate_enhanced_content(topic, chapter_name, weak_topics=None, topic_chunks=None):
    is_weak_topic = any(t['topic'] == topic for t in (weak_topics or []))
    
    base_prompt = f"""
    Generate comprehensive educational content about {topic} under {chapter_name}. atleast 2000 words
    
    Requirements:
    1. Format the content with clear markdown formatting (headers, lists)
    2. Include practical examples
    3. Explain concepts clearly with analogies if helpful
    4. Structure the content for optimal learning
    5. Use bold text with <strong>text</strong> tags instead of using ** for emphasis
    6. For code examples, always use proper markdown code blocks with triple backticks
    """
    
    # Add RAG context if available
    if topic_chunks:
        rag_context = "\n\nRelevant Context from Course Materials:\n"
        rag_context += "\n".join([f"- {chunk}" for chunk in topic_chunks[:3]])  # Use top 3 chunks
        base_prompt += rag_context
    
    if is_weak_topic:
        base_prompt += """
        SPECIAL INSTRUCTIONS (USER STRUGGLES WITH THIS TOPIC):
        - Provide extra detailed explanations
        - Include more examples and analogies
        - Break down complex concepts into simpler parts
        - Add visual descriptions where helpful
        - Include common pitfalls and how to avoid them
        """
    else:
        base_prompt += """
        GENERAL INSTRUCTIONS:
        - Provide a balanced overview of the topic
        - Include key concepts and applications
        - Add practical examples where relevant
        """
    
    base_prompt += """
    Output format:
    # Topic Title
    
    ## Overview
    [Brief introduction]
    
    ## Key Concepts
    - Concept 1 
    - Concept 2
    - Concept 3
    - Concept 4
    - Concept 5
    
    ## Examples 
    ```python
    # Practical code example
    def example():
        pass
    ```
    
    ## Summary
    [Concise summary]
    """
    
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": base_prompt}],
            temperature=0.7,
            max_tokens=4000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        return None
    
def generate_summary(content):
    prompt = f"""
    Create a concise summary of the following educational content:
    
    {content}
    
    Requirements:
    - Keep summary to about 20% of original length
    - Preserve key concepts and examples
    - Use clear, simple language
    - Include important code snippets if present
    
    Summary:
    """
    
    try:
        response = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
            max_tokens=1000
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        return None
    

def get_topic_path(chapter_name, topic_name, course):
    try:
        # Get the base directory of the current file
        current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        # Build path to the course content directory
        content_path = os.path.join(current_dir, '..', 'content', course)

        if not os.path.exists(content_path):
            raise FileNotFoundError(f"Course directory '{course}' does not exist")

        # Match the appropriate chapter directory by stripped name
        matched_chapter = None
        for dir_name in os.listdir(content_path):
            if os.path.isdir(os.path.join(content_path, dir_name)) and get_stripped_name(dir_name).lower() == chapter_name.lower():
                matched_chapter = dir_name
                break 

        if not matched_chapter:
            raise FileNotFoundError(f"Chapter '{chapter_name}' not found in course '{course}'")

        chapter_path = os.path.join(content_path, matched_chapter)

        # Match the topic file inside the chapter directory
        matched_topic = None
        for file_name in os.listdir(chapter_path):
            if os.path.isfile(os.path.join(chapter_path, file_name)) and get_stripped_name(file_name).lower() == topic_name.lower():
                matched_topic = file_name
                break

        if not matched_topic:
            raise FileNotFoundError(f"Topic '{topic_name}' not found in chapter '{chapter_name}'")

        topic_path = os.path.join(chapter_path, matched_topic)
        return topic_path

    except Exception as e:
        print(f"Error in get_topic_path: {e}")
        return None

@summarize_bp.route('/get-topic-content', methods=['POST'])
def get_topic_content():
    data = request.json
    email = data.get('email')
    chapter_name = data.get('chapterName')
    topic_name = data.get('topicName')
    
    if not all([email, chapter_name, topic_name]):
        return jsonify({"error": "Missing required parameters"}), 400
    
    try:
        # Get user's weak topics
        weak_topics = get_user_weak_topics(email, chapter_name)
        
        # Get course from user data
        user_ref = db.collection('users').document(email)
        user_doc = user_ref.get()
        course = user_doc.to_dict().get('course', 'Unknown Course')

        # Get the topic path and content
        topic_path = get_topic_path(chapter_name, topic_name, course)
        topic_chunks = None
        
        if topic_path:
            topic_chunks = get_topic_content_from_file(topic_path)
            if topic_chunks:
                # Create FAISS index and search for relevant chunks
                index, embeddings = create_faiss_index(topic_chunks)
                relevant_chunks = search_relevant_chunks(topic_name, index, topic_chunks, embeddings)
            else:
                relevant_chunks = None
        else:
            relevant_chunks = None
        
        # Generate enhanced content with RAG
        enhanced_content = generate_enhanced_content(
            topic_name, 
            chapter_name, 
            weak_topics,
            relevant_chunks
        )
        
        if not enhanced_content:
            return jsonify({"error": "Failed to generate content"}), 500
            
        return jsonify({
            "topicContent": enhanced_content,
            "enhancedContent": enhanced_content,
            "courseTitle": course,
            "chapterTitle": chapter_name,
            "topicTitle": topic_name,
            "isWeakTopic": any(t['topic'] == topic_name for t in (weak_topics or []))
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@summarize_bp.route('/summarize-content', methods=['POST'])
def summarize_content():
    data = request.json
    content = data.get('content')
    
    if not content:
        return jsonify({"error": "Missing content to summarize"}), 400
    
    try:
        summary = generate_summary(content)
        
        if not summary:
            return jsonify({"error": "Failed to generate summary"}), 500
            
        return jsonify({
            "summary": summary
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500