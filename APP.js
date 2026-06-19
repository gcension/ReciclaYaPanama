/* ══════════════════════════════════════════
   ReciclaYa Panamá — app.js
   ══════════════════════════════════════════ */

const POINTS = [
  {id:1,  n:"Punto Limpio Casco Antiguo",       t:"municipal", tn:"Municipal", a:"Av. Central, Casco Antiguo",          c:"Municipio – Basura Cero",      h:"Lun–Sáb 7am–5pm",  lat:8.9537, lng:-79.5347, m:["plastico","papel","vidrio","tetrapak"]},
  {id:2,  n:"Punto Limpio Marbella",            t:"municipal", tn:"Municipal", a:"Calle 53 Este, Marbella",             c:"Alcaldía de Panamá",            h:"Lun–Vie 8am–4pm",  lat:8.9895, lng:-79.5162, m:["plastico","papel"]},
  {id:3,  n:"Punto Limpio Bella Vista",         t:"municipal", tn:"Municipal", a:"Av. Belisario Porras, Bella Vista",   c:"Tel: 500-0000",                 h:"Lun–Sáb 7am–6pm",  lat:8.9920, lng:-79.5263, m:["plastico","papel","vidrio"]},
  {id:4,  n:"Recicla Panamá – Electrónicos",    t:"empresa",   tn:"Empresa",   a:"Zona Industrial, Juan Díaz",          c:"reciclapanama.net",             h:"Lun–Vie 8am–5pm",  lat:9.0263, lng:-79.4537, m:["electronico","metal","plastico"]},
  {id:5,  n:"Centro de Acopio CAPAC",           t:"empresa",   tn:"Empresa",   a:"Ave. Ricardo J. Alfaro",              c:"capac.org | 226-0000",          h:"Lun–Vie 7:30am–4:30pm", lat:9.0135, lng:-79.5023, m:["metal","plastico","papel","tetrapak"]},
  {id:6,  n:"Punto Limpio El Cangrejo",         t:"municipal", tn:"Municipal", a:"Calle 49 B, El Cangrejo",             c:"Alcaldía de Panamá",            h:"Mar–Dom 8am–4pm",  lat:8.9958, lng:-79.5197, m:["plastico","papel","vidrio","tetrapak"]},
  {id:8,  n:"Punto Limpio San Miguelito",       t:"municipal", tn:"Municipal", a:"Plaza Mayor, San Miguelito",          c:"Municipio de San Miguelito",    h:"Lun–Vie 8am–5pm",  lat:9.0587, lng:-79.4724, m:["plastico","papel","tetrapak"]},
  {id:9,  n:"EcoVidrio Panamá",                 t:"empresa",   tn:"Empresa",   a:"Transistmica km 5",                   c:"Tel: 269-0000",                 h:"Lun–Sáb 7am–3pm",  lat:9.0382, lng:-79.5069, m:["vidrio","plastico"]},
  {id:10, n:"Programa Escuelas Verdes UTP",     t:"programa",  tn:"Programa",  a:"Campus UTP, Av. Central",             c:"utp.ac.pa",                     h:"Lun–Vie 8am–4pm",  lat:8.9913, lng:-79.5380, m:["papel","plastico","electronico"]},
  {id:11, n:"Punto Limpio Betania",             t:"municipal", tn:"Municipal", a:"Plaza Betania, Bethania",             c:"Alcaldía de Panamá",            h:"Mar–Dom 7am–5pm",  lat:9.0031, lng:-79.5389, m:["plastico","papel","vidrio"]},
  {id:13, n:"Punto Limpio Vía España",          t:"municipal", tn:"Municipal", a:"Vía España c/ Calle 55",              c:"Basura Cero",                   h:"Lun–Dom 7am–6pm",  lat:8.9952, lng:-79.5140, m:["plastico","papel","tetrapak","vidrio"]},
  {id:14, n:"GreenCycle Electronics",           t:"empresa",   tn:"Empresa",   a:"Ciudad del Saber, Clayton",           c:"greencycle.pa",                 h:"Lun–Vie 9am–5pm",  lat:8.9878, lng:-79.5617, m:["electronico","metal","plastico"]},
  {id:15, n:"Punto Limpio Albrook",             t:"municipal", tn:"Municipal", a:"Mall Albrook, entrada principal",     c:"Alcaldía de Panamá",            h:"Lun–Dom 9am–8pm",  lat:8.9862, lng:-79.5493, m:["plastico","papel","vidrio","tetrapak"]},
  {id:17, n:"Programa Basura Cero Arraiján",    t:"programa",  tn:"Programa",  a:"Parque municipal, Arraiján",          c:"Municipio de Arraiján",         h:"Jue–Dom 8am–2pm",  lat:8.9512, lng:-79.6831, m:["plastico","papel","vidrio"]},
];

