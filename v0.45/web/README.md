# Folder to JSON Converter (Web Version)

This is a zero-backend, static web adaptation of the Python `folder_to_json_converter.py` script. It lets you select a local directory, recursively reads text-like files (excluding `.docx`, `.json`, and `.DS_Store`), escapes content, removes emoji / extended pictographic characters, and produces the same JSON structure used elsewhere in this project.

## Features
- Client‑side only (no uploads; your data never leaves the browser)
- Folder selection via `webkitdirectory`
- Numeric-aware sorting for files containing numbers (e.g., Chapter_1 before Chapter_10)
- Emoji / pictographic removal using Unicode property escapes
- Escapes `<`, `>`, and backslashes; converts newlines to `<br>`
- Instant preview + download as `folder_output.json`

## JSON Shape
Produces an array with a single project object:
```json
[
  {
    "projectId": "<uuid>",
    "title": "<root-folder-name>",
    "documents": [
      {
        "id": "<uuid>",
        "title": "File Name Without Extension",
        "content": "Escaped...<br>With line breaks",
        "folder": "relative/sub/folder"
      }
    ],
    "projectFolders": ["relative/sub/folder", "..."]
  }
]
```

## Usage
1. Open `index.html` in a modern Chromium-based browser (Chrome, Edge, Brave). Firefox works for most features; Safari may lag on very large sets.
2. Click the folder picker and choose the root directory you want to convert.
3. Click **Convert** to build the JSON structure.
4. Review the JSON preview in the page.
5. Click **Download JSON** to save the file.

## Browser Requirements
- Unicode property escapes in RegExp (`/\p{Extended_Pictographic}/u`): widely supported in current Chrome/Edge/Firefox. Older browsers will fail to remove emoji but still work otherwise.
- `webkitdirectory` folder input: best support in Chromium browsers. Firefox provides partial support via drag-and-drop alternatives (not implemented here).

## What Gets Skipped
- Files ending in `.docx`
- Files ending in `.json`
- Files named `.DS_Store`

## Limitations / Notes
- All file reading happens in memory; extremely large directories may impact performance.
- Newlines are replaced with `<br>` to match the Python script’s behavior. If you need raw `\n` preservation, see Improvements below.
- Downloaded filename is fixed as `folder_output.json`; you can rename after saving.
- No progress indicator yet—large folders may appear to stall during FileReader operations.

## Security / Privacy
Everything runs locally. No network calls are made. You can verify by disconnecting your machine and reloading the page.

## Improvements (Future Ideas)
- Toggle: Preserve raw newlines vs `<br>`
- Extension filter (e.g., only `.md` or `.txt`)
- Progress bar with counts / percent
- Drag & drop folder support
- Streaming large output (chunked display) for very big trees
- Option to include / exclude emoji removal
- Light/Dark theme toggle

## Mapping vs Python Script
| Concern | Python Script | Web Version |
|---------|---------------|-------------|
| Folder selection | Tkinter dialog | HTML directory input (`webkitdirectory`) |
| Emoji removal | `regex` module pattern | JS Unicode regex `/\p{Extended_Pictographic}/u` |
| Escaping | Backslashes, `<`, `>`, newlines to `<br>` | Same |
| Output | Writes file to disk via Python | Browser creates downloadable blob |
| Sorting | Numeric-aware via regex | Numeric-aware in JS |

## Quick Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| No folders listed | Browser doesn’t support `webkitdirectory` well | Use Chrome/Edge |
| Emoji still appear | Browser lacks Unicode property support | Update browser |
| Huge pause on convert | Very large folder | Add filters / split folder (future enhancement) |
| Download button disabled | Conversion failed or not run | Check console (DevTools) |

## Development
Files:
- `index.html` – UI scaffold
- `styles.css` – Styling (dark theme)
- `script.js` – Core logic (building the JSON, escaping, download)

You can extend by adding new controls inside the `.controls` div and wiring them in `script.js`.

## License
Same license as the parent repository unless specified otherwise.

---
Feel free to request enhancements—this README covers the current minimal static implementation.
