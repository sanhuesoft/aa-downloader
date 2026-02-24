// --- CONFIGURACIÓN Y ESTILOS ---
const UI_ID = "aa-helper-ui";

const injectStyles = () => {
  if (document.getElementById("aa-helper-style")) return;
  const style = document.createElement("style");
  style.id = "aa-helper-style";
  style.innerHTML = `
    #${UI_ID} {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #1a1a1a;
      color: white;
      padding: 15px;
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      z-index: 999999;
      font-family: system-ui, -apple-system, sans-serif;
      border: 1px solid #333;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 220px;
      animation: slideIn 0.3s ease-out;
    }
    @keyframes slideIn { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
    #${UI_ID} button {
      background: #007bff;
      color: white;
      border: none;
      padding: 8px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
    }
    #${UI_ID} button:hover { background: #0056b3; }
    #${UI_ID} .close-btn {
      position: absolute;
      top: 5px;
      right: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #888;
    }
  `;
  document.head.appendChild(style);
};

// --- LÓGICA DE BÚSQUEDA ---

const iniciarDescargaAutomatica = () => {
  const items = document.querySelectorAll('li');
  const targetLi = Array.from(items).find(li => 
    li.textContent.toLowerCase().includes("no waitlist,") && 
    li.querySelector('a.js-download-link')
  );

  if (targetLi) {
    const link = targetLi.querySelector('a.js-download-link');
    chrome.storage.local.set({ procesando_aa: true }, () => {
      window.location.href = link.href;
    });
  } else {
    alert("No se encontró un servidor 'no waitlist' disponible.");
  }
};

const buscarBotonFinal = () => {
  const link = Array.from(document.querySelectorAll('a'))
    .find(a => a.textContent.trim().toLowerCase().includes("download now"));

  if (link) {
    chrome.storage.local.set({ procesando_aa: false });
    window.location.href = link.href;
  } else {
    setTimeout(buscarBotonFinal, 2000);
  }
};

// --- INTERFAZ DE USUARIO ---

const mostrarSugerencia = () => {
  if (document.getElementById(UI_ID)) return;
  injectStyles();

  const container = document.createElement("div");
  container.id = UI_ID;
  container.innerHTML = `
    <span class="close-btn">✕</span>
    <div style="font-size: 14px; margin-bottom: 5px;">📖 <b>Libro detectado</b></div>
    <div style="font-size: 12px; color: #ccc;">¿Intento iniciar la descarga por un servidor sin lista de espera?</div>
    <button id="aa-start-btn">Iniciar descarga</button>
  `;

  document.body.appendChild(container);

  container.querySelector(".close-btn").onclick = () => container.remove();
  container.querySelector("#aa-start-btn").onclick = () => {
    container.innerHTML = `<div style="font-size: 13px; text-align: center;">🔍 Buscando servidor...</div>`;
    iniciarDescargaAutomatica();
  };
};

// --- CICLO DE VIDA ---

// 1. Si estamos en página de libro, mostrar sugerencia
if (window.location.pathname.includes("/md5/")) {
  // Esperar un poco para que la página cargue bien antes de mostrar el popup
  setTimeout(mostrarSugerencia, 1000);
}

// 2. Si venimos de una redirección, buscar el link final
chrome.storage.local.get(['procesando_aa'], (res) => {
  if (res.procesando_aa && window.location.pathname.includes('/slow_download/')) {
    buscarBotonFinal();
  }
});

// 3. Escuchar mensaje del icono de la barra
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "INICIAR_PROCESO") {
    iniciarDescargaAutomatica();
  }
});