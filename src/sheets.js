import Papa from "papaparse";

export const SPREADSHEET_ID = import.meta.env.VITE_SPREADSHEET_ID || "";

export const SHEET_NAMES = {
  project: "Proyecto",
  milestones: "Hitos",
  findings: "Hallazgos",
  pending: "PendientesCliente",
  deliverables: "Entregables",
  updates: "Actualizaciones",
};

export const demoData = {
  project: {
    client: "Cliente Demo",
    service: "Business Power™",
    status: "En tiempo",
    progress: 58,
    nextStep: "Reunión de validación de hallazgos y priorización",
    nextDate: "20 de mayo · 10h00",
    responsibleClient: "Gerencia / RRHH",
    whatsappMessage:
      "Hola, equipo 👋\n\nYa actualizamos la Ruta de Avance Visible™.\n\n✅ Avance principal: hallazgos encontrados\n🟡 Pendiente: validación de matriz de hallazgos\n➡️ Próximo paso: priorizar problemas críticos\n\nPueden revisar el avance aquí: [LINK]",
  },
  milestones: [
    { id: 1, title: "Arranque", system: "General", status: "Finalizado", progress: 100, targetDate: "18 mayo" },
    { id: 2, title: "Hallazgos encontrados", system: "Diagnóstico", status: "En validación cliente", progress: 85, targetDate: "20 mayo" },
    { id: 3, title: "Problemas críticos priorizados", system: "Diagnóstico", status: "Pendiente", progress: 0, targetDate: "22 mayo" },
    { id: 4, title: "Procesos AS IS / TO BE", system: "Operación sin Caos", status: "Pendiente", progress: 0, targetDate: "28 mayo" },
    { id: 5, title: "Estructura y roles", system: "Talento en el Rol Correcto", status: "Pendiente", progress: 0, targetDate: "04 junio" },
    { id: 6, title: "K&ZEN e indicadores", system: "K&ZEN Interno Permanente", status: "Pendiente", progress: 0, targetDate: "18 junio" },
    { id: 7, title: "Transferencia y cierre", system: "General", status: "Pendiente", progress: 0, targetDate: "30 junio" },
  ],
  findings: [
    { area: "Operaciones", finding: "Procesos no estandarizados", impact: "Alto", priority: "Alta", system: "Operación sin Caos", status: "En validación" },
    { area: "Gerencia", finding: "Decisiones concentradas en una sola persona", impact: "Alto", priority: "Alta", system: "K&ZEN Interno Permanente", status: "En validación" },
    { area: "Talento Humano", finding: "Funciones duplicadas entre cargos", impact: "Medio", priority: "Alta", system: "Talento en el Rol Correcto", status: "En validación" },
    { area: "Administración", finding: "Falta de indicadores para medir desempeño", impact: "Medio", priority: "Media", system: "Desempeño que Optimiza la Estructura", status: "Pendiente" },
  ],
  pending: [
    { request: "Validar matriz de hallazgos", owner: "Gerencia", dueDate: "20 mayo", status: "En revisión", blocks: "Priorización de problemas críticos" },
    { request: "Enviar organigrama actual", owner: "RRHH", dueDate: "22 mayo", status: "Pendiente", blocks: "Revisión de estructura y roles" },
    { request: "Confirmar responsables por área", owner: "Gerencia", dueDate: "24 mayo", status: "Bloqueado", blocks: "Levantamiento de procesos AS IS" },
  ],
  deliverables: [
    { system: "Operación sin Caos", deliverable: "Matriz de hallazgos", status: "En validación", progress: 85, link: "" },
    { system: "Operación sin Caos", deliverable: "Mapa de procesos", status: "En desarrollo", progress: 40, link: "" },
    { system: "Talento en el Rol Correcto", deliverable: "Estructura organizacional", status: "Pendiente", progress: 0, link: "" },
    { system: "Salarios Justos que Retienen", deliverable: "Modelo salarial", status: "Pendiente", progress: 0, link: "" },
    { system: "Desempeño que Optimiza la Estructura", deliverable: "Modelo de evaluación", status: "Pendiente", progress: 0, link: "" },
    { system: "K&ZEN Interno Permanente", deliverable: "Tablero de indicadores", status: "Pendiente", progress: 0, link: "" },
  ],
  updates: [
    { title: "Hallazgos encontrados", text: "Ya identificamos los principales factores que están generando desorden dentro de la operación.", type: "hallazgo" },
    { title: "Pendiente del cliente", text: "Necesitamos validar la matriz de hallazgos para priorizar qué debe corregirse primero.", type: "pendiente" },
    { title: "Próximo paso", text: "Realizaremos una reunión de validación para pasar de hallazgos a prioridades críticas.", type: "proximo" },
  ],
};

