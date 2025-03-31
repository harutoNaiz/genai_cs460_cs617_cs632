from flask import Blueprint

# Import all route modules
from routes.auth import auth_bp
from routes.user import user_bp
from routes.content import content_bp
from routes.summarize import summarize_bp
from routes.temp import temp_start_bp
from routes.temp import csv_generation_bp

def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    # Register blueprints without URL prefix to maintain the original URL structure
    app.register_blueprint(auth_bp, url_prefix='')
    app.register_blueprint(user_bp, url_prefix='')
    app.register_blueprint(content_bp, url_prefix='')
    app.register_blueprint(summarize_bp, url_prefix='')
    app.register_blueprint(temp_start_bp, url_prefix='')
    app.register_blueprint(csv_generation_bp, url_prefix='')