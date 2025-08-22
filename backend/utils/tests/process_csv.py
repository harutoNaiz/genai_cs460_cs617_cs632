from utils.tests.preprocess_questions import preprocess_questions
import os

def process_csv(chapter_):
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_file = os.path.join(current_dir, "generated_tests", f"generated_test_{chapter_}.txt")
    output_file = os.path.join(current_dir, "generated_tests", f"output_{chapter_}.csv")
    if not os.path.exists(input_file):
        return None, None
    df = preprocess_questions(input_file, output_file)
    return output_file, df
