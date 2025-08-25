// Replicates the Python escape & structure logic client-side.
// Emoji / extended pictographic removal using a Unicode regex range.
const extendedPictographicRE = /\p{Extended_Pictographic}/gu; // needs browser with Unicode prop escapes

function escapeContent(text) {
  // Remove emojis, escape backslashes and angle brackets, replace newlines with <br>
  return text
    .replace(extendedPictographicRE, '')
    .replace(/\\/g, '\\\\')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function numericAwareSort(a, b) {
  const anum = a.match(/\d+/);
  const bnum = b.match(/\d+/);
  if (anum && bnum) {
    return parseInt(anum[0]) - parseInt(bnum[0]);
  }
  return a.localeCompare(b);
}

function buildStructure(files) {
  // files: FileList from input (webkitdirectory) containing paths like folder/sub/file.txt
  const documents = [];
  const projectFolders = new Set();

  // Determine base path (common prefix) using the first file.
  const allPaths = Array.from(files).map(f => f.webkitRelativePath || f.name);
  let basePath = '';
  if (allPaths.length) {
    const splitPaths = allPaths.map(p => p.split('/'));
    let i = 0;
    while (true) {
      const segment = splitPaths[0][i];
      if (!segment) break;
      if (splitPaths.every(parts => parts[i] === segment)) {
        basePath += (i === 0 ? '' : '/') + segment;
        i++;
      } else break;
    }
  }
  // If basePath points to a file (no trailing), treat last segment as root folder.
  const projectTitle = basePath ? basePath.split('/').slice(-1)[0] : 'Project';

  // Group by folder for potential sorting
  const fileEntries = Array.from(files).filter(f => {
    const n = f.name.toLowerCase();
    if (n.endsWith('.docx') || n.endsWith('.json') || n === '.ds_store') return false;
    return true;
  });

  // Sort by numeric where possible within same folder (we'll apply after grouping if needed)
  fileEntries.sort((a, b) => numericAwareSort(a.name, b.name));

  const readPromises = fileEntries.map(file => {
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = e => {
        const relPath = file.webkitRelativePath || file.name;
        const parts = relPath.split('/');
        parts.pop(); // remove filename
        const folder = parts.slice(1).join('/') || '.'; // relative inside project root
        if (folder !== '.') projectFolders.add(folder);
        resolve({
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^.]+$/, '').replace(/_/g, ' '),
          content: escapeContent(e.target.result),
          folder
        });
      };
      reader.onerror = () => resolve(null);
      reader.readAsText(file, 'utf-8');
    });
  });

  return Promise.all(readPromises).then(results => {
    results.filter(Boolean).forEach(doc => documents.push(doc));
    return [{
      projectId: crypto.randomUUID(),
      title: projectTitle,
      documents,
      projectFolders: Array.from(projectFolders).sort()
    }];
  });
}

const folderInput = document.getElementById('folderInput');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const outputPre = document.getElementById('output');
let latestJSON = null;

convertBtn.addEventListener('click', async () => {
  const files = folderInput.files;
  if (!files || !files.length) {
    alert('Please select a folder first.');
    return;
  }
  outputPre.textContent = 'Converting...';
  try {
    const data = await buildStructure(files);
    latestJSON = JSON.stringify(data, null, 2);
    outputPre.textContent = latestJSON;
    downloadBtn.disabled = false;
  } catch (e) {
    console.error(e);
    outputPre.textContent = 'Error: ' + e.message;
  }
});

downloadBtn.addEventListener('click', () => {
  if (!latestJSON) return;
  const blob = new Blob([latestJSON], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'folder_output.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});