const TAG_CLASS  = {plastico:"tp", papel:"tpa", vidrio:"tv", metal:"tm", electronico:"te", tetrapak:"tt"};
const TAG_LABEL  = {plastico:"Plástico", papel:"Papel", vidrio:"Vidrio", metal:"Metal", electronico:"Electrónico", tetrapak:"Tetrapak"};
const TYPE_CLASS = {municipal:"tb-m", empresa:"tb-e", programa:"tb-p"};

/* ══════════════════════════════════════════
   MAP
   ══════════════════════════════════════════ */
let map, markers = [], activeFilter = "todos", selectedId = null;

function initMap() {
  map = L.map("map", {zoomControl: true}).setView([9.0, -79.5], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {attribution:"© OpenStreetMap", maxZoom:19}).addTo(map);
  renderMap();

  const consent = localStorage.getItem("rya_geo_consent");
  if (consent === "granted") {
    locateUser();
  } else if (consent === null) {
    setTimeout(() => document.getElementById("consentBanner").classList.add("show"), 1200);
  }
}

function makeIcon(t) {
  const c = {municipal:"#185FA5", empresa:"#c47a00", programa:"#0d3d1c"}[t] || "#155c2a";
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${c};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.3)"></div>`,
    iconSize: [16, 16], iconAnchor: [8, 8]
  });
}

function getFiltered() {
  const q = document.getElementById("heroSearch").value.toLowerCase();
  return POINTS.filter(p => {
    const m   = activeFilter === "todos" || p.m.includes(activeFilter);
    const txt = !q || p.n.toLowerCase().includes(q) || p.a.toLowerCase().includes(q)
                || p.m.some(x => TAG_LABEL[x]?.toLowerCase().includes(q));
    return m && txt;
  });
}

function renderMap() {
  markers.forEach(x => map.removeLayer(x));
  markers = [];
  const filtered = getFiltered();
  document.getElementById("cntBadge").textContent = filtered.length;
  const list = document.getElementById("plist");
  list.innerHTML = "";

  filtered.forEach(p => {
    const mk = L.marker([p.lat, p.lng], {icon: makeIcon(p.t)}).addTo(map);
    mk.on("click", () => openPanel(p));
    markers.push(mk);

    const card = document.createElement("div");
    card.className = "pcard" + (selectedId === p.id ? " sel" : "");
    card.id = "pc" + p.id;
    card.innerHTML = `
      <div class="pcard-top">
        <h4>${p.n}</h4>
        <span class="tb ${TYPE_CLASS[p.t]}">${p.tn}</span>
      </div>
      <p class="paddr">📍 ${p.a}</p>
      <div class="ptags">${p.m.map(x => `<span class="tag ${TAG_CLASS[x]}">${TAG_LABEL[x]}</span>`).join("")}</div>`;
    card.onclick = () => { map.flyTo([p.lat, p.lng], 15); openPanel(p); };
    list.appendChild(card);
  });
}

