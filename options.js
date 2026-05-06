const DEFAULT_DOMAINS = [
  "annas-archive.org",
  "annas-archive.li",
  "annas-archive.se",
  "annas-archive.gs",
  "annas-archive.is",
  "annas-archive.gd"
];

const domainList = document.getElementById("domain-list");
const newDomainInput = document.getElementById("new-domain");
const addBtn = document.getElementById("add-btn");
const resetBtn = document.getElementById("reset-btn");
const statusEl = document.getElementById("status");

let domains = [];

function isValidDomain(value) {
  return /^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(value.trim());
}

function showStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.className = "status" + (isError ? " error" : "");
  clearTimeout(statusEl._timer);
  statusEl._timer = setTimeout(() => { statusEl.textContent = ""; }, 3000);
}

function render() {
  domainList.innerHTML = "";
  for (const domain of domains) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${domain}</span>
      <button class="remove-btn" title="Eliminar" data-domain="${domain}">✕</button>
    `;
    domainList.appendChild(li);
  }
}

function save(successMessage = "Cambios guardados.") {
  chrome.storage.local.set({ aa_domains: domains }, () => {
    showStatus(successMessage);
  });
}

domainList.addEventListener("click", (e) => {
  const btn = e.target.closest(".remove-btn");
  if (!btn) return;
  const domain = btn.dataset.domain;
  domains = domains.filter(d => d !== domain);
  render();
  save(`Dominio "${domain}" eliminado.`);
});

addBtn.addEventListener("click", () => {
  const value = newDomainInput.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (!value) return;
  if (!isValidDomain(value)) {
    showStatus("Dominio no válido. Ej: annas-archive.xyz", true);
    return;
  }
  if (domains.includes(value)) {
    showStatus("Ese dominio ya está en la lista.", true);
    return;
  }
  domains.push(value);
  newDomainInput.value = "";
  render();
  save(`Dominio "${value}" añadido.`);
});

newDomainInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addBtn.click();
});

resetBtn.addEventListener("click", () => {
  domains = [...DEFAULT_DOMAINS];
  render();
  save("Lista restaurada a los valores por defecto.");
});

// Load on start
chrome.storage.local.get(["aa_domains"], (result) => {
  domains = result.aa_domains ?? [...DEFAULT_DOMAINS];
  render();
});
