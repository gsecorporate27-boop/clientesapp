import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Flag,
  Layers3,
  LockKeyhole,
  MessageCircle,
  Search,
  Target,
  Users,
} from "lucide-react";
import { loadSheetData, demoData } from "./sheets";
import "./index.css";

function getStatusType(status = "") {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("finalizado") || normalized.includes("aprobado")) return "success";
  if (normalized.includes("validación") || normalized.includes("revision") || normalized.includes("revisión")) return "warning";
  if (normalized.includes("bloqueado")) return "danger";
  if (normalized.includes("desarrollo")) return "info";
  return "neutral";
}

function getUpdateIcon(type = "") {
  const normalized = String(type).toLowerCase();
  if (normalized.includes("pendiente")) return AlertTriangle;
  if (normalized.includes("proximo") || normalized.includes("próximo")) return Flag;
  return Search;
}

function Badge({ children, status }) {
  return <span className={`badge ${getStatusType(status || children)}`}>{children}</span>;
}

function ProgressBar({ value, status }) {
  return (
    <div className="progress">
      <div className={`progressFill ${getStatusType(status)}`} style={{ width: `${Math.min(Number(value) || 0, 100)}%` }} />
    </div>
  );
}

function Sidebar({ view, setView }) {
  const items = [
    [BarChart3, "Resumen", "resumen"],
    [Target, "Ruta del proyecto", "resumen"],
    [Search, "Hallazgos", "hallazgos"],
    [AlertTriangle, "Pendientes", "pendientes"],
    [FileText, "Entregables", "entregables"],
    [MessageCircle, "WhatsApp", "whatsapp"],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="logo">GSE</div>
        <div className="brandSub">Ruta de Avance Visible™</div>
      </div>

      <nav className="nav">
        {items.map(([Icon, label, value]) => (
          <button key={label} className={`navItem ${view === value ? "active" : ""}`} onClick={() => setView(value)}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebarCard">
        <div className="sidebarCardTitle">
          <Layers3 size={18} /> Business Power™
        </div>
        <p>Visualiza avance, pendientes y decisiones clave del proyecto.</p>
      </div>
    </aside>
  );
}

function Header({ project, source, error }) {
  return (
    <header className="header">
      <div>
        <div className="eyebrow">{project.service}</div>
        <h1>Ruta de Avance Visible™</h1>
        <p>Seguimiento ejecutivo del proyecto · {project.client}</p>
        {error && <p className="errorText">{error}</p>}
      </div>

      <div className="headerActions">
        <Badge status={project.status}>Estado general: {project.status}</Badge>
        <Badge status={source === "google-sheets" ? "Finalizado" : "Pendiente"}>
          {source === "google-sheets" ? "Conectado a Google Sheets" : "Modo demo"}
        </Badge>
      </div>
    </header>
  );
}

function KpiCards({ data }) {
  const done = data.milestones.filter((m) => getStatusType(m.status) === "success").length;
  const blocked = data.pending.filter((p) => getStatusType(p.status) === "danger").length;

  const cards = [
    { label: "Avance general", value: `${data.project.progress}%`, icon: BarChart3, note: "Proyecto en tiempo", status: data.project.status },
    { label: "Hitos cumplidos", value: `${done}/${data.milestones.length}`, icon: CheckCircle2, note: "Avance validado", status: "Finalizado" },
    { label: "Pendientes cliente", value: data.pending.length, icon: Clock3, note: "Requieren seguimiento", status: "En validación" },
    { label: "Bloqueos", value: blocked, icon: LockKeyhole, note: "Impactan cronograma", status: blocked ? "Bloqueado" : "Finalizado" },
  ];

  return (
    <div className="kpis">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div className="card kpi" key={card.label}>
            <div className="kpiTop">
              <div className="iconBox"><Icon size={22} /></div>
              <Badge status={card.status}>{card.note}</Badge>
            </div>
            <div className="muted">{card.label}</div>
            <div className="kpiValue">{card.value}</div>
          </div>
        );
      })}
    </div>
  );
}

