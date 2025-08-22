# from flask import Blueprint
from routes.auth import auth_bp
from routes.user import user_bp
from routes.content import content_bp
from routes.summarize import summarize_bp
from routes.test import temp_start_bp
from routes.test import csv_generation_bp
from routes.submission import submit_test_bp
from routes.serve import serve_bp
from routes.profile import profile_bp

def register_blueprints(app):
    """Register all blueprints with the Flask app"""
    app.register_blueprint(auth_bp, url_prefix='')
    app.register_blueprint(user_bp, url_prefix='')
    app.register_blueprint(content_bp, url_prefix='')
    app.register_blueprint(summarize_bp, url_prefix='')
    app.register_blueprint(temp_start_bp, url_prefix='')
    app.register_blueprint(csv_generation_bp, url_prefix='')
    app.register_blueprint(submit_test_bp, url_prefix='')
    app.register_blueprint(serve_bp, url_prefix='')
    app.register_blueprint(profile_bp, url_prefix='')