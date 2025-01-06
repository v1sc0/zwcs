// Função para coletar caracteres de largura zero selecionados
function getSelectedZeroWidthChars() {
  const checkboxes = document.querySelectorAll('#zero-width-options input[type="checkbox"]');
  const selectedChars = [];
  checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
          selectedChars.push(checkbox.value);
      }
  });
  return selectedChars.join(''); // Retorna os caracteres como uma string
}

// Função para atualizar os caracteres de largura zero em unicode_steganography.js
function updateZeroWidthChars() {
  const selectedZeroWidthChars = getSelectedZeroWidthChars();
  if (selectedZeroWidthChars.length >= 2) {
      unicodeSteganographer.setUseChars(selectedZeroWidthChars); // Chama a função do unicode_steganography.js
  } else {
      alert('Please select at least two zero-width characters.');
  }
}

// Função para coletar a posição selecionada pelo usuário
function getSelectedPosition() {
  const radios = document.querySelectorAll('input[name="position"]');
  let selectedPosition = 'distributed'; // Valor padrão
  radios.forEach((radio) => {
      if (radio.checked) {
          selectedPosition = radio.value;
      }
  });
  return selectedPosition;
}

// Função para criptografar uma mensagem
function encryptMessage(message, key) {
  return CryptoJS.AES.encrypt(message, key).toString();
}

// Função para descriptografar uma mensagem
function decryptMessage(cipherText, key) {
  try {
      return CryptoJS.AES.decrypt(cipherText, key).toString(CryptoJS.enc.Utf8);
  } catch (e) {
      alert("Invalid Secret Key for decryption.");
      return "";
  }
}

// Event listener para o botão de encode
document.getElementById('encode-btn').addEventListener('click', () => {
  updateZeroWidthChars(); // Atualiza os caracteres selecionados

  const originalText = document.getElementById('original-text').value;
  let hiddenText = document.getElementById('hidden-text').value;
  const secretKey = document.getElementById('secret-key').value;

  // Captura a posição selecionada pelo usuário
  const selectedPosition = getSelectedPosition();

  // Se uma chave for fornecida, criptografa o texto oculto
  if (secretKey) {
      hiddenText = encryptMessage(hiddenText, secretKey);
  }

  try {
      // Codifica o texto original com o texto oculto (criptografado ou não)
      const encodedText = unicodeSteganographer.encodeText(originalText, hiddenText, selectedPosition);
      document.getElementById('result-text').value = encodedText;
      updateCharacterCount();
  } catch (error) {
      console.error("Erro durante a codificação:", error);
      alert("An error occurred during encoding. Please check your input.");
  }
});

// Event listener para o botão de decode
document.getElementById('decode-btn').addEventListener('click', () => {
  updateZeroWidthChars(); // Atualiza os caracteres selecionados
  const encodedText = document.getElementById('original-text').value;
  const secretKey = document.getElementById('secret-key').value;

  // Decodifica o texto para obter o texto oculto (possivelmente criptografado)
  let hiddenText = unicodeSteganographer.decodeText(encodedText).hiddenText; // Função do unicode_steganography.js

  // Se uma chave for fornecida, descriptografa o texto oculto
  if (secretKey) {
      hiddenText = decryptMessage(hiddenText, secretKey);
  }

  document.getElementById('result-text').value = hiddenText;
  updateCharacterCount();
});

// Atualiza os contadores de caracteres
function updateCharacterCount() {
  document.getElementById('original-text-counter').textContent = `${document.getElementById('original-text').value.length} characters`;
  document.getElementById('hidden-text-counter').textContent = `${document.getElementById('hidden-text').value.length} characters`;
  document.getElementById('result-text-counter').textContent = `${document.getElementById('result-text').value.length} characters`;
}

// Função para limpar todas as áreas de texto
function clearAllFields() {
  document.getElementById('original-text').value = '';
  document.getElementById('hidden-text').value = '';
  document.getElementById('result-text').value = '';
  updateCharacterCount();
}

// Função para copiar o conteúdo do resultado para a área de transferência
function copyToClipboard() {
  const resultText = document.getElementById('result-text');
  resultText.select();
  document.execCommand('copy');
}

// Função para destacar caracteres de largura zero e exibir tipos encontrados
function highlightZeroWidthCharacters() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'highlightZeroWidth' }, (response) => {
          if (response && response.count !== undefined) {
              // Atualizar a contagem de caracteres
              document.getElementById('zero-width-count').textContent = `Zero-width Count: ${response.count}`;
              
              // Exibir os tipos de caracteres encontrados
              const typesList = document.getElementById('zero-width-types');
              const typesTitle = document.getElementById('zero-width-types-title');
              typesList.innerHTML = ''; // Limpar a lista anterior
              
              if (response.types.length > 0) {
                  // Mostrar título e preencher a lista
                  typesTitle.style.display = 'block';
                  response.types.forEach((type) => {
                      const listItem = document.createElement('li');
                      listItem.textContent = type;
                      typesList.appendChild(listItem);
                  });
              } else {
                  // Ocultar título se nenhum tipo for encontrado
                  typesTitle.style.display = 'none';
              }
          }
      });
  });
}

// Event listener para o botão de destaque
document.getElementById('highlight-btn').addEventListener('click', highlightZeroWidthCharacters);

document.getElementById('clear-btn').addEventListener('click', clearAllFields);
document.getElementById('copy-btn').addEventListener('click', copyToClipboard);
document.getElementById('original-text').addEventListener('input', updateCharacterCount);
document.getElementById('hidden-text').addEventListener('input', updateCharacterCount);
document.getElementById('result-text').addEventListener('input', updateCharacterCount);

// Inicializa contadores
updateCharacterCount();

document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggle-secret-key-btn');
  const secretKeyInput = document.getElementById('secret-key');

  if (toggleButton && secretKeyInput) {
      console.log("Botão e campo de senha encontrados");

      toggleButton.addEventListener('click', function() {
          console.log("Botão clicado"); // Verifica se o clique está funcionando

          if (secretKeyInput.type === 'password') {
              secretKeyInput.type = 'text';
              toggleButton.textContent = 'Hide';
          } else {
              secretKeyInput.type = 'password';
              toggleButton.textContent = 'View';
          }
      });
  } else {
      console.log("Botão ou campo de senha não encontrado");
  }
});
