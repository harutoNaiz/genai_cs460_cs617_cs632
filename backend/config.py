import firebase_admin
from firebase_admin import credentials, firestore

def initialize_firebase():
    """Initialize Firebase Admin SDK and return the db client"""
    # Check if app is already initialized
    if not firebase_admin._apps:
        cred = credentials.Certificate("Credentials.json")
        firebase_admin.initialize_app(cred)
    
    return firestore.client()

def get_db():
    """Get Firestore client instance"""
    # If app is not initialized, initialize it
    if not firebase_admin._apps:
        return initialize_firebase()
    return firestore.client()