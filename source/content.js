// Dynamic import so we can use ES modules in the content script.
(async () => {
  const src = chrome.runtime.getURL("modules/main.js");
  const contentScript = await import(src);
  contentScript.main();
})();