function getSpreadsheetId(rawValue) {
  const raw = String(rawValue || "").trim();

  // Acepta:
  // 1) ID editable: 1ABC...
  // 2) ID publicado: 2PACX-...
  // 3) URL completa publicada: https://docs.google.com/spreadsheets/d/e/2PACX-.../pubhtml
  // 4) URL editable: https://docs.google.com/spreadsheets/d/1ABC.../edit
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

  // Para Google Sheets publicado en la web
  if (type === "published") {
    return `https://docs.google.com/spreadsheets/d/e/${id}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`;
  }

  // Para Google Sheets compartido como editable/público
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodedSheet}`;
}

function parseNumber(value, fallback = 0) {
  const n = Number(String(value ?? "").replace("%", "").trim());
  return Number.isFinite(n) ? n : fallback;
}

function parseCsv(text) {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => String(h).trim(),
  });

  if (result.errors?.length) {
    console.warn("CSV parse warnings:", result.errors);
  }

  return result.data || [];
}

async function fetchCsvSheet(sheetName) {
  const url = csvUrl(sheetName);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`No se pudo leer la hoja ${sheetName}. URL: ${url}`);
  }

  const text = await response.text();

  // Google devuelve HTML cuando la hoja no está publicada correctamente.
  // Esto evita mostrar una tabla vacía sin avisar.
  if (text.trim().startsWith("<")) {
    throw new Error(`La hoja ${sheetName} devolvió HTML, no CSV. Revisa que el documento esté publicado en la web.`);
  }

  return parseCsv(text);
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .trim();
}

function normalizeKey(value) {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
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

function projectFromRows(rows) {
  const map = {};

  rows.forEach((row) => {
    // Formato esperado:
    // Campo | Valor
    const fieldName = getRowValue(row, ["Campo", "Field", "Nombre"]);
    const fieldValue = getRowValue(row, ["Valor", "Value", "Dato"]);

    if (fieldName) {
      map[normalizeKey(fieldName)] = fieldValue;
    }

    // Formato alternativo:
    // Cliente | Servicio | EstadoGeneral | ...
    Object.keys(row || {}).forEach((key) => {
      const normalized = normalizeKey(key);
      const value = cleanText(row[key]);
      if (value && !map[normalized]) map[normalized] = value;
    });
  });

  return {
    client: map.cliente || demoData.project.client,
    service: map.servicio || demoData.project.service,
    status: map.estadogeneral || map.estado || demoData.project.status,
    progress: parseNumber(map.avancegeneral || map.avance, demoData.project.progress),
    nextStep: map.proximopaso || map.proximopasoactual || demoData.project.nextStep,
    nextDate: map.fechaproximopaso || map.proximafecha || demoData.project.nextDate,
    responsibleClient: map.responsablecliente || map.responsable || demoData.project.responsibleClient,
    whatsappMessage: map.mensajewhatsapp || map.whatsapp || demoData.project.whatsappMessage,
  };
}

function normalizeData(raw) {
  return {
    project: projectFromRows(raw.project),
    milestones: raw.milestones.map((r) => ({
      id: r.ID || "",
      title: r.Hito || "",
      system: r.Sistema || "",
      status: r.Estado || "Pendiente",
      progress: parseNumber(r.Avance),
      targetDate: r.FechaObjetivo || "",
    })),
    findings: raw.findings.map((r) => ({
      area: r.Area || "",
      finding: r.Hallazgo || "",
      impact: r.Impacto || "",
      priority: r.Prioridad || "",
      system: r.Sistema || "",
      status: r.Estado || "",
    })),
    pending: raw.pending.map((r) => ({
      request: r.Solicitud || "",
      owner: r.Responsable || "",
      dueDate: r.FechaLimite || "",
      status: r.Estado || "",
      blocks: r.Bloquea || "",
    })),
    deliverables: raw.deliverables.map((r) => ({
      system: r.Sistema || "",
      deliverable: r.Entregable || "",
      status: r.Estado || "",
      progress: parseNumber(r.Avance),
      link: r.Link || "",
    })),
    updates: raw.updates.map((r) => ({
      title: r.Titulo || "",
      text: r.Texto || "",
      type: r.Tipo || "",
    })),
  };
}

export async function loadSheetData() {
  if (!SPREADSHEET_ID) {
    return { data: demoData, source: "demo", error: null };
  }

  try {
    const [project, milestones, findings, pending, deliverables, updates] = await Promise.all([
      fetchCsvSheet(SHEET_NAMES.project),
      fetchCsvSheet(SHEET_NAMES.milestones),
      fetchCsvSheet(SHEET_NAMES.findings),
      fetchCsvSheet(SHEET_NAMES.pending),
      fetchCsvSheet(SHEET_NAMES.deliverables),
      fetchCsvSheet(SHEET_NAMES.updates),
    ]);

    const data = normalizeData({ project, milestones, findings, pending, deliverables, updates });
    return { data, source: "google-sheets", error: null };
  } catch (error) {
    console.error(error);
    return {
      data: demoData,
      source: "demo",
      error: "No se pudo conectar con Google Sheets. Se están mostrando datos demo.",
    };
  }
}