function openPanel(p) {
  selectedId = p.id;
  document.querySelectorAll(".pcard").forEach(c => c.classList.remove("sel"));
  const c = document.getElementById("pc" + p.id);
  if (c) { c.classList.add("sel"); c.scrollIntoView({behavior:"smooth", block:"nearest"}); }
  document.getElementById("ip-n").textContent = p.n;
  document.getElementById("ip-t").textContent = p.tn;
  document.getElementById("ip-a").textContent = p.a;
  document.getElementById("ip-c").textContent = p.c;
  document.getElementById("ip-h").textContent = p.h;
  document.getElementById("ip-m").innerHTML = p.m.map(x => `<span class="tag ${TAG_CLASS[x]}">${TAG_LABEL[x]}</span>`).join("");
  document.getElementById("ip-link").href = `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`;
  document.getElementById("infoPanel").classList.add("vis");
}

function closePanel() {
  document.getElementById("infoPanel").classList.remove("vis");
  selectedId = null;
  document.querySelectorAll(".pcard").forEach(c => c.classList.remove("sel"));
}

function setFilter(f, el) {
  activeFilter = f;
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("on"));
  el.classList.add("on");
  renderMap();
}

function doSearch() { renderMap(); }

/* ══════════════════════════════════════════
   BINS GUIDE
   ══════════════════════════════════════════ */
const openBins = {};

function toggleBin(id) {
  if (openBins[id]) {
    openBins[id] = false;
    document.getElementById("detail-" + id).classList.remove("vis");
    document.querySelectorAll(".bin").forEach(b => b.classList.remove("open"));
  } else {
    Object.keys(openBins).forEach(k => {
      openBins[k] = false;
      const d = document.getElementById("detail-" + k);
      if (d) d.classList.remove("vis");
    });
    openBins[id] = true;
    document.querySelectorAll(".bin").forEach(b => b.classList.remove("open"));
    document.querySelector(".bin-" + id + ":not(.bin-detail)").classList.add("open");
    document.getElementById("detail-" + id).classList.add("vis");
  }
}

/* ══════════════════════════════════════════
   CALCULATOR
   ══════════════════════════════════════════ */
function calcImpact() {
  const sliders = document.querySelectorAll(".ci input[type=range]");
  const vals = Array.from(sliders).map(s => +s.value);
  ["v1","v2","v3","v4","v5"].forEach((id, i) => document.getElementById(id).textContent = vals[i]);

  const co2  = Math.round((vals[0]*52*0.082) + (vals[1]*52*0.94)  + (vals[2]*52*0.315) + (vals[3]*52*5.07)  + (vals[4]*17.5));
  const agua = Math.round((vals[0]*52*2)     + (vals[1]*52*17)    + (vals[2]*52*0.3)   + (vals[3]*52*8)     + (vals[4]*260));
  const kg   = Math.round((vals[0]*52*0.025) + (vals[1]*52)       + (vals[2]*52*0.4)   + (vals[3]*52*0.015) + (vals[4]*0.4));

  document.getElementById("rCO2").textContent   = co2.toLocaleString()  + " kg";
  document.getElementById("rCO2eq").textContent = `≈ ${Math.round(co2/0.196)} km en carro evitados`;
  document.getElementById("rAgua").textContent  = agua.toLocaleString() + " L";
  document.getElementById("rAguaEq").textContent= `≈ ${Math.round(agua/200)} duchas de 10 min`;
  document.getElementById("rKg").textContent    = kg.toLocaleString()   + " kg";
  document.getElementById("rKgEq").textContent  = `≈ ${(kg/1000).toFixed(2)} toneladas al año`;

  const pct = Math.min(100, Math.round((co2/400)*100));
  document.getElementById("rBar").style.width = pct + "%";
  const level = pct < 25 ? "Principiante" : pct < 50 ? "En camino" : pct < 75 ? "Reciclador activo" : "Súper reciclador";
  document.getElementById("rLevel").textContent = level;
}

