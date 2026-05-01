// Change this to 'words.txt' if you download the file to your repo!
const DICTIONARY_URL = 'words.txt';

let trie = {};
const gridElement = document.getElementById('word-grid');
const solveBtn = document.getElementById('solve-btn');
const statusText = document.getElementById('status');

// 1. Create Grid Inputs
for (let i = 0; i < 16; i++) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = 1;
    input.dataset.index = i;
    // Auto-focus next input
    input.addEventListener('input', (e) => {
        if (e.target.value && i < 15) {
            document.querySelector(`[data-index="${i + 1}"]`).focus();
        }
    });
    gridElement.appendChild(input);
}

// 2. Load Dictionary into Trie
async function init() {
    try {
        const response = await fetch(DICTIONARY_URL);
        const text = await response.text();
        const words = text.split('\n');
        
        for (let word of words) {
            word = word.trim().toLowerCase();
            if (word.length < 3) continue; 
            
            let node = trie;
            for (let char of word) {
                if (!node[char]) node[char] = {};
                node = node[char];
            }
            node.isWord = true;
        }
        statusText.innerText = "Dictionary Ready!";
        solveBtn.disabled = false;
    } catch (err) {
        statusText.innerText = "Error loading dictionary. Check CORS/Path.";
        console.error(err);
    }
}

// 3. The Solver (DFS)
function solve() {
    const inputs = document.querySelectorAll('.grid input');
    const board = Array.from(inputs).map(i => i.value.toLowerCase());
    const foundWords = new Set();
    const visited = new Array(16).fill(false);

    function search(idx, node, currentStr) {
        if (visited[idx] || !board[idx] || !node[board[idx]]) return;

        const char = board[idx];
        const nextNode = node[char];
        const newStr = currentStr + char;

        if (nextNode.isWord) foundWords.add(newStr);

        visited[idx] = true;

        const row = Math.floor(idx / 4);
        const col = idx % 4;

        // Check all 8 directions
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (newRow >= 0 && newRow < 4 && newCol >= 0 && newCol < 4) {
                    search(newRow * 4 + newCol, nextNode, newStr);
                }
            }
        }

        visited[idx] = false; // Backtrack
    }

    for (let i = 0; i < 16; i++) {
        search(i, trie, "");
    }

    renderResults(Array.from(foundWords));
}

function renderResults(words) {
    // Sort by length (longest first)
    words.sort((a, b) => b.length - a.length);
    const container = document.getElementById('results-list');
    container.innerHTML = words.length > 0 
        ? words.slice(0, 50).map(w => `<span class="word-pill">${w}</span>`).join('')
        : "No words found.";
}

function clearGrid() {
    document.querySelectorAll('.grid input').forEach(input => input.value = '');
    document.getElementById('results-list').innerHTML = '';
}

init();
