from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("GROQ_API_KEY environment variable not set")

def generate_questions(topic, subtopic, topic_content=None, model="llama3-70b-8192"):
    context = ""
    if topic_content:
        context = (
            "INTERNAL COURSE CONTENT:\n" + 
            "\n".join(topic_content) + 
            "\n\n"
        )
    prompt = (f"{context}"
             f"Based on the internal content, generate up to 5 multiple choice questions on {topic} under {subtopic}. "
             "Each question should have 4 options (a, b, c, d) with one correct answer. "
             "Go from easy to very hard. Format as follows:\n\n"
             "<question>\n"
             "a.<option1>\n"
             "b.<option2>\n"
             "c.<option3>\n"
             "d.<option4>\n\n"
             "<correct option>\n"
             "<subtopic>\n"
             "<what in that subtopic exactly>\n"
             "<a flag for difficulty (e,m,h)(easy medium hard)>\n"
             "<content reference: quote the specific content this question is based on>\n"
             "<####>"
             "\n\n"
             "for example the structure of output must look exactly as follows permitting no variation:\n" 
             " **Question 1**\n"
             "What is the primary advantage of using Bubble Sort?\n"
             "a. It is the fastest sorting algorithm.\n"
             "b. It is easy to implement.\n"
             "c. It uses the least amount of memory.\n"
             "d. It is used for large datasets.\n\n"
             "**Correct answer: b. It is easy to implement.**\n"
             "**Subtopic: Bubble Sort**\n"
             "**What in that subtopic exactly: Characteristics of Bubble Sort**\n"
             "**Difficulty: e**\n"
             "**Content reference: 'Bubble Sort is one of the simplest sorting algorithms to implement...'**"
    )
    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1000,
        temperature=0.7
    )
    return response.choices[0].message.content