LANGUAGES = {
    "js": "javascript", # Done 
    "py": "python3", # Done 
    "cpp": "cpp", # Done 
    "go": "go", # Done 
    "c": "c", # Done 
    "rs": "rust", # Done 
    "java": "java", # Done 
}


BUILD_COMMANDS = {
    "cpp": ["g++", "-o", "main", "main.cpp"],
    "c": ["gcc", "-o", "main", "main.c"],
    "java": ["javac", "main.java"],
    "go": ["go", "build", "main.go"],
    "rs": ["rustc", "-o", "main", "main.rs"],
    "py": ["python3", "main.py"]
}


def get_language_name(language_code):
    return LANGUAGES.get(language_code, None)
