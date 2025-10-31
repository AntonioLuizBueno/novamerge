/*script.js*/
// Variáveis Globais para o Contexto de Áudio
let audioContext;
let oscillator;
let gainNode;

// Elementos do DOM
const playButton = document.getElementById('playButton');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValueSpan = document.getElementById('volumeValue');
const waveTypeSelect = document.getElementById('waveType');
const audioStatus = document.getElementById('audioStatus');

// =================================================================
// 1. FUNÇÕES DO NÓS DE ÁUDIO
// =================================================================

/**
 * Inicia o contexto de áudio e configura o grafo de áudio.
 */
function setupAudio() {
  // 1. Cria ou resume o AudioContext (necessário para políticas de autoplay)
  if (!audioContext) {
    // Usa o prefixo webkit para compatibilidade com navegadores mais antigos
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContext();
  }

  // Resume o contexto se estiver suspenso (comum após a primeira interação)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // 2. Cria a FONTE DE SOM (Oscilador)
  oscillator = audioContext.createOscillator();

  // 3. Cria o NÓ DE PROCESSAMENTO (Ganho/Volume)
  gainNode = audioContext.createGain();

  // 4. Conecta os Nós no Grafo: Oscilador -> Ganho -> Destino
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // 5. Configurações iniciais
  oscillator.type = waveTypeSelect.value; // Pega o tipo de onda selecionado
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Frequência A4 = 440 Hz

  // Define o volume inicial a partir do slider
  gainNode.gain.setValueAtTime(volumeSlider.value, audioContext.currentTime);

  // 6. Inicia o som
  oscillator.start();

  audioStatus.textContent = "Sintetizador ATIVO (Gerando som).";
}

/**
 * Interrompe a geração de som e limpa os nós.
 */
function stopAudio() {
  if (oscillator) {
    // Para a geração de som (com um pequeno fade out para evitar "cliques")
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
    oscillator.stop(audioContext.currentTime + 0.05); // Garante que o stop ocorra após o fade out

    // Limpa as referências para permitir um novo setupAudio()
    oscillator = null;
    gainNode = null;

    audioStatus.textContent = "O áudio está inativo.";
  }
}

// =================================================================
// 2. LISTENERS DE EVENTOS DOM
// =================================================================

// Eventos do Botão (simulando tocar um instrumento, segurar para tocar)
playButton.addEventListener('mousedown', setupAudio);
playButton.addEventListener('mouseup', stopAudio);
playButton.addEventListener('mouseleave', stopAudio); // Para parar se o mouse sair do botão

// Evento do Slider de Volume
volumeSlider.addEventListener('input', () => {
  const volume = parseFloat(volumeSlider.value);

  // Atualiza o valor na tela
  volumeValueSpan.textContent = `${Math.round(volume * 100)}%`;

  // Atualiza o GainNode em tempo real se o som estiver ativo
  if (gainNode) {
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  }
});

// Evento de Seleção do Tipo de Onda
waveTypeSelect.addEventListener('change', () => {
  const newType = waveTypeSelect.value;

  // Atualiza o tipo de onda se o oscilador estiver ativo
  if (oscillator) {
    oscillator.type = newType;
    audioStatus.textContent = `Sintetizador ATIVO (Onda: ${newType}).`;
  }
});

// Configuração inicial do valor do volume na tela
document.addEventListener('DOMContentLoaded', () => {
  volumeValueSpan.textContent = `${Math.round(parseFloat(volumeSlider.value) * 100)}%`;
});