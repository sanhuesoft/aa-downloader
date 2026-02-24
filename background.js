chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "INICIAR_PROCESO" }).catch(() => {
    console.log("La extensión necesita que la página esté cargada.");
  });
});