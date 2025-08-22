import re

def extract_number(name):
    """Extract numeric prefix from a filename for sorting"""
    match = re.match(r"(\d+)_", name)
    return int(match.group(1)) if match else float('inf')  # Assign large number if no match