chrome.action.onClicked.addListener(async (tab) => {
  try {
    // Intentamos enviar el mensaje
    await chrome.tabs.sendMessage(tab.id, { action: "INICIAR" });
    console.log("Mensaje enviado a la pestaña.");
  } catch (error) {
    // Si falla (p.ej. la página no ha terminado de cargar), lo intentamos de nuevo inyectando el script manualmente
    console.error("Error al enviar mensaje, reintentando...", error);
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }).then(() => {
      chrome.tabs.sendMessage(tab.id, { action: "INICIAR" });
    });
  }
});