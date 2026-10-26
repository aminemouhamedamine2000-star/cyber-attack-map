import fs from "node:fs";

const BASE = "http://127.0.0.1:9223";
const PAGE = "http://127.0.0.1:4174/";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connect() {
  let version;
  for (let i = 0; i < 60; i += 1) {
    try {
      const response = await fetch(`${BASE}/json/version`);
      version = await response.json();
      break;
    } catch {
      await sleep(200);
    }
  }
  if (!version) throw new Error("DevTools endpoint did not appear");

  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  let nextId = 0;
  const pending = new Map();

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
    }
  };

  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
    });

  return { ws, send };
}

async function main() {
  const { ws, send } = await connect();
  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

  await send("Page.enable", {}, sessionId);
  await send("Runtime.enable", {}, sessionId);
  await send(
    "Emulation.setDeviceMetricsOverride",
    { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false },
    sessionId
  );
  await send("Page.navigate", { url: PAGE }, sessionId);

  const evaluate = async (expression) => {
    const result = await send(
      "Runtime.evaluate",
      { expression, returnByValue: true, awaitPromise: true },
      sessionId
    );
    if (result.exceptionDetails) {
      throw new Error(
        result.exceptionDetails.text +
          " " +
          (result.exceptionDetails.exception?.description || "")
      );
    }
    return result.result.value;
  };

  let state = null;
  for (let i = 0; i < 140; i += 1) {
    state = await evaluate(`({
      cards: document.querySelectorAll(".attack-card").length,
      logs: document.querySelectorAll(".log-line").length,
      tiles: document.querySelectorAll(".leaflet-tile-loaded").length,
      detected: document.getElementById("statDetected")?.textContent ?? null,
      threat: document.getElementById("threatLevel")?.textContent ?? null,
      mapPane: Boolean(document.querySelector(".leaflet-pane"))
    })`);
    if (state.cards >= 3 && state.tiles >= 20) break;
    await sleep(300);
  }

  console.log("LOAD_STATE", JSON.stringify(state));
  await sleep(2200);

  const finalState = await evaluate(`({
    cards: document.querySelectorAll(".attack-card").length,
    logs: document.querySelectorAll(".log-line").length,
    tiles: document.querySelectorAll(".leaflet-tile-loaded").length,
    detected: document.getElementById("statDetected")?.textContent ?? null,
    mitigated: document.getElementById("statBlocked")?.textContent ?? null,
    threat: document.getElementById("threatLevel")?.textContent ?? null,
    session: document.getElementById("sessionTimer")?.textContent ?? null,
    canvas: (() => { const c = document.getElementById("attackCanvas"); return c ? [c.width, c.height] : null; })(),
    mapSize: (() => { const m = document.getElementById("map"); return m ? [m.clientWidth, m.clientHeight] : null; })(),
    tileZooms: [...new Set([...document.querySelectorAll(".leaflet-tile")].map((t) => (t.src.match(/tile\\/(\\d+)\\//) || [])[1]))],
    tileContainers: [...document.querySelectorAll(".leaflet-tile-container")].map((c) => ({
      z: c.style.zIndex,
      tiles: c.querySelectorAll(".leaflet-tile").length,
      loaded: c.querySelectorAll(".leaflet-tile-loaded").length,
      rect: (() => { const r = c.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width)]; })()
    })),
    feedEmpty: Boolean(document.getElementById("feedEmpty")),
    bodyOverflow: getComputedStyle(document.body).overflow
  })`);

  const screenshot = await send(
    "Page.captureScreenshot",
    { format: "png", fromSurface: true },
    sessionId
  );
  fs.writeFileSync("docs/preview.png", Buffer.from(screenshot.data, "base64"));

  console.log("FINAL_STATE", JSON.stringify(finalState));
  console.log("SCREENSHOT_BYTES", fs.statSync("docs/preview.png").size);

  await send("Browser.close").catch(() => {});
  ws.close();
}

main().catch((error) => {
  console.error("CAPTURE_ERROR", error);
  process.exit(1);
});
