def normalize_course_name(course):
    course_map = {
        "operating system": "Operating system",
        "operating systems": "Operating system",
        "Operating System": "Operating system",
        "data structures and algorithms": "Data Structures and Algorithms",
        "computer networks": "Computer Networks"
    }
    return course_map.get(course, course)

def validate_course(user_doc):
    course = user_doc.get('course')
    if not course:
        return None
    return normalize_course_name(course)