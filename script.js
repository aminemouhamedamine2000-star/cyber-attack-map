(() => {
  "use strict";

  /* ========================================================================
     CONFIG
     ===================================================================== */

  const CONFIG = {
    attackInterval: 2000,
    initialDelays: [600, 1400],
    maxFeedItems: 14,
    maxTerminalLines: 140,
    arcTtl: 3300,
    mapCenter: [22, 10],
    mapZoom: 2,
  };

  const SEVERITY = {
    low: { label: "LOW", color: "#5dffa8", score: 1 },
    medium: { label: "MEDIUM", color: "#ffc857", score: 2 },
    high: { label: "HIGH", color: "#ff8a4c", score: 3 },
    critical: { label: "CRITICAL", color: "#ff4d6d", score: 4 },
  };

  const COUNTRIES = [
    { code: "US", name: "United States", lat: 38.9, lng: -97.0 },
    { code: "CA", name: "Canada", lat: 56.1, lng: -106.3 },
    { code: "MX", name: "Mexico", lat: 23.6, lng: -102.6 },
    { code: "BR", name: "Brazil", lat: -14.2, lng: -51.9 },
    { code: "AR", name: "Argentina", lat: -38.4, lng: -63.6 },
    { code: "GB", name: "United Kingdom", lat: 55.4, lng: -3.4 },
    { code: "IE", name: "Ireland", lat: 53.1, lng: -7.7 },
    { code: "FR", name: "France", lat: 46.2, lng: 2.2 },
    { code: "DE", name: "Germany", lat: 51.2, lng: 10.4 },
    { code: "NL", name: "Netherlands", lat: 52.1, lng: 5.3 },
    { code: "CH", name: "Switzerland", lat: 46.8, lng: 8.2 },
    { code: "SE", name: "Sweden", lat: 60.1, lng: 18.6 },
    { code: "PL", name: "Poland", lat: 51.9, lng: 19.1 },
    { code: "UA", name: "Ukraine", lat: 48.4, lng: 31.2 },
    { code: "RU", name: "Russia", lat: 61.5, lng: 105.3 },
    { code: "TR", name: "Turkey", lat: 38.9, lng: 35.2 },
    { code: "IL", name: "Israel", lat: 31.0, lng: 34.9 },
    { code: "AE", name: "United Arab Emirates", lat: 23.4, lng: 53.8 },
    { code: "SA", name: "Saudi Arabia", lat: 23.9, lng: 45.1 },
    { code: "ZA", name: "South Africa", lat: -30.6, lng: 22.9 },
    { code: "NG", name: "Nigeria", lat: 9.1, lng: 8.7 },
    { code: "EG", name: "Egypt", lat: 26.8, lng: 30.8 },
    { code: "IR", name: "Iran", lat: 32.4, lng: 53.7 },
    { code: "IN", name: "India", lat: 20.6, lng: 78.9 },
    { code: "CN", name: "China", lat: 35.9, lng: 104.2 },
    { code: "KP", name: "North Korea", lat: 40.3, lng: 127.5 },
    { code: "JP", name: "Japan", lat: 36.2, lng: 138.3 },
    { code: "KR", name: "South Korea", lat: 35.9, lng: 127.8 },
    { code: "SG", name: "Singapore", lat: 1.35, lng: 103.8 },
    { code: "ID", name: "Indonesia", lat: -0.8, lng: 113.9 },
    { code: "VN", name: "Vietnam", lat: 14.1, lng: 108.3 },
    { code: "AU", name: "Australia", lat: -25.3, lng: 133.8 },
    { code: "NZ", name: "New Zealand", lat: -40.9, lng: 174.9 },
    { code: "TW", name: "Taiwan", lat: 23.7, lng: 121.0 },
  ];

  const COUNTRY_BY_CODE = Object.fromEntries(COUNTRIES.map((country) => [country.code, country]));

  const TARGET_CODES = [
    "US", "US", "US", "GB", "GB", "DE", "DE", "JP", "JP",
    "SG", "SG", "AU", "CA", "FR", "NL", "KR", "IN", "BR",
    "AE", "SE", "CH", "IL", "TW", "PL", "ZA",
  ];

  const TARGET_COUNTRIES = TARGET_CODES.map((code) => COUNTRY_BY_CODE[code]).filter(Boolean);

  const ATTACK_TYPES = [
    {
      name: "DDoS",
      weight: 24,
      color: "#4de8ff",
      ports: [443, 80, 53],
      severities: ["low", "medium", "medium", "high", "high", "critical"],
      statuses: ["MITIGATED", "BLOCKED", "MITIGATED", "INVESTIGATING"],
      vector: "UDP amplification",
      volumetric: true,
    },
    {
      name: "Malware",
      weight: 18,
      color: "#ff6ad5",
      ports: [443, 8080],
      severities: ["medium", "medium", "high", "high", "critical"],
      statuses: ["QUARANTINED", "CONTAINED", "INVESTIGATING", "QUARANTINED"],
      vector: "Trojan dropper",
    },
    {
      name: "Ransomware",
      weight: 12,
      color: "#ff4d6d",
      ports: [445, 3389],
      severities: ["high", "high", "critical", "critical"],
      statuses: ["CONTAINED", "BLOCKED", "INVESTIGATING"],
      vector: "AES-256 payload",
    },
    {
      name: "Phishing",
      weight: 16,
      color: "#ffc857",
      ports: [25, 587, 993],
      severities: ["low", "low", "medium", "medium", "high"],
      statuses: ["BLOCKED", "QUARANTINED", "INVESTIGATING", "BLOCKED"],
      vector: "Credential harvest",
    },
    {
      name: "SQL Injection",
      weight: 10,
      color: "#b18cff",
      ports: [3306, 5432, 1433],
      severities: ["medium", "medium", "high", "high"],
      statuses: ["BLOCKED", "MITIGATED", "INVESTIGATING"],
      vector: "UNION-based probe",
    },
    {
      name: "Zero-Day",
      weight: 6,
      color: "#ff8a4c",
      ports: [8443, 443],
      severities: ["high", "critical", "critical"],
      statuses: ["INVESTIGATING", "CONTAINED", "INVESTIGATING"],
      vector: "CVE-2026-1337",
    },
    {
      name: "Brute Force",
      weight: 8,
      color: "#5dffa8",
      ports: [22, 3389, 21],
      severities: ["low", "medium", "medium", "high"],
      statuses: ["BLOCKED", "MITIGATED", "BLOCKED"],
      vector: "SSH credential spray",
    },
    {
      name: "Botnet",
      weight: 6,
      color: "#5e9bff",
      ports: [6667, 8080, 8443],
      severities: ["medium", "medium", "high", "critical"],
      statuses: ["MITIGATED", "CONTAINED", "INVESTIGATING"],
      vector: "C2 beacon traffic",
    },
  ];

  const SOC_HUBS = [
    { lat: 38.9, lng: -77.0 },
    { lat: 51.5, lng: -0.1 },
    { lat: 50.1, lng: 8.7 },
    { lat: 1.35, lng: 103.8 },
    { lat: 35.7, lng: 139.7 },
    { lat: -33.9, lng: 151.2 },
    { lat: -23.5, lng: -46.6 },
    { lat: 19.1, lng: 72.9 },
  ];

  const TARGET_WEIGHT_TOTAL = ATTACK_TYPES.reduce((sum, type) => sum + type.weight, 0);

  /* ========================================================================
     STATE + ELEMENTS
     ===================================================================== */

  const sim = {
    paused: false,
    attacks: [],
    detected: 0,
    mitigated: 0,
    critical: 0,
    seq: 0,
    recentScores: [],
    startedAt: Date.now(),
    map: null,
    ctx: null,
    width: 0,
    height: 0,
    dpr: 1,
  };

  const el = {
    statDetected: document.getElementById("statDetected"),
    statBlocked: document.getElementById("statBlocked"),
    statCritical: document.getElementById("statCritical"),
    threatLevel: document.getElementById("threatLevel"),
    utcClock: document.getElementById("utcClock"),
    pauseBtn: document.getElementById("pauseBtn"),
    pauseLabel: document.getElementById("pauseLabel"),
    livePill: document.getElementById("livePill"),
    liveLabel: document.getElementById("liveLabel"),
    feedSeq: document.getElementById("feedSeq"),
    sessionTimer: document.getElementById("sessionTimer"),
    feed: document.getElementById("attackFeed"),
    feedEmpty: document.getElementById("feedEmpty"),
    latencyValue: document.getElementById("latencyValue"),
    mapPanel: document.getElementById("mapPanel"),
    mapEl: document.getElementById("map"),
    canvas: document.getElementById("attackCanvas"),
    mapCoords: document.getElementById("mapCoords"),
    mapError: document.getElementById("mapError"),
    terminalLog: document.getElementById("terminalLog"),
    clearTerminal: document.getElementById("clearTerminal"),
    streamState: document.getElementById("streamState"),
  };

  /* ========================================================================
     BOOT
     ===================================================================== */

  init();

  function init() {
    startClock();
    startSessionTimer();
    initTerminal();
    initMap();
    initCanvas();
    bindControls();

    CONFIG.initialDelays.forEach((delay) => window.setTimeout(spawnAttack, delay));
    window.setInterval(spawnAttack, CONFIG.attackInterval);
    window.setInterval(updateLatency, 4200);
    window.setInterval(() => {
      if (!sim.paused) {
        log("INFO", `sensor mesh heartbeat ok · nodes=128 · jitter=${Math.floor(rand(8, 25))}ms`);
      }
    }, 15000);

    updateLatency();
  }

  /* ========================================================================
     MAP
     ===================================================================== */

  function initMap() {
    if (!window.L) {
      if (el.mapError) el.mapError.hidden = false;
      log("WARN", "Leaflet failed to load — map rendering is offline.");
      return;
    }

    const map = L.map("map", {
      center: CONFIG.mapCenter,
      zoom: CONFIG.mapZoom,
      minZoom: 2,
      maxZoom: 6,
      zoomSnap: 0.5,
      zoomDelta: 0.5,
      worldCopyJump: true,
      zoomControl: false,
      attributionControl: true,
    });

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          'Tiles &copy; <a href="https://www.esri.com/">Esri</a> &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
        maxZoom: 16,
        zIndex: 1,
      }
    ).addTo(map);

    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
      {
        maxZoom: 16,
        zIndex: 2,
      }
    ).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    SOC_HUBS.forEach((hub) => {
      L.circleMarker([hub.lat, hub.lng], {
        radius: 2.4,
        color: "#59f3d4",
        weight: 1,
        opacity: 0.55,
        fillColor: "#59f3d4",
        fillOpacity: 0.22,
        interactive: false,
      }).addTo(map);
    });

    map.on("mousemove", (event) => {
      if (el.mapCoords) {
        el.mapCoords.textContent = formatLatLng(event.latlng.lat, event.latlng.lng);
      }
    });

    map.on("mouseout", () => {
      if (el.mapCoords) el.mapCoords.textContent = "LAT 22.00°N · LON 10.00°E";
    });

    sim.map = map;
    window.setTimeout(() => map.invalidateSize({ animate: false }), 250);
  }

  function formatLatLng(lat, lng) {
    const latText = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? "N" : "S"}`;
    const lngText = `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? "E" : "W"}`;
    return `LAT ${latText} · LON ${lngText}`;
  }

  /* ========================================================================
     CANVAS
     ===================================================================== */

  function initCanvas() {
    const ctx = el.canvas.getContext("2d");
    if (!ctx) return;

    sim.ctx = ctx;
    resizeCanvas();

    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(() => {
        resizeCanvas();
        if (sim.map) sim.map.invalidateSize({ animate: false });
      });
      observer.observe(el.mapPanel);
    } else {
      window.addEventListener("resize", () => {
        resizeCanvas();
        if (sim.map) sim.map.invalidateSize({ animate: false });
      });
    }

    requestAnimationFrame(renderFrame);
  }

  function resizeCanvas() {
    if (!sim.ctx || !el.mapPanel || !el.canvas) return;

    const rect = el.mapPanel.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    sim.width = rect.width;
    sim.height = rect.height;
    sim.dpr = dpr;

    el.canvas.width = Math.max(1, Math.round(rect.width * dpr));
    el.canvas.height = Math.max(1, Math.round(rect.height * dpr));
    el.canvas.style.width = `${rect.width}px`;
    el.canvas.style.height = `${rect.height}px`;

    sim.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function renderFrame(now) {
    if (!sim.ctx) return;

    sim.ctx.clearRect(0, 0, sim.width, sim.height);

    if (sim.map && sim.attacks.length) {
      sim.ctx.save();
      sim.ctx.globalCompositeOperation = "lighter";

      for (let index = sim.attacks.length - 1; index >= 0; index -= 1) {
        const attack = sim.attacks[index];
        const age = now - attack.createdAt;

        if (age >= attack.ttl) {
          sim.attacks.splice(index, 1);
          continue;
        }

        drawAttack(attack, age);
      }

      sim.ctx.restore();
    }

    requestAnimationFrame(renderFrame);
  }

  function drawAttack(attack, age) {
    if (!sim.map) return;

    const ctx = sim.ctx;
    const from = sim.map.latLngToContainerPoint([attack.source.lat, attack.source.lng]);
    const to = sim.map.latLngToContainerPoint([attack.target.lat, attack.target.lng]);
    const control = arcControl(from, to);

    const growth = easeOutCubic(clamp(age / 850, 0, 1));
    const fade =
      age <= 2350 ? 1 : clamp(1 - (age - 2350) / (attack.ttl - 2350), 0, 1);

    if (fade <= 0) return;

    const head = growth;
    const tail = Math.max(0, head - 0.34);
    const color = attack.color;

    // Ghost path for the full route.
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.quadraticCurveTo(control.x, control.y, to.x, to.y);
    ctx.strokeStyle = rgba(color, 0.16 * fade);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Animated glowing trail.
    const points = [];
    const segments = 32;
    for (let index = 0; index <= segments; index += 1) {
      const t = tail + (head - tail) * (index / segments);
      points.push(quadraticPoint(from, control, to, t));
    }

    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = rgba(color, 0.92 * fade);
    ctx.lineWidth = attack.severity === "critical" ? 2.2 : 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner hot core.
    ctx.beginPath();
    points.forEach((point, index) => {
      if (index === 0) ctx.moveTo(point.x, point.y);
      else ctx.lineTo(point.x, point.y);
    });
    ctx.strokeStyle = rgba("#ffffff", 0.45 * fade);
    ctx.lineWidth = 0.55;
    ctx.stroke();

    const headPoint = quadraticPoint(from, control, to, head);

    // Glowing packet head.
    const headGlow = ctx.createRadialGradient(
      headPoint.x,
      headPoint.y,
      0,
      headPoint.x,
      headPoint.y,
      16
    );
    headGlow.addColorStop(0, rgba("#ffffff", 0.9 * fade));
    headGlow.addColorStop(0.24, rgba(color, 0.72 * fade));
    headGlow.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = headGlow;
    ctx.beginPath();
    ctx.arc(headPoint.x, headPoint.y, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = rgba("#ffffff", 0.95 * fade);
    ctx.beginPath();
    ctx.arc(headPoint.x, headPoint.y, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Source pulse.
    ctx.fillStyle = rgba(color, 0.55 * fade);
    ctx.beginPath();
    ctx.arc(from.x, from.y, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = rgba(color, 0.3 * fade);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(from.x, from.y, 4.5 + Math.sin(age / 220) * 1.6, 0, Math.PI * 2);
    ctx.stroke();

    // Impact rings at the target once the arc lands.
    if (head > 0.96) {
      const impactAge = age - 850;
      if (impactAge > 0) {
        for (let ring = 0; ring < 2; ring += 1) {
          const local = impactAge - ring * 260;
          if (local <= 0) continue;

          const progress = clamp(local / 1150, 0, 1);
          const radius = 5 + progress * 32;
          const alpha = (1 - progress) * 0.55 * fade;

          if (alpha <= 0) continue;

          ctx.strokeStyle = rgba(color, alpha);
          ctx.lineWidth = Math.max(0.4, 1.4 - progress);
          ctx.beginPath();
          ctx.arc(to.x, to.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
  }

  function arcControl(from, to) {
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.hypot(dx, dy) || 1;

    let nx = -dy / distance;
    let ny = dx / distance;

    // Keep the arc bowing toward the top of the map.
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
    }

    if (Math.abs(ny) < 0.12) {
      nx = 1;
      ny = -0.45;
      const norm = Math.hypot(nx, ny);
      nx /= norm;
      ny /= norm;
    }

    const bend = clamp(distance * 0.24, 28, 120);

    return {
      x: midX + nx * bend,
      y: midY + ny * bend,
    };
  }

  function quadraticPoint(from, control, to, t) {
    const inverse = 1 - t;
    return {
      x: inverse * inverse * from.x + 2 * inverse * t * control.x + t * t * to.x,
      y: inverse * inverse * from.y + 2 * inverse * t * control.y + t * t * to.y,
    };
  }

  function rgba(hex, alpha) {
    const value = hex.replace("#", "");
    const red = parseInt(value.slice(0, 2), 16);
    const green = parseInt(value.slice(2, 4), 16);
    const blue = parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  function easeOutCubic(value) {
    return 1 - Math.pow(1 - value, 3);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  /* ========================================================================
     ATTACK GENERATION
     ===================================================================== */

  function spawnAttack() {
    if (sim.paused) return;

    const source = pick(COUNTRIES);
    let target = pick(TARGET_COUNTRIES);
    let attempts = 0;

    while (target.code === source.code && attempts < 16) {
      target = pick(TARGET_COUNTRIES);
      attempts += 1;
    }

    if (target.code === source.code) {
      target = COUNTRIES.find((country) => country.code !== source.code);
    }

    const type = weightedPick(ATTACK_TYPES, TARGET_WEIGHT_TOTAL);
    const severity = pick(type.severities);
    const status = pick(type.statuses);
    const port = pick(type.ports);

    sim.seq += 1;

    const attack = {
      id: `ATK-${sim.seq.toString(16).toUpperCase().padStart(4, "0")}`,
      source,
      target,
      type,
      severity,
      status,
      port,
      vector: buildVector(type),
      timestamp: new Date().toISOString().slice(11, 19),
      color: SEVERITY[severity].color,
      createdAt: performance.now(),
      ttl: CONFIG.arcTtl,
    };

    sim.attacks.push(attack);

    if (sim.attacks.length > 24) {
      sim.attacks.shift();
    }

    updateStats(attack);
    renderFeedCard(attack);
    updateThreatLevel();
    logAttack(attack);
  }

  function buildVector(type) {
    if (type.volumetric) {
      return `${type.vector} · ${Math.floor(rand(120, 960))} Gbps`;
    }
    return type.vector;
  }

  function updateStats(attack) {
    sim.detected += 1;

    if (attack.status !== "INVESTIGATING") {
      sim.mitigated += 1;
    }

    if (attack.severity === "critical") {
      sim.critical += 1;
    }

    sim.recentScores.push(SEVERITY[attack.severity].score);
    if (sim.recentScores.length > 10) sim.recentScores.shift();

    el.statDetected.textContent = String(sim.detected).padStart(4, "0");
    el.statBlocked.textContent = String(sim.mitigated).padStart(4, "0");
    el.statCritical.textContent = String(sim.critical).padStart(2, "0");
    el.feedSeq.textContent = String(sim.seq).padStart(4, "0");
  }

  function updateThreatLevel() {
    if (!el.threatLevel) return;

    let level = "guarded";

    if (sim.recentScores.length) {
      const average =
        sim.recentScores.reduce((sum, value) => sum + value, 0) / sim.recentScores.length;

      if (average >= 3.35) level = "severe";
      else if (average >= 2.8) level = "high";
      else if (average >= 2.2) level = "elevated";
      else if (average >= 1.6) level = "guarded";
      else level = "low";
    }

    const label = level.toUpperCase();
    if (el.threatLevel.textContent !== label) {
      el.threatLevel.textContent = label;
      el.threatLevel.dataset.level = level;
    }
  }

  /* ========================================================================
     FEED + TERMINAL
     ===================================================================== */

  function renderFeedCard(attack) {
    if (el.feedEmpty && el.feedEmpty.isConnected) {
      el.feedEmpty.remove();
    }

    const card = document.createElement("article");
    card.className = `attack-card attack-card--${attack.severity}`;
    card.style.setProperty("--sev", attack.color);
    card.title = `${attack.id} · ${attack.type.name} · ${attack.source.name} to ${attack.target.name} · port ${attack.port}`;

    const statusClass =
      attack.status === "INVESTIGATING"
        ? " status--investigating"
        : attack.status === "CONTAINED"
          ? " status--contained"
          : "";

    card.innerHTML = `
      <div class="attack-top">
        <span class="attack-id">${attack.id}</span>
        <span class="attack-time">${attack.timestamp} UTC</span>
        <span class="sev-tag">${SEVERITY[attack.severity].label}</span>
      </div>
      <div class="attack-route">
        <span class="country">
          <span class="code-badge">${attack.source.code}</span>
          <span class="country-name">${attack.source.name}</span>
        </span>
        <span class="route-arrow">&#8594;</span>
        <span class="country">
          <span class="code-badge">${attack.target.code}</span>
          <span class="country-name">${attack.target.name}</span>
        </span>
      </div>
      <div class="attack-meta">
        <span class="type-tag" style="--type: ${attack.type.color}">${attack.type.name}</span>
        <span class="attack-vector">${attack.vector}</span>
        <span class="status${statusClass}">${attack.status}</span>
      </div>
    `;

    el.feed.prepend(card);

    const cards = el.feed.querySelectorAll(".attack-card");
    if (cards.length > CONFIG.maxFeedItems) {
      cards[cards.length - 1].remove();
    }
  }

  function logAttack(attack) {
    log(
      "ALERT",
      `${attack.id} ${attack.type.name.padEnd(11)} ${attack.source.code} -> ${attack.target.code} :${attack.port} | ${attack.status}`
    );

    if (attack.severity === "critical") {
      window.setTimeout(() => {
        if (!sim.paused) {
          log("WARN", `Critical severity confirmed for ${attack.id} — incident escalation queued.`);
        }
      }, 420);
    }
  }

  function initTerminal() {
    const bootMessages = [
      ["SYS", "SENTINEL SOC v2.4.1 // initializing sensor mesh"],
      ["INFO", "GeoIP database loaded — 249 regions indexed"],
      ["INFO", "Threat intelligence feed connected (TLS 1.3)"],
      ["OK", "Canvas renderer online — requestAnimationFrame active"],
      ["WARN", "SIMULATION MODE — no production traffic is processed"],
    ];

    bootMessages.forEach(([level, message], index) => {
      window.setTimeout(() => log(level, message), 250 + index * 320);
    });
  }

  function log(level, message) {
    if (!el.terminalLog) return;

    const shouldStick =
      el.terminalLog.scrollHeight - el.terminalLog.scrollTop - el.terminalLog.clientHeight < 36;

    const line = document.createElement("div");
    line.className = "log-line";
    line.innerHTML = `
      <span class="log-time">${timestamp()}</span>
      <span class="log-level log-level--${level.toLowerCase()}">[${level}]</span>
      <span class="log-msg">${escapeHtml(message)}</span>
    `;

    el.terminalLog.appendChild(line);

    while (el.terminalLog.children.length > CONFIG.maxTerminalLines) {
      el.terminalLog.firstElementChild.remove();
    }

    if (shouldStick) {
      el.terminalLog.scrollTop = el.terminalLog.scrollHeight;
    }
  }

  function timestamp() {
    return new Date().toISOString().slice(11, 23);
  }

  function escapeHtml(value) {
    return String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character]
    );
  }

  /* ========================================================================
     CLOCK + TIMERS
     ===================================================================== */

  function startClock() {
    const tick = () => {
      if (el.utcClock) el.utcClock.textContent = new Date().toISOString().slice(11, 19);
    };
    tick();
    window.setInterval(tick, 1000);
  }

  function startSessionTimer() {
    const tick = () => {
      if (!el.sessionTimer) return;
      const elapsed = Math.floor((Date.now() - sim.startedAt) / 1000);
      const hours = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const seconds = String(elapsed % 60).padStart(2, "0");
      el.sessionTimer.textContent = `${hours}:${minutes}:${seconds}`;
    };
    tick();
    window.setInterval(tick, 1000);
  }

  function updateLatency() {
    if (el.latencyValue) {
      el.latencyValue.textContent = `${Math.floor(rand(16, 44))}ms`;
    }
  }

  /* ========================================================================
     CONTROLS
     ===================================================================== */

  function bindControls() {
    if (el.pauseBtn) {
      el.pauseBtn.addEventListener("click", () => setPaused(!sim.paused));
    }

    if (el.clearTerminal) {
      el.clearTerminal.addEventListener("click", () => {
        el.terminalLog.innerHTML = "";
        log("SYS", "Log buffer cleared by operator.");
      });
    }
  }

  function setPaused(paused) {
    sim.paused = paused;

    el.pauseBtn.classList.toggle("is-paused", paused);
    el.pauseBtn.setAttribute("aria-pressed", String(paused));
    el.pauseLabel.textContent = paused ? "RESUME" : "PAUSE";

    el.livePill.classList.toggle("is-paused", paused);
    el.liveLabel.textContent = paused ? "PAUSED" : "LIVE";

    el.streamState.classList.toggle("is-paused", paused);
    el.streamState.innerHTML = `<span class="live-dot"></span>${paused ? "PAUSED" : "STREAMING"}`;

    log("SYS", paused ? "Simulation paused by operator." : "Simulation resumed — feed online.");
  }

  /* ========================================================================
     RANDOM HELPERS
     ===================================================================== */

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function weightedPick(list, totalWeight) {
    let roll = Math.random() * totalWeight;

    for (const item of list) {
      roll -= item.weight;
      if (roll <= 0) return item;
    }

    return list[list.length - 1];
  }
})();