function Timeline({ milestones }) {
  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>Ruta del proyecto</h2>
          <p>Hitos visibles para que el cliente entienda qué se logró y qué sigue.</p>
        </div>
        <Badge status="En validación">Hito actual: Hallazgos</Badge>
      </div>

      <div className="timeline">
        {milestones.map((m) => (
          <div className="milestone" key={`${m.id}-${m.title}`}>
            <div className={`circle ${getStatusType(m.status)}`}>
              {getStatusType(m.status) === "success" ? <CheckCircle2 size={20} /> : m.id}
            </div>
            <div className="milestoneTitle">{m.title}</div>
            <ProgressBar value={m.progress} status={m.status} />
            <div className="milestoneStatus">{m.status}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Findings({ findings }) {
  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>Hallazgos encontrados</h2>
          <p>Qué está causando desorden, reprocesos o pérdida de claridad.</p>
        </div>
        <Badge status="En validación">En validación</Badge>
      </div>

      <div className="list">
        {findings.map((item) => (
          <div className="findingItem" key={`${item.area}-${item.finding}`}>
            <div>
              <div className="area">{item.area}</div>
              <div className="itemTitle">{item.finding}</div>
              <div className="muted">Sistema que lo resolverá: {item.system}</div>
            </div>
            <div className="badges">
              <Badge status={item.impact}>Impacto: {item.impact}</Badge>
              <Badge status={item.priority === "Alta" ? "Bloqueado" : "En validación"}>Prioridad: {item.priority}</Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PendingClient({ pending }) {
  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>Pendientes del cliente</h2>
          <p>Acciones necesarias para avanzar sin retrasos.</p>
        </div>
        <Badge status="En validación">{pending.length} activos</Badge>
      </div>

      <div className="table">
        <div className="tableRow tableHead">
          <div>Solicitud</div>
          <div>Responsable</div>
          <div>Fecha</div>
          <div>Estado</div>
        </div>
        {pending.map((item) => (
          <div className="tableRow" key={`${item.request}-${item.owner}`}>
            <div>
              <strong>{item.request}</strong>
              <span>Bloquea: {item.blocks}</span>
            </div>
            <div>{item.owner}</div>
            <div>{item.dueDate}</div>
            <div><Badge status={item.status}>{item.status}</Badge></div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Deliverables({ deliverables }) {
  return (
    <section className="card">
      <h2>Entregables por sistema</h2>
      <p className="sectionIntro">Vista resumida de los productos que se están construyendo.</p>

      <div className="deliverablesGrid">
        {deliverables.map((item) => (
          <div className="deliverableCard" key={`${item.system}-${item.deliverable}`}>
            <div className="deliverableTop">
              <div>
                <div className="area">{item.system}</div>
                <div className="itemTitle">{item.deliverable}</div>
              </div>
              <Badge status={item.status}>{item.status}</Badge>
            </div>
            <ProgressBar value={item.progress} status={item.status} />
            <div className="muted">{item.progress}% de avance</div>
            {item.link && (
              <a href={item.link} target="_blank" rel="noreferrer" className="linkBtn">
                Ver entregable <ChevronRight size={16} />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function UpdatesPanel({ project, updates }) {
  return (
    <aside className="rightPanel">
      <div className="nextCard">
        <div className="nextLabel"><Flag size={18} /> Próximo paso</div>
        <h3>{project.nextStep}</h3>
        <p>{project.nextDate}</p>
        <button className="tealBtn">Ver agenda</button>
      </div>

      {updates.map((u) => {
        const Icon = getUpdateIcon(u.type);
        return (
          <div className="card updateCard" key={`${u.title}-${u.type}`}>
            <div className="updateTitle">
              <div className="iconBox teal"><Icon size={20} /></div>
              <strong>{u.title}</strong>
            </div>
            <p>{u.text}</p>
          </div>
        );
      })}
    </aside>
  );
}

function WhatsAppMessage({ message }) {
  return (
    <section className="card">
      <div className="sectionHeader">
        <div className="withIcon">
          <div className="iconBox green"><MessageCircle size={22} /></div>
          <div>
            <h2>Mensaje sugerido para WhatsApp</h2>
            <p>Texto listo para enviar al cliente junto al link del tablero.</p>
          </div>
        </div>
      </div>

      <div className="whatsappBox">
        {String(message || "").split("\n").map((line, index) => (
          <p key={index}>{line || " "}</p>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [view, setView] = useState("resumen");
  const [data, setData] = useState(demoData);
  const [source, setSource] = useState("demo");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSheetData().then((result) => {
      setData(result.data);
      setSource(result.source);
      setError(result.error);
      setLoading(false);
    });
  }, []);

  const completedText = useMemo(() => {
    const completed = data.milestones.filter((m) => getStatusType(m.status) === "success").length;
    return `${completed} hitos completados de ${data.milestones.length}`;
  }, [data.milestones]);

  if (loading) {
    return (
      <div className="loading">
        <div className="loadingCard">
          <div className="logo dark">GSE</div>
          <h1>Cargando Ruta de Avance Visible™</h1>
          <p>Estamos leyendo la información del proyecto.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} />

      <main className="main">
        <Header project={data.project} source={source} error={error} />

        <div className="content">
          <div className="mobileTabs">
            {["resumen", "hallazgos", "pendientes", "entregables", "whatsapp"].map((item) => (
              <button key={item} onClick={() => setView(item)} className={view === item ? "active" : ""}>
                {item}
              </button>
            ))}
          </div>

          <div className="heroCard">
            <div>
              <div className="eyebrow">Tablero conectado</div>
              <h2>{data.project.service} · {data.project.client}</h2>
              <p>{completedText}. Avance general actualizado desde Google Sheets.</p>
            </div>
            <div className="responsible">
              <Users size={22} />
              <div>
                <span>Responsable cliente</span>
                <strong>{data.project.responsibleClient}</strong>
              </div>
            </div>
          </div>

          {view === "resumen" && (
            <>
              <KpiCards data={data} />
              <div className="layout">
                <div className="leftContent">
                  <Timeline milestones={data.milestones} />
                  <Findings findings={data.findings} />
                </div>
                <UpdatesPanel project={data.project} updates={data.updates} />
              </div>
              <div className="twoColumns">
                <PendingClient pending={data.pending} />
                <Deliverables deliverables={data.deliverables} />
              </div>
            </>
          )}

          {view === "hallazgos" && <Findings findings={data.findings} />}
          {view === "pendientes" && <PendingClient pending={data.pending} />}
          {view === "entregables" && <Deliverables deliverables={data.deliverables} />}
          {view === "whatsapp" && <WhatsAppMessage message={data.project.whatsappMessage} />}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
