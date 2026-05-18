
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
    linkMeet: "",
    responsibleClient: "Sin responsable",
    generalManager: "Sin información",
    logoGSE: "",
    logoClient: "",
    projectPhrase: "Ruta de avance del proyecto",
    whatsappMessage: "Hola, equipo 👋 Ya actualizamos la Ruta de Avance Visible™."
  },
  milestones: [],
  findings: [],
  pending: [],
  deliverables: [],
  updates: [],
  education: []
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

async function fetchCsvRows(sheetName, required = true) {
  const url = csvUrl(sheetName);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    if (!required) return [];
    throw new Error(`No se pudo leer la hoja ${sheetName}`);
  }

  const text = await response.text();

  if (text.trim().startsWith("<")) {
    if (!required) return [];
    throw new Error(`La hoja ${sheetName} devolvió HTML, no CSV`);
  }

  return parseCsvRows(text);
}

async function fetchCsvSheet(sheetName, required = true) {
  const rows = await fetchCsvRows(sheetName, required);
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

function projectFromRawRows(rows) {
  const map = {};
  const validKeys = [
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
    "linkmeet",
    "meet",
    "googlemeet",
    "responsablecliente",
    "responsable",
    "gerentegeneral",
    "dueno",
    "dueño",
    "lidercliente",
    "logogse",
    "logocliente",
    "fraseproyecto",
    "mensajewhatsapp",
    "whatsapp"
  ];

  const cleanRows = rows
    .map((row) => row.map(cleanText))
    .filter((row) => row.some((cell) => cell !== ""));

  if (!cleanRows.length) {
    return demoData.project;
  }

  // Formato horizontal recomendado:
  // Cliente | Servicio | EstadoGeneral | AvanceGeneral | ...
  const headerKeys = cleanRows[0].map(normalizeKey);
  const valueRow = cleanRows[1] || [];
  const looksHorizontal = headerKeys.includes("cliente") && headerKeys.includes("servicio");

  if (looksHorizontal && valueRow.length) {
    headerKeys.forEach((key, index) => {
      if (validKeys.includes(key)) {
        const value = cleanText(valueRow[index]);
        if (value) map[key] = value;
      }
    });
  }

  // Formato vertical alternativo:
  // Campo | Valor
  const firstA = normalizeKey(cleanRows[0]?.[0]);
  const firstB = normalizeKey(cleanRows[0]?.[1]);

  if (firstA === "campo" && firstB === "valor") {
    cleanRows.slice(1).forEach((row) => {
      const key = normalizeKey(row[0]);
      const value = cleanText(row[1]);
      if (validKeys.includes(key) && value) {
        map[key] = value;
      }
    });
  }

  // Formato key-value sin encabezados
  cleanRows.forEach((row) => {
    const cells = row.map(cleanText).filter((cell) => cell !== "");
    if (!cells.length) return;

    const first = normalizeKey(cells[0]);
    const second = cells[1] ? cleanText(cells[1]) : "";

    if (first === "cliente" && normalizeKey(second) === "servicio") return;
    if (first === "campo" && normalizeKey(second) === "valor") return;

    if (validKeys.includes(first) && second && !map[first]) {
      map[first] = second;
    }
  });

  return {
    client: map.cliente || demoData.project.client,
    service: map.servicio || demoData.project.service,
    status: map.estadogeneral || map.estado || demoData.project.status,
    progress: parseNumber(map.avancegeneral || map.avance, demoData.project.progress),
    nextStep: map.proximopaso || map.proximopasoactual || demoData.project.nextStep,
    nextDate: map.fechaproximopaso || map.proximafecha || demoData.project.nextDate,
    linkMeet: map.linkmeet || map.meet || map.googlemeet || demoData.project.linkMeet,
    responsibleClient: map.responsablecliente || map.responsable || demoData.project.responsibleClient,
    generalManager: map.gerentegeneral || map.dueno || map.dueño || map.lidercliente || demoData.project.generalManager,
    logoGSE: map.logogse || demoData.project.logoGSE,
    logoClient: map.logocliente || demoData.project.logoClient,
    projectPhrase: map.fraseproyecto || demoData.project.projectPhrase,
    whatsappMessage: map.mensajewhatsapp || map.whatsapp || demoData.project.whatsappMessage,
  };
}

function mapMilestones(rows) {
  return rows.map((row, index) => ({
    id: getRowValue(row, ["ID", "Id"]) || String(index + 1),
    title: getRowValue(row, ["Hito", "Titulo", "Título", "Nombre"]),
    system: getRowValue(row, ["Sistema"]),
    status: getRowValue(row, ["Estado"]),
    progress: parseNumber(getRowValue(row, ["% Avance", "Avance", "Progreso"])),
    description: getRowValue(row, ["Descripcion", "Descripción", "Detalle"]),
    includes: getRowValue(row, ["Qué incluye", "Que incluye", "QueIncluye", "Incluye", "Contenido", "Dentro", "Actividades"]),
    link: getRowValue(row, ["Link", "URL", "Enlace", "LinkHito"]),
    targetDate: getRowValue(row, ["FechaObjetivo", "Fecha Objetivo", "Fecha objetivo", "Fecha", "FechaMeta"]),
  })).filter((x) => x.title);
}

function mapFindings(rows) {
  return rows.map((row) => ({
    area: getRowValue(row, ["Área", "Area"]),
    finding: getRowValue(row, ["Hallazgo"]),
    impact: getRowValue(row, ["Impacto"]),
    priority: getRowValue(row, ["Prioridad"]),
    system: getRowValue(row, ["Sistema", "Sistema que lo resuelve"]),
    description: getRowValue(row, ["Descripcion", "Descripción", "Detalle", "Explicacion", "Explicación"]),
    solution: getRowValue(row, ["Solucion", "Solución", "Propuesta", "Accion", "Acción"]),
    image: getRowValue(row, ["Imagen", "ImagenPreview", "Imagen previa", "URLImagen"]),
  })).filter((x) => x.finding);
}

function mapPending(rows) {
  return rows.map((row) => ({
    request: getRowValue(row, ["Pendiente", "Solicitud"]),
    owner: getRowValue(row, ["Responsable", "Responsable cliente", "Responsable Cliente"]),
    dueDate: getRowValue(row, ["Fecha límite", "Fecha limite", "Fecha", "FechaObjetivo", "Fecha Objetivo"]),
    status: getRowValue(row, ["Estado"]),
    blocks: getRowValue(row, ["Qué bloquea", "Que bloquea", "Bloquea", "Impacto"]),
    description: getRowValue(row, ["Descripcion", "Descripción", "Detalle", "Explicacion", "Explicación"]),
    link: getRowValue(row, ["Link", "URL", "Enlace", "LinkDocumento", "Link Documento", "Documento", "Archivo"]),
  })).filter((x) => x.request);
}

function mapDeliverables(rows) {
  return rows.map((row) => ({
    system: getRowValue(row, ["Sistema"]),
    milestone: getRowValue(row, ["Hito"]),
    deliverable: getRowValue(row, ["Entregable"]),
    status: getRowValue(row, ["Estado"]),
    progress: parseNumber(getRowValue(row, ["% Avance", "Avance", "Progreso"])),
    link: getRowValue(row, [
      "LinkEntregable", "Link Entregable", "Link entregable", "Link", "URL", "Enlace",
      "EnlaceEntregable", "Enlace Entregable", "Documento", "Archivo"
    ]),
    observation: getRowValue(row, ["Observacion", "Observación", "Notas", "Comentario"]),
  })).filter((x) => x.deliverable);
}

function mapUpdates(rows) {
  return rows.map((row) => ({
    title: getRowValue(row, ["Título", "Titulo", "Title"]),
    text: getRowValue(row, ["Texto", "Mensaje", "Detalle"]),
    target: getRowValue(row, ["Destino", "Target", "Vista"]),
  })).filter((x) => x.title || x.text);
}

function mapEducation(rows) {
  return rows.map((row) => ({
    system: getRowValue(row, ["Sistema"]),
    milestone: getRowValue(row, ["Hito"]),
    deliverable: getRowValue(row, ["Entregable"]),
    whatIs: getRowValue(row, ["QueEs", "Qué es", "Que es"]),
    purpose: getRowValue(row, ["ParaQueSirve", "Para qué sirve", "Para que sirve"]),
    howToRead: getRowValue(row, ["ComoLeerlo", "Cómo leerlo", "Como leerlo"]),
    imagePreview: getRowValue(row, ["ImagenPreview", "Imagen previa", "Imagen"]),
    link: getRowValue(row, ["LinkEntregable", "Link Entregable", "Link", "URL", "Enlace", "Documento", "Archivo"]),
    status: getRowValue(row, ["Estado"]),
  })).filter((x) => x.deliverable || x.whatIs || x.purpose);
}

export async function loadSheetData() {
  if (!SPREADSHEET_ID) {
    throw new Error("Falta configurar VITE_SPREADSHEET_ID o usar ?sheet=ID");
  }

  const [projectRawRows, milestoneRows, findingRows, pendingRows, deliverableRows, updateRows, educationRows] = await Promise.all([
    fetchCsvRows("Proyecto"),
    fetchCsvSheet("Hitos"),
    fetchCsvSheet("Hallazgos"),
    fetchCsvSheet("PendientesCliente"),
    fetchCsvSheet("Entregables"),
    fetchCsvSheet("Actualizaciones", false),
    fetchCsvSheet("Educacion", false),
  ]);

  return {
    project: projectFromRawRows(projectRawRows),
    milestones: mapMilestones(milestoneRows),
    findings: mapFindings(findingRows),
    pending: mapPending(pendingRows),
    deliverables: mapDeliverables(deliverableRows),
    updates: mapUpdates(updateRows),
    education: mapEducation(educationRows),
  };
}
