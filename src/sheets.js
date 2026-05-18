
function getSheetIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("sheet") || params.get("sheetId") || "";
}

const SPREADSHEET_ID = getSheetIdFromUrl() || import.meta.env.VITE_SPREADSHEET_ID || "";


export const demoData = {
  project: {
    client: "SIN CONEXIÓN - REVISAR GOOGLE SHEET",
    service: "Business Power™",
    status: "Pendiente",
    progress: 0,
    nextStep: "Configurar Google Sheet",
    nextDate: "Sin fecha",
    responsibleClient: "Sin responsable",
    whatsappMessage: "Hola, equipo 👋 Ya actualizamos la Ruta de Avance Visible™."
  },
  milestones: [],
  findings: [],
  pending: [],
  deliverables: [],
  updates: []
};

function cleanText(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\r/g, "")
    .trim();
}

function normalizeKey(value) {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

function parseNumber(value, fallback = 0) {
  const n = Number(String(value ?? "").replace("%", "").replace(",", ".").trim());
  return Number.isFinite(n) ? n : fallback;
}

function getSpreadsheetId(rawValue) {
  const raw = String(rawValue || "").trim();

  const publishedMatch = raw.match(/\/d\/e\/([^/]+)/);
  if (publishedMatch) return { id: publishedMatch[1], type: "published" };

  const editableMatch = raw.match(/\/d\/([^/]+)/);
  if (editableMatch) return { id: editableMatch[1], type: "editable" };

  if (raw.startsWith("2PACX-")) return { id: raw, type: "published" };

  return { id: raw, type: "editable" };
}

function csvUrl(sheetName) {
  const { id, type } = getSpreadsheetId(SPREADSHEET_ID);
  const encodedSheet = encodeURIComponent(sheetName);

  if (type === "published") {
    return `https://docs.google.com/spreadsheets/d/e/${id}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`;
  }

  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`;
}

function parseCsvRows(csvText) {
  const rows = [];
  let current = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const next = csvText[i + 1];

    if (char === '"' && insideQuotes && next === '"') {
      value += '"';
      i++;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === "," && !insideQuotes) {
      current.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && next === "\n") i++;
      current.push(value);
      value = "";
      if (current.some((cell) => cleanText(cell))) rows.push(current.map(cleanText));
      current = [];
      continue;
    }

    value += char;
  }

  current.push(value);
  if (current.some((cell) => cleanText(cell))) rows.push(current.map(cleanText));
  return rows;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const headers = rows[0].map(cleanText);
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = cleanText(row[index]);
    });
    return obj;
  });
}

async function fetchCsvRows(sheetName) {
  const url = csvUrl(sheetName);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo leer la hoja ${sheetName}`);
  }

  const text = await response.text();

  if (text.trim().startsWith("<")) {
    throw new Error(`La hoja ${sheetName} devolvió HTML, no CSV`);
  }

  return parseCsvRows(text);
}

async function fetchCsvSheet(sheetName) {
  const rows = await fetchCsvRows(sheetName);
  return rowsToObjects(rows);
}

function getRowValue(row, possibleKeys) {
  const normalizedRow = {};

  Object.keys(row || {}).forEach((key) => {
    normalizedRow[normalizeKey(key)] = row[key];
  });

  for (const key of possibleKeys) {
    const value = normalizedRow[normalizeKey(key)];
    if (cleanText(value)) return cleanText(value);
  }

  return "";
}

/**
 * LECTURA DEFINITIVA DE PROYECTO:
 * Soporta cualquiera de estas formas:
 * 1) Campo | Valor
 * 2) Cliente | Servicio | EstadoGeneral | ...
 * 3) Filas sueltas donde Google Sheets no reconoce encabezados
 * 4) Espacios ocultos, mayúsculas, tildes o variantes
 */
