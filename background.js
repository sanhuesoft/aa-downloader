const DEFAULT_DOMAINS = [
  "annas-archive.org",
  "annas-archive.li",
  "annas-archive.se",
  "annas-archive.gs",
  "annas-archive.is",
  "annas-archive.gd"
];

const SCRIPT_ID = "aa-content-script";

async function buildMatches(domains) {
  const matches = [];
  for (const d of domains) {
    matches.push(`*://${d}/*`);
    matches.push(`*://*.${d}/*`);
  }
  return matches;
}

async function updateContentScripts(domains) {
  try {
    await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
  } catch (_) {
    // Script not yet registered — that's fine
  }

  if (domains.length === 0) return;

  const matches = await buildMatches(domains);
  await chrome.scripting.registerContentScripts([{
    id: SCRIPT_ID,
    matches,
    js: ["content.js"],
    runAt: "document_idle"
  }]);
}

chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(["aa_domains"]);
  const domains = result.aa_domains ?? DEFAULT_DOMAINS;
  if (!result.aa_domains) {
    await chrome.storage.local.set({ aa_domains: DEFAULT_DOMAINS });
  }
  await updateContentScripts(domains);
});

chrome.storage.onChanged.addListener(async (changes, area) => {
  if (area === "local" && changes.aa_domains) {
    await updateContentScripts(changes.aa_domains.newValue);
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "INICIAR_PROCESO" }).catch(() => {
    console.log("La extensión necesita que la página esté cargada.");
  });
});
