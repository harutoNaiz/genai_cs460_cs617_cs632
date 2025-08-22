import re

def get_stripped_name(name):
    """Remove numeric prefix from a name and .txt from the end"""
    name =  re.sub(r"^\d+_", "", name)
    name =  re.sub(r"\.txt$", "", name)
    return name