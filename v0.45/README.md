# Folder to JSON Converter

This script converts the contents of a folder into a structured JSON file for importing files from YFD to Raptor Write. It processes text-based files, preserves folder structure, and organizes file content within the JSON output.

## Features
- Recursively scans a folder and its subfolders.
- Converts text-based files into JSON objects.
- Escapes special characters and removes unwanted Unicode characters (e.g., emojis).
- Preserves folder structure in the JSON output.
- Allows users to select input and output folders via a graphical interface.

## Requirements
- Python 3.6 or higher
- `regex` library (install using `pip install regex`)

## Installation
1. Clone this repository or download the script.
2. Install the required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage
1. Run the script:
   ```bash
   python folder_to_json_converter.py
   ```
2. A graphical interface will appear to select the source folder and the output folder.
3. The script will generate a JSON file in the selected output folder.

## JSON Structure
The generated JSON file will have the following structure:
```json
{
    "projectId": "<unique-project-id>",
    "title": "<project-title>",
    "documents": [
        {
            "id": "<unique-document-id>",
            "title": "<file-title>",
            "content": "<escaped-file-content>",
            "folder": "<relative-folder-path>"
        }
    ],
    "projectFolders": [
        "<relative-folder-path>"
    ]
}
```

## Notes
- The script ignores `.docx`, `.json`, and `.DS_Store` files.
- Files with encoding issues will be skipped, and a warning will be displayed.

## License
This project is licensed under the MIT License.