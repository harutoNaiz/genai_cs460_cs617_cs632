from flask import Blueprint

# Import all route modules
from routes.auth import auth_bp
from routes.user import user_bp
from routes.content import content_bp

def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    # Register blueprints without URL prefix to maintain the original URL structure
    app.register_blueprint(auth_bp, url_prefix='')
    app.register_blueprint(user_bp, url_prefix='')
    app.register_blueprint(content_bp, url_prefix='')