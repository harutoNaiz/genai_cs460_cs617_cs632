import os

def clear_generated_tests():
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dir_path = os.path.join(current_dir, "generated_tests")
    if os.path.exists(dir_path):
        for file in os.listdir(dir_path):
            file_path = os.path.join(dir_path, file)
            try:
                if os.path.isfile(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")