from flask import Blueprint, request, jsonify
from config import get_db

submit_test_bp = Blueprint('submit_test_bp', __name__)
db = get_db()

@submit_test_bp.route('/submit_test_results', methods=['POST'])
def submit_test_results():
    data = request.json
    
    if not data or not data.get('email') or not data.get('chapter'):
        return jsonify({"error": "Missing required data"}), 400
    
    email = data.get('email').strip()
    chapter = data.get('chapter')
    score = data.get('score', 0)
    percent_score = data.get('percentScore', 0)
    strong_topics = data.get('strongTopics', [])
    weak_topics = data.get('weakTopics', [])
    
    try:
        # Get user document
        users_ref = db.collection('users')
        query = users_ref.where('email', '==', email).get()
        
        if not query:
            return jsonify({"error": "User not found"}), 404
            
        user_doc = query[0]
        user_data = user_doc.to_dict()
        current_rank = user_data.get('rank', 1)
        
        # Check if performance_data exists, if not create it
        if 'performance_data' not in user_data:
            user_data['performance_data'] = {}
        
        # Update chapter data
        if chapter not in user_data['performance_data']:
            user_data['performance_data'][chapter] = {
                'chapter_number': int(chapter),
                'score': 0,
                'strong_topics': [],
                'weak_topics': []
            }
        
        # Update the score (store the best score)
        chapter_data = user_data['performance_data'][chapter]
        chapter_data['score'] = max(chapter_data['score'], score)
        
        # Update strong topics
        strong_topics_list = [topic for topic in strong_topics]
        chapter_data['strong_topics'] = strong_topics_list
        
        # Update weak topics
        weak_topics_list = [topic for topic in weak_topics]
        chapter_data['weak_topics'] = weak_topics_list
        
        # Check if we should increment rank
        should_increment_rank = (percent_score >= 80 and int(chapter) == current_rank)
        
        if should_increment_rank:
            user_data['rank'] = current_rank + 1
        
        # Update the user document
        user_doc.reference.update({
            'performance_data': user_data['performance_data'],
            'rank': user_data['rank']
        })
        
        return jsonify({
            "success": True,
            "message": "Test results submitted successfully",
            "rankIncreased": should_increment_rank,
            "newRank": user_data['rank']
        }), 200
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500