/* ══════════════════════════════════════════
   INTEGRITY SYSTEM (SHA-256 / Merkle-like)
   ══════════════════════════════════════════ */
let _pointHashes = {}, _expectedRoot = null, _tamperedId = null, _originalPoint = null;

function pointCanonical(p) {
  return [p.id, p.n, p.lat, p.lng, p.m.slice().sort().join(",")].join("|");
}

async function sha256(msg) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

async function hashPoint(p)            { return sha256(pointCanonical(p)); }
async function computeRootHash(points) {
  const hashes = await Promise.all(points.map(p => hashPoint(p)));
  return sha256(hashes.join(""));
}

async function initIntegrity() {
  for (const p of POINTS) { _pointHashes[p.id] = await hashPoint(p); }
  _expectedRoot = await computeRootHash(POINTS);
  await runIntegrityCheck();
}

async function runIntegrityCheck() {
  const bar    = document.getElementById("integrityBar");
  const icon   = document.getElementById("isbIcon");
  const title  = document.getElementById("isbTitle");
  const desc   = document.getElementById("isbDesc");
  const rootEl = document.getElementById("isbRootHash");
  const rows   = document.getElementById("auditRows");

  if (!bar) return; // Validación de seguridad por si no se ha cargado el módulo administrativo

  icon.textContent = "⏳"; title.textContent = "Verificando…"; bar.className = "integrity-status-bar";

  const currentRoot = await computeRootHash(POINTS);
  const rootOk = currentRoot === _expectedRoot;
  let tamperedCount = 0, rowsHTML = "";

  for (const p of POINTS) {
    const currentHash = await hashPoint(p);
    const ok = currentHash === _pointHashes[p.id];
    if (!ok) tamperedCount++;
    rowsHTML += `
      <div class="audit-row${ok ? "" : " tampered"}" id="ar-${p.id}">
        <span class="ar-id">#${String(p.id).padStart(2,"0")}</span>
        <span class="ar-name">${p.n}</span>
        <span class="ar-hash${ok ? "" : " bad"}" title="${currentHash}">${currentHash.substring(0,14)}…${currentHash.substring(58)}</span>
        <span class="ar-badge ${ok ? "ar-ok" : "ar-fail"}">${ok ? "✓ OK" : "✕ ALTERADO"}</span>
      </div>`;
  }
  rows.innerHTML = rowsHTML;

  if (rootOk) {
    bar.className = "integrity-status-bar ok";
    title.textContent = "Base de datos íntegra — " + POINTS.length + " registros verificados";
    desc.textContent  = "Todos los hashes coinciden con los valores esperados. No se detectaron manipulaciones.";
    rootEl.className  = "isb-hash";
    rootEl.textContent = "Hash raíz: " + _expectedRoot;
    document.getElementById("btnTamper").style.display  = "inline-block";
    document.getElementById("btnRestore").style.display = "none";
  } else {
    bar.className = "integrity-status-bar fail";
    title.textContent = "¡ALERTA! Se detectaron " + tamperedCount + " registro(s) alterado(s)";
    desc.textContent  = "El hash raíz no coincide. Los registros marcados en rojo fueron modificados.";
    rootEl.className  = "isb-hash bad";
    rootEl.textContent = "Hash raíz esperado:  " + _expectedRoot + "\nHash raíz calculado: " + currentRoot;
    document.getElementById("btnTamper").style.display  = "none";
    document.getElementById("btnRestore").style.display = "inline-block";
    const firstBad = document.querySelector(".audit-row.tampered");
    if (firstBad) setTimeout(() => firstBad.scrollIntoView({behavior:"smooth", block:"center"}), 300);
    showIntegrityAlert();
  }
}

