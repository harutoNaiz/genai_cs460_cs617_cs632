from flask import Blueprint, request, jsonify
from config import get_db
from groq import Groq
import os
import traceback

summarize_bp = Blueprint('summarize', __name__)
db = get_db()
client = Groq(api_key="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")

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

def generate_enhanced_content(topic, chapter_name, weak_topics=None):
    is_weak_topic = any(t['topic'] == topic for t in (weak_topics or []))
    
    prompt = f"""
    Generate comprehensive educational content about {topic} under {chapter_name}. atleast 2000 words
    
    Requirements:
    1. Format the content with clear markdown formatting (headers, lists, code blocks)
    2. Include practical examples and code snippets where applicable
    3. Explain concepts clearly with analogies if helpful
    4. Structure the content for optimal learning
    5. also while adding points make sure not to highlight them to avoid (**)
    
    """
    
    if is_weak_topic:
        prompt += """
        SPECIAL INSTRUCTIONS (USER STRUGGLES WITH THIS TOPIC):
        - Provide extra detailed explanations
        - Include more examples and analogies
        - Break down complex concepts into simpler parts
        - Add visual descriptions where helpful
        - Include common pitfalls and how to avoid them
        """
    else:
        prompt += """
        GENERAL INSTRUCTIONS:
        - Provide a balanced overview of the topic
        - Include key concepts and applications
        - Add practical examples where relevant
        """
    
    prompt += """
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
    
    ## Examples please add this as a code block 
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
            messages=[{"role": "user", "content": prompt}],
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
        
        # Generate enhanced content
        enhanced_content = generate_enhanced_content(topic_name, chapter_name, weak_topics)
        
        if not enhanced_content:
            return jsonify({"error": "Failed to generate content"}), 500
            
        # Get course from user data
        user_ref = db.collection('users').document(email)
        user_doc = user_ref.get()
        course = user_doc.to_dict().get('course', 'Unknown Course')
        
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