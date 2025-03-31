from flask import Flask, send_from_directory
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials
from config import initialize_firebase

app = Flask(__name__)
CORS(app)

# Initialize Firebase
initialize_firebase()

# Register all routes
from routes import register_blueprints
register_blueprints(app)

# Debug: Print all registered routes
print("Registered routes:")
for rule in app.url_map.iter_rules():
    print(f"{rule.endpoint}: {rule}")

if __name__ == '__main__':
    app.run(debug=True)