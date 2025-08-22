import os

def get_content_path(course):
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(current_dir, '..', '..','content', course)