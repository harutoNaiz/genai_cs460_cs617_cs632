from config import get_db
db = get_db()

def get_user_data(email):
    users_ref = db.collection('users')
    query = users_ref.where('email', '==', email).get()
    if not query:
        return None
    return query[0].to_dict()