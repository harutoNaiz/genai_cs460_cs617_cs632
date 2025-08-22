from utils.regex.extract_number import extract_number
from utils.regex.get_stripped_name import get_stripped_name

from utils.tests.generate_questions import generate_questions
from utils.tests.get_content_path import get_content_path
import os

def generate_test_file(chapter_, course):
    
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    content_path = get_content_path(course)
    
    questions_text = ""
    for chapter_name in sorted(os.listdir(content_path), key=extract_number):
        chapter_path = os.path.join(content_path, chapter_name)
        if os.path.isdir(chapter_path) and extract_number(chapter_name) == int(chapter_):
            topics = sorted(
                [file for file in os.listdir(chapter_path) 
                 if os.path.isfile(os.path.join(chapter_path, file))],
                key=extract_number
            )
            for topic in topics:
                topic_name = get_stripped_name(topic)
                questions = generate_questions(chapter_name, topic_name)
                questions_text += questions + "\n"

    output_dir = os.path.join(current_dir, "generated_tests")
    os.makedirs(output_dir, exist_ok=True)
    filename = f"generated_test_{chapter_}.txt"
    output_file = os.path.join(output_dir, filename)
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(questions_text)
    return filename, output_file