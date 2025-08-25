import os
import json
import uuid
import re
import regex  # pip install regex
import tkinter as tk
from tkinter import filedialog

pattern = regex.compile(r'\p{Extended_Pictographic}', flags=regex.UNICODE)

def escape_content(content):
    """Escape special characters, preserve newlines with <br>, and remove unwanted Unicode characters."""
    # Remove unwanted Unicode characters (e.g., emojis)
    content = pattern.sub('', content)
    # Escape backslashes and special HTML characters, but avoid over-escaping double quotes
    return content.replace("\\", "\\\\").replace("<", "&lt;").replace(">", "&gt;").replace("\n", "<br>")

def generate_json_structure(base_path):
    """Generate a JSON structure for the given folder."""
    documents = []
    project_folders = set()

    for root, dirs, files in os.walk(base_path):
        # Sort directories and files for consistent output
        dirs.sort()
        # Sort files numerically by chapter order if applicable
        files.sort(key=lambda x: int(match.group()) if (match := re.search(r'\d+', x)) else float('inf'))

        # Add directories to project folders
        for directory in dirs:
            project_folders.add(os.path.relpath(os.path.join(root, directory), base_path))

        # Process files
        for file in files:
            if file.endswith(".docx") or file.endswith(".json") or file == ".DS_Store":
                continue  # Ignore .docx, .json, and .DS_Store files

            file_path = os.path.join(root, file)
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
            except UnicodeDecodeError:
                print(f"Warning: Could not read file {file_path} due to encoding issues. Skipping.")
                continue

            documents.append({
                "id": str(uuid.uuid4()),
                "title": os.path.splitext(file)[0].replace("_", " "),  # Remove file extension and replace underscores with spaces
                "content": escape_content(content),
                "folder": os.path.relpath(root, base_path)
            })

    # Use the base folder name as the project title
    project_title = os.path.basename(os.path.normpath(base_path))

    return {
        "projectId": str(uuid.uuid4()),
        "title": project_title,
        "documents": documents,
        "projectFolders": sorted(project_folders)
    }

def main():
    # Center the tkinter dialog box on the screen
    root = tk.Tk()
    root.withdraw()
    root.update_idletasks()
    screen_width = root.winfo_screenwidth()
    screen_height = root.winfo_screenheight()
    width = 400  # Set a fixed width for the dialog
    height = 300  # Set a fixed height for the dialog
    x = (screen_width // 2) - (width // 2)
    y = (screen_height // 2) - (height // 2)
    root.geometry(f'{width}x{height}+{x}+{y}')
    root.deiconify()

    # Prompt user to select the source folder
    input_folder = filedialog.askdirectory(title="Select the source folder")
    if not input_folder:
        print("No source folder selected. Exiting.")
        return

    # Prompt user to select the output folder
    output_folder = filedialog.askdirectory(title="Select the output folder")
    if not output_folder:
        print("No output folder selected. Exiting.")
        return

    project_title = os.path.basename(os.path.normpath(input_folder))
    output_file = os.path.join(output_folder, f"{project_title.lower().replace(' ', '_')}_output.json")

    # Generate JSON structure
    json_structure = generate_json_structure(input_folder)

    # Write to output file
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump([json_structure], f, indent=4)

    print(f"JSON file created at: {output_file}")

if __name__ == "__main__":
    main()