function showIntegrityAlert() {
  if (document.getElementById("integrityMapAlert")) return;
  const banner = document.createElement("div");
  banner.id = "integrityMapAlert";
  banner.style.cssText = "background:#7a0000;color:#fff;text-align:center;padding:10px 1rem;font-size:.82rem;font-weight:600;z-index:3000;position:relative;cursor:pointer";
  banner.innerHTML = "ALERTA DE INTEGRIDAD: Datos del mapa posiblemente manipulados. <u>Ver detalles</u>";
  banner.onclick = () => document.getElementById("integridad").scrollIntoView({behavior:"smooth"});
  document.getElementById("mapa").insertAdjacentElement("beforebegin", banner);
}

function simulateTamper() {
  const idx = Math.floor(Math.random() * POINTS.length);
  _tamperedId    = POINTS[idx].id;
  _originalPoint = {...POINTS[idx], m:[...POINTS[idx].m]};
  POINTS[idx].lat = parseFloat((POINTS[idx].lat + 0.0042).toFixed(6));
  POINTS[idx].n   = POINTS[idx].n + " [MODIFICADO]";
  showToast("Ataque simulado: registro #" + _tamperedId + " fue alterado");
  runIntegrityCheck();
}

function restoreData() {
  if (_tamperedId === null || !_originalPoint) return;
  const idx = POINTS.findIndex(p => p.id === _tamperedId);
  if (idx >= 0) { POINTS[idx].lat = _originalPoint.lat; POINTS[idx].n = _originalPoint.n; }
  _tamperedId = null; _originalPoint = null;
  const banner = document.getElementById("integrityMapAlert");
  if (banner) banner.remove();
  showToast("Datos restaurados correctamente");
  runIntegrityCheck();
}

/* ══════════════════════════════════════════
   PRIVACY & CONSENT
   ══════════════════════════════════════════ */
let userMarker = null;

function locateUser() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    p => {
      const lat = p.coords.latitude, lng = p.coords.longitude;
      map.setView([lat, lng], 13);
      if (userMarker) map.removeLayer(userMarker);
      userMarker = L.circleMarker([lat, lng], {radius:10, fillColor:"#2db85c", color:"#fff", weight:2.5, fillOpacity:.9})
        .addTo(map).bindTooltip("Tu ubicación (no guardada)");
    },
    () => showToast("No se pudo obtener tu ubicación"),
    {enableHighAccuracy:true, timeout:8000, maximumAge:0}
  );
}

function requestMapGeo() {
  const consent = localStorage.getItem("rya_geo_consent");
  if      (consent === "granted") locateUser();
  else if (consent === "denied")  showToast("Permiso denegado. Cámbialo en la sección Privacidad.");
  else document.getElementById("consentBanner").classList.add("show");
}

function grantConsent() {
  localStorage.setItem("rya_geo_consent", "granted");
  document.getElementById("consentBanner").classList.remove("show");
  updatePrivacyStatusBar();
  locateUser();
  showToast("Permiso concedido. Tu ubicación no se guarda.");
}

function denyConsent() {
  localStorage.setItem("rya_geo_consent", "denied");
  document.getElementById("consentBanner").classList.remove("show");
  updatePrivacyStatusBar();
  showToast("Sin problema. El mapa funciona igual sin ubicación.");
}

function revokeConsent() {
  localStorage.removeItem("rya_geo_consent");
  if (userMarker) { map.removeLayer(userMarker); userMarker = null; }
  updatePrivacyStatusBar();
  showToast("Permiso revocado. Ubicación eliminada del mapa.");
}

function updatePrivacyStatusBar() {
  const consent    = localStorage.getItem("rya_geo_consent");
  const stateEl    = document.getElementById("csbState");
  const revokeBtn  = document.getElementById("revokeBtn");
  if (!stateEl) return;
  if (consent === "granted") {
    stateEl.textContent = "Permiso concedido"; stateEl.className = "csb-state csb-granted"; revokeBtn.style.display = "inline-block";
  } else if (consent === "denied") {
    stateEl.textContent = "Permiso denegado";  stateEl.className = "csb-state csb-denied";  revokeBtn.style.display = "none";
  } else {
    stateEl.textContent = "Sin decisión aún";  stateEl.className = "csb-state";              revokeBtn.style.display = "none";
  }
}

