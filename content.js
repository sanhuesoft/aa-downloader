console.log("🚀 Anna's Archive Helper: Buscador de 'no waitlist' activo.");

// --- PASO 2: BUSCAR EL BOTÓN FINAL ---
const buscarYDescargar = () => {
    console.log("Buscando botón 'Download now'...");
    const links = document.querySelectorAll('a');
    // Buscamos el link que contiene el texto del emoji y Download now
    const downloadLink = Array.from(links).find(a => 
        a.textContent.trim().toLowerCase().includes("download now")
    );

    if (downloadLink) {
        console.log("¡Botón encontrado! Iniciando descarga...");
        chrome.storage.local.set({ procesando: false });
        window.location.href = downloadLink.href;
    } else {
        console.log("Esperando a que aparezca el botón...");
        setTimeout(buscarYDescargar, 1500);
    }
};

// Verificar si venimos de una redirección previa
chrome.storage.local.get(['procesando'], (res) => {
    if (res.procesando && window.location.href.includes('/slow_download/')) {
        buscarYDescargar();
    }
});

// --- PASO 1: BUSCAR EL LINK SIN ESPERA ---
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "INICIAR") {
        console.log("Buscando servidor sin lista de espera...");

        // 1. Buscamos todos los elementos de lista (li)
        const items = document.querySelectorAll('li');
        
        // 2. Filtramos el que tenga el texto "no waitlist," y que dentro tenga un link
        const targetLi = Array.from(items).find(li => 
            li.textContent.toLowerCase().includes("no waitlist,") && 
            li.querySelector('a.js-download-link')
        );

        if (targetLi) {
            const link = targetLi.querySelector('a.js-download-link');
            console.log("Servidor encontrado:", link.textContent);
            
            chrome.storage.local.set({ procesando: true }, () => {
                window.location.href = link.href;
            });
        } else {
            alert("No se encontró ningún servidor con la etiqueta 'no waitlist'.");
        }
    }
});