function projectFromRawRows(rows) {
  const map = {};

  rows.forEach((row) => {
    const cells = row.map(cleanText).filter((cell) => cell !== "");
    if (!cells.length) return;

    const first = normalizeKey(cells[0]);
    const second = cells[1] ? cleanText(cells[1]) : "";

    // Caso Campo | Valor como encabezado
    if (first === "campo" || first === "field" || first === "nombre") return;

    // Caso key-value directo: Cliente | troyamotors
    if (first && second) {
      map[first] = second;
    }

    // Caso accidental: Cliente está en cualquier celda y valor en la siguiente
    cells.forEach((cell, index) => {
      const key = normalizeKey(cell);
      const value = cells[index + 1] ? cleanText(cells[index + 1]) : "";
      if (key && value && [
        "cliente",
        "servicio",
        "estadogeneral",
        "estado",
        "avancegeneral",
        "avance",
        "proximopaso",
        "proximopasoactual",
        "fechaproximopaso",
        "proximafecha",
        "responsablecliente",
        "responsable",
        "mensajewhatsapp",
        "whatsapp"
      ].includes(key)) {
        map[key] = value;
      }
    });
  });

  const project = {
    client: map.cliente || demoData.project.client,
    service: map.servicio || demoData.project.service,
    status: map.estadogeneral || map.estado || demoData.project.status,
    progress: parseNumber(map.avancegeneral || map.avance, demoData.project.progress),
    nextStep: map.proximopaso || map.proximopasoactual || demoData.project.nextStep,
    nextDate: map.fechaproximopaso || map.proximafecha || demoData.project.nextDate,
    responsibleClient: map.responsablecliente || map.responsable || demoData.project.responsibleClient,
    whatsappMessage: map.mensajewhatsapp || map.whatsapp || demoData.project.whatsappMessage,
  };

  return project;
}

function mapMilestones(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["ID", "Id"]) || String(index + 1),
    title: getRowValue(row, ["Hito", "Titulo", "Título"]),
    status: getRowValue(row, ["Estado"]),
    progress: parseNumber(getRowValue(row, ["% Avance", "Avance", "Progreso"])),
  })).filter((x) => x.title);
}

function mapFindings(rows) {
  return rows.map((row) => ({
    area: getRowValue(row, ["Área", "Area"]),
    finding: getRowValue(row, ["Hallazgo"]),
    impact: getRowValue(row, ["Impacto"]),
    priority: getRowValue(row, ["Prioridad"]),
    system: getRowValue(row, ["Sistema", "Sistema que lo resuelve"]),
  })).filter((x) => x.finding);
}

function mapPending(rows) {
  return rows.map((row) => ({
    request: getRowValue(row, ["Pendiente", "Solicitud"]),
    owner: getRowValue(row, ["Responsable", "Responsable cliente", "Responsable Cliente"]),
    dueDate: getRowValue(row, ["Fecha límite", "Fecha limite", "Fecha"]),
    status: getRowValue(row, ["Estado"]),
    blocks: getRowValue(row, ["Qué bloquea", "Que bloquea", "Bloquea", "Impacto"]),
  })).filter((x) => x.request);
}

function mapDeliverables(rows) {
  return rows.map((row) => ({
    system: getRowValue(row, ["Sistema"]),
    deliverable: getRowValue(row, ["Entregable"]),
    status: getRowValue(row, ["Estado"]),
    progress: parseNumber(getRowValue(row, ["% Avance", "Avance", "Progreso"])),
  })).filter((x) => x.deliverable);
}

function mapUpdates(rows) {
  return rows.map((row) => ({
    title: getRowValue(row, ["Título", "Titulo", "Title"]),
    text: getRowValue(row, ["Texto", "Mensaje", "Detalle"]),
  })).filter((x) => x.title || x.text);
}

export async function loadSheetData() {
  if (!SPREADSHEET_ID) {
    throw new Error("Falta configurar VITE_SPREADSHEET_ID");
  }

  const [projectRawRows, milestoneRows, findingRows, pendingRows, deliverableRows, updateRows] = await Promise.all([
    fetchCsvRows("Proyecto"),
    fetchCsvSheet("Hitos"),
    fetchCsvSheet("Hallazgos"),
    fetchCsvSheet("PendientesCliente"),
    fetchCsvSheet("Entregables"),
    fetchCsvSheet("Actualizaciones"),
  ]);

  return {
    project: projectFromRawRows(projectRawRows),
    milestones: mapMilestones(milestoneRows),
    findings: mapFindings(findingRows),
    pending: mapPending(pendingRows),
    deliverables: mapDeliverables(deliverableRows),
    updates: mapUpdates(updateRows),
  };
}
