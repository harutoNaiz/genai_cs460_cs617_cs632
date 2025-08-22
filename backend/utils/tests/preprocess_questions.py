import pandas as pd
import re

def preprocess_questions(file_path, output_csv):

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    questions = re.split(r'\*\*Question \d+\*\*', content)[1:]
    data = []

    for q in questions:
        lines = q.strip().split('\n')
        question_text = lines[0].strip()
        options = [re.sub(r'^[a-d]\.\s*', '', line.strip()) for line in lines[1:5]]
        correct_option_match = re.search(r'\*\*Correct answer: (.*?)\*\*', q)
        subtopic_match = re.search(r'\*\*Subtopic: (.*?)\*\*', q)
        subtopic_detail_match = re.search(r'\*\*What in that subtopic exactly: (.*?)\*\*', q)
        difficulty_match = re.search(r'\*\*Difficulty: (.*?)\*\*', q)
        correct_option = correct_option_match.group(1) if correct_option_match else ''
        correct_option = re.sub(r'^[a-d]\.\s*', '', correct_option)
        subtopic = subtopic_match.group(1) if subtopic_match else ''
        subtopic_detail = subtopic_detail_match.group(1) if subtopic_detail_match else ''
        difficulty = difficulty_match.group(1) if difficulty_match else ''
        data.append([question_text] + options + [correct_option, subtopic, subtopic_detail, difficulty])
        
    df = pd.DataFrame(data, columns=['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Option', 'Subtopic', 'Subtopic Detail', 'Difficulty'])
    df.to_csv(output_csv, index=False, encoding='utf-8')
    return df