/* ══════════════════════════════════════════
   REPORT SYSTEM
   ══════════════════════════════════════════ */
let reportGeoLat = null, reportGeoLng = null;
let pendingReports = JSON.parse(localStorage.getItem("rya_reports") || "[]");

function captureGPS() {
  const consent = localStorage.getItem("rya_geo_consent");
  const status  = document.getElementById("geo-status");
  const input   = document.getElementById("r-coords");
  status.className = "geo-status";

  if (!navigator.geolocation) { status.textContent = "GPS no disponible en este navegador."; status.className = "geo-status geo-err"; return; }
  if (consent === "denied")   { status.textContent = "Permiso denegado. Cámbialo en la sección Privacidad."; status.className = "geo-status geo-err"; return; }

  const doCapture = () => {
    status.textContent = "📡 Solicitando ubicación…";
    navigator.geolocation.getCurrentPosition(
      pos => {
        reportGeoLat = pos.coords.latitude.toFixed(6);
        reportGeoLng = pos.coords.longitude.toFixed(6);
        input.value  = reportGeoLat + ", " + reportGeoLng;
        status.textContent = "Capturadas. Solo se incluyen en este reporte si lo envías.";
        status.className   = "geo-status geo-ok";
        if (!localStorage.getItem("rya_geo_consent")) { localStorage.setItem("rya_geo_consent","granted"); updatePrivacyStatusBar(); }
        updateHash();
      },
      () => { status.textContent = "No se pudo obtener la ubicación. Intenta de nuevo."; status.className = "geo-status geo-err"; },
      {enableHighAccuracy:true, timeout:10000, maximumAge:0}
    );
  };

  if (consent === "granted") { doCapture(); }
  else {
    status.innerHTML = 'Necesitamos tu permiso. <button onclick="grantConsent();captureGPS()" style="background:var(--g5);color:var(--g1);border:none;border-radius:4px;padding:3px 10px;font-size:.78rem;font-weight:700;cursor:pointer;margin-left:4px">Permitir y continuar</button>';
  }
}

async function updateHash() {
  const n = document.getElementById("r-nombre").value.trim();
  const c = document.getElementById("r-coords").value.trim();
  if (!n || !c) { document.getElementById("hash-preview").textContent = "Completa los campos para ver el hash…"; return; }
  const ts  = Math.floor(Date.now() / 60000) * 60000;
  const raw = n + "|" + c + "|" + ts;
  const h   = await sha256(raw);
  document.getElementById("hash-preview").textContent = "SHA-256: " + h;
}

async function submitReport() {
  const nombre   = document.getElementById("r-nombre").value.trim();
  const dir      = document.getElementById("r-dir").value.trim();
  const coords   = document.getElementById("r-coords").value.trim();
  const horario  = document.getElementById("r-horario").value.trim();
  const contacto = document.getElementById("r-contacto").value.trim();
  const tipo     = document.getElementById("r-tipo").value;
  const mats     = Array.from(document.querySelectorAll(".mat-checks input:checked")).map(x => x.value);

  if (!nombre || !dir || !coords || mats.length === 0) { showToast("Completa nombre, dirección, coordenadas y al menos un material."); return; }

  const [latStr, lngStr] = coords.split(",").map(s => s.trim());
  const lat = parseFloat(latStr), lng = parseFloat(lngStr);
  if (isNaN(lat) || isNaN(lng) || lat < 7 || lat > 9.7 || lng < -83 || lng > -77) { showToast("Las coordenadas no corresponden a Panamá."); return; }

  const btn = document.getElementById("submit-btn");
  btn.disabled = true; btn.textContent = "Procesando…";

  const ts   = Date.now();
  const raw  = nombre + "|" + coords + "|" + ts;
  const hash = await sha256(raw);

  const report = { id:"RPT-"+ts, nombre, dir, lat, lng, horario, contacto, tipo, mats, ts, hash, status:"pending", submittedAt: new Date().toLocaleString("es-PA") };
  pendingReports.push(report);
  localStorage.setItem("rya_reports", JSON.stringify(pendingReports));

  document.getElementById("success-hash").textContent = "ID: " + report.id + "\nHash: " + hash;
  document.getElementById("successModal").classList.add("vis");

  ["r-nombre","r-dir","r-coords","r-horario","r-contacto"].forEach(id => { const el = document.getElementById(id); if (el) el.value = ""; });
  document.querySelectorAll(".mat-checks input").forEach(x => x.checked = false);
  document.getElementById("hash-preview").textContent = "Completa los campos para ver el hash…";
  document.getElementById("geo-status").textContent   = "";
  reportGeoLat = null; reportGeoLng = null;
  btn.disabled = false; btn.textContent = "Enviar reporte para verificación →";
}

function closeSuccessModal() { document.getElementById("successModal").classList.remove("vis"); }

/* ══════════════════════════════════════════
   ADMIN PANEL
   ══════════════════════════════════════════ */
const ADMIN_USERS = [
  { user: "Gabriela", pass: "QWER" },
  { user: "Mariam",   pass: "ASDF" },
  { user: "Daniela",  pass: "ZXCV" }
];

let adminTab = "pending";

function openAdminLogin()  { document.getElementById("loginModal").classList.add("vis"); setTimeout(() => document.getElementById("l-user").focus(), 100); }
function closeLoginModal() { document.getElementById("loginModal").classList.remove("vis"); document.getElementById("login-err").style.display = "none"; }

function doLogin() {
  const u = document.getElementById("l-user").value;
  const p = document.getElementById("l-pass").value;
  
  if (ADMIN_USERS.some(a => a.user === u && a.pass === p)) {
    closeLoginModal();
    document.getElementById("l-user").value = "";
    document.getElementById("l-pass").value = "";
    document.getElementById('integridad').style.display = '';       
    document.getElementById('nav-integridad').style.display = '';   
    openAdminPanel();
  } else {
    document.getElementById("login-err").style.display = "block";
  }
}

function openAdminPanel() {
  pendingReports = JSON.parse(localStorage.getItem("rya_reports") || "[]");
  document.getElementById("adminPanel").classList.add("vis");
  renderQueue("pending");
  updatePendBadge();
}

function closeAdmin() {
  document.getElementById("adminPanel").classList.remove("vis");
  document.getElementById('integridad').style.display = 'none';
  document.getElementById('nav-integridad').style.display = 'none';
}

function updatePendBadge() {
  const n = pendingReports.filter(r => r.status === "pending").length;
  document.getElementById("pendBadge").textContent = n + " pendiente" + (n === 1 ? "" : "s");
}

function switchTab(tab, el) {
  adminTab = tab;
  document.querySelectorAll(".atab").forEach(t => t.classList.remove("on"));
  el.classList.add("on");
  renderQueue(tab);
}

function renderQueue(tab) {
  const list = pendingReports.filter(r => r.status === tab);
  const cont = document.getElementById("queueContainer");
  if (list.length === 0) {
    const labels = {pending:"No hay reportes pendientes de revisión.", approved:"No hay puntos aprobados aún.", rejected:"No hay reportes rechazados."};
    cont.innerHTML = `<div class="empty-state">${labels[tab]}</div>`;
    return;
  }
  cont.innerHTML = list.map(r => `
    <div class="rq-card" id="card-${r.id}">
      <div class="rq-head">
        <h4>${r.nombre}</h4>
        <span class="status-badge ${r.status==="pending"?"sb-pend":r.status==="approved"?"sb-ok":"sb-no"}">${r.status==="pending"?"⏳ Pendiente":r.status==="approved"?"✅ Aprobado":"❌ Rechazado"}</span>
      </div>
      <div class="rq-body">
        <div class="rq-field"><strong>Dirección</strong>${r.dir}</div>
        <div class="rq-field"><strong>Coordenadas</strong>${r.lat}, ${r.lng}</div>
        <div class="rq-field"><strong>Tipo</strong>${r.tipo}</div>
        <div class="rq-field"><strong>Enviado</strong>${r.submittedAt}</div>
        <div class="rq-field"><strong>Materiales</strong>${r.mats.join(", ")}</div>
        <div class="rq-field"><strong>Horario</strong>${r.horario||"—"}</div>
        <div class="rq-hash"><strong style="font-size:.68rem;display:block;margin-bottom:2px;color:var(--g3)">Hash SHA-256</strong>${r.hash}</div>
        <div class="rq-qr">
          <div class="qr-canvas" id="qr-${r.id}" style="width:80px;height:80px;flex-shrink:0;border-radius:6px;overflow:hidden"></div>
          <div class="qr-info"><strong>Código QR firmado</strong>Escanea para verificar integridad.<br><span style="font-size:.72rem;color:var(--textt)">ID: ${r.id}</span></div>
        </div>
        ${r.status==="pending"?`<div class="rq-actions">
          <button class="btn-approve" onclick="decideReport('${r.id}','approved')">Aprobar y publicar en mapa</button>
          <button class="btn-reject"  onclick="decideReport('${r.id}','rejected')">Rechazar</button>
        </div>`:""}
      </div>
    </div>`).join("");
  list.forEach(r => generateQR(r));
}

function generateQR(r) {
  const container = document.getElementById("qr-" + r.id);
  if (!container) return;
  const data = JSON.stringify({id:r.id, nombre:r.nombre, lat:r.lat, lng:r.lng, hash:r.hash.substring(0,16)+"…"});
  container.innerHTML = "";
  try {
    new QRCode(container, {text:data, width:80, height:80, colorDark:"#0d3d1c", colorLight:"#ffffff", correctLevel:QRCode.CorrectLevel.M});
  } catch(e) {
    container.innerHTML = "<span style='font-size:.7rem;color:var(--textt)'>QR no disponible</span>";
  }
}

function decideReport(id, decision) {
  const idx = pendingReports.findIndex(r => r.id === id);
  if (idx < 0) return;
  pendingReports[idx].status = decision;
  if (decision === "approved") {
    const r = pendingReports[idx];
    POINTS.push({
      id: POINTS.length + 1,
      n: r.nombre, t: r.tipo, tn: {municipal:"Municipal",empresa:"Empresa",programa:"Programa"}[r.tipo],
      a: r.dir, c: r.contacto||"Reportado por comunidad", h: r.horario||"Consultar",
      lat: r.lat, lng: r.lng, m: r.mats
    });
    renderMap();
    showToast("Punto publicado en el mapa");
  } else {
    showToast("Reporte rechazado");
  }
  localStorage.setItem("rya_reports", JSON.stringify(pendingReports));
  updatePendBadge();
  renderQueue(adminTab);
}

/* ══════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════ */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 3000);
}

/* ══════════════════════════════════════════
   INIT
   ══════════════════════════════════════════ */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); });
}, {threshold: 0.12});

window.addEventListener("load", () => {
  initMap();
  calcImpact();
  
  // Nota: La invocación a renderQ() ha sido eliminada por completo.
  
  document.querySelectorAll(".fade-up").forEach(el => observer.observe(el));
  document.getElementById("heroSearch").addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
  ["r-nombre","r-dir","r-horario","r-contacto"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateHash);
  });
  updatePrivacyStatusBar();

  // Animate hero counter
  let u = 0;
  const target = 3241;
  const iv = setInterval(() => {
    u += Math.ceil((target - u) / 12);
    if (u >= target) { u = target; clearInterval(iv); }
    document.getElementById("kpiUsers").textContent = u.toLocaleString();
  }, 40);

  setTimeout(initIntegrity, 200);
});
