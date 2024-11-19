// Mapeamento de caracteres de largura zero para suas descrições Unicode
const zeroWidthCharMap = {
    '\u200B': 'U+200B (Zero Width Space)',
    '\u200C': 'U+200C (Zero Width Non-Joiner)',
    '\u200D': 'U+200D (Zero Width Joiner)',
    '\u200E': 'U+200E (Left-to-Right Mark)',
    '\u202A': 'U+202A (Left-to-Right Embedding)',
    '\u202C': 'U+202C (Pop Directional Formatting)',
    '\u202D': 'U+202D (Left-to-Right Override)',
    '\u2062': 'U+2062 (Invisible Times)',
    '\u2063': 'U+2063 (Invisible Separator)',
    '\uFEFF': 'U+FEFF (Zero Width No-Break Space)'
};

// Expressão regular para identificar caracteres de largura zero
const zeroWidthChars = /[\u200B\u200C\u200D\u200E\u202A\u202C\u202D\u2062\u2063\uFEFF]/g;

// Função para destacar caracteres de largura zero com os próprios caracteres
function highlightZeroWidthChars(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const matches = node.textContent.match(zeroWidthChars);
        if (matches) {
            const fragment = document.createDocumentFragment();
            let lastIndex = 0;
            
            node.textContent.replace(zeroWidthChars, (match, index) => {
                // Adiciona o texto antes do caractere de largura zero
                if (index > lastIndex) {
                    fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex, index)));
                }
                
                // Cria um <span> para envolver o caractere de largura zero
                const span = document.createElement('span');
                span.className = 'zero-width-highlight';
                span.textContent = match;
                fragment.appendChild(span);
                
                // Atualiza o último índice processado
                lastIndex = index + match.length;
            });
            
            // Adiciona o restante do texto após o último caractere de largura zero
            if (lastIndex < node.textContent.length) {
                fragment.appendChild(document.createTextNode(node.textContent.slice(lastIndex)));
            }
            
            // Substitui o nó de texto original pelo fragmento
            node.replaceWith(fragment);
        }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
        for (let child of Array.from(node.childNodes)) {
            highlightZeroWidthChars(child);
        }
    }
}

// Função para coletar os tipos de caracteres de largura zero na página
function getZeroWidthCharTypes(node) {
    const foundChars = new Set();
    if (node.nodeType === Node.TEXT_NODE) {
        const matches = node.textContent.match(zeroWidthChars);
        if (matches) {
            matches.forEach((char) => {
                foundChars.add(zeroWidthCharMap[char] || 'Unknown Character');
            });
        }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
        for (let child of Array.from(node.childNodes)) {
            const childChars = getZeroWidthCharTypes(child);
            childChars.forEach((char) => foundChars.add(char));
        }
    }
    return foundChars;
}

// Remover destaque se já existir
function removeHighlight() {
    document.querySelectorAll('.zero-width-highlight').forEach((element) => {
        element.replaceWith(...element.childNodes);
    });
}

// Listener para mensagens do popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'highlightZeroWidth') {
        removeHighlight();
        highlightZeroWidthChars(document.body);
        const count = countZeroWidthChars(document.body);
        const types = Array.from(getZeroWidthCharTypes(document.body));
        sendResponse({ count: count, types: types });
    }
});

// Função para contar os caracteres de largura zero na página
function countZeroWidthChars(node) {
    let count = 0;
    if (node.nodeType === Node.TEXT_NODE) {
        const matches = node.textContent.match(zeroWidthChars);
        if (matches) {
            count += matches.length;
        }
    } else if (node.nodeType === Node.ELEMENT_NODE && node.nodeName !== 'SCRIPT' && node.nodeName !== 'STYLE') {
        for (let child of Array.from(node.childNodes)) {
            count += countZeroWidthChars(child);
        }
    }
    return count;
}

// Adicionar estilo para destacar caracteres de largura zero
const style = document.createElement('style');
style.textContent = `
    .zero-width-highlight {
        background-color: yellow;
        border: 1px solid red;
        padding: 2px;
        margin: 0 2px;
        border-radius: 3px;
    }
`;
document.head.appendChild(style);