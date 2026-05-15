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
  if (normalized.includes("validación") || normalized.includes("validacion") || normalized.includes("revision") || normalized.includes("revisión")) return "warning";
  if (normalized.includes("bloqueado")) return "danger";
  if (normalized.includes("desarrollo")) return "info";
  return "neutral";
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
          <button
            key={label}
            className={`navItem ${view === value ? "active" : ""}`}
            onClick={() => setView(value)}
          >
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

function Header({ project, connected }) {
  return (
    <header className="header">
      <div>
        <div className="eyebrow">{project.service}</div>
        <h1>Ruta de Avance Visible™</h1>
        <p>Seguimiento ejecutivo del proyecto · {project.client}</p>
      </div>

      <div className="headerActions">
        <Badge status={connected ? "Finalizado" : "Bloqueado"}>{connected ? "Conectado a Google Sheets" : "Sin conexión"}</Badge>
        <Badge status={project.status}>Estado general: {project.status}</Badge>
      </div>
    </header>
  );
}

function KpiCards({ project, milestones, pending }) {
  const done = milestones.filter((m) => m.status === "Finalizado" || m.status === "Aprobado").length;
  const blocked = pending.filter((p) => String(p.status).toLowerCase().includes("bloqueado")).length;

  const cards = [
    { label: "Avance general", value: `${project.progress}%`, icon: BarChart3, note: "Proyecto actualizado", status: project.status },
    { label: "Hitos cumplidos", value: `${done}/${milestones.length}`, icon: CheckCircle2, note: "Avance validado", status: "Finalizado" },
    { label: "Pendientes cliente", value: pending.length, icon: Clock3, note: "Requieren seguimiento", status: "En validación" },
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
        <Badge status="En validación">Ruta actualizada</Badge>
      </div>

      <div className="timeline">
        {milestones.map((m, index) => (
          <div className="milestone" key={`${m.id}-${m.title}`}>
            <div className={`circle ${getStatusType(m.status)}`}>
              {m.status === "Finalizado" || m.status === "Aprobado" ? <CheckCircle2 size={20} /> : index + 1}
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
        <Badge status="En validación">{findings.length} hallazgos</Badge>
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
          </div>
        ))}
      </div>
    </section>
  );
}

function UpdatesPanel({ project, updates }) {
  const safeUpdates = updates.length ? updates : [
    { title: "Próximo paso", text: project.nextStep },
  ];

  return (
    <aside className="rightPanel">
      <div className="nextCard">
        <div className="nextLabel"><Flag size={18} /> Próximo paso</div>
        <h3>{project.nextStep}</h3>
        <p>{project.nextDate}</p>
      </div>

      {safeUpdates.map((u, index) => (
        <div className="card updateCard" key={`${u.title}-${index}`}>
          <div className="updateTitle">
            <div className="iconBox teal"><Search size={20} /></div>
            <strong>{u.title}</strong>
          </div>
          <p>{u.text}</p>
          <button className="linkBtn">
            Ver detalle <ChevronRight size={16} />
          </button>
        </div>
      ))}
    </aside>
  );
}

function WhatsAppMessage({ project }) {
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
        {String(project.whatsappMessage || "").split("\n").map((line, index) => (
          <p key={index}>{line || " "}</p>
        ))}
      </div>
    </section>
  );
}

function App() {
  const [view, setView] = useState("resumen");
  const [data, setData] = useState(demoData);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSheetData()
      .then((sheetData) => {
        setData(sheetData);
        setConnected(true);
        setError("");
      })
      .catch((err) => {
        console.error(err);
        setConnected(false);
        setError("No se pudo conectar con Google Sheets. Revisa publicación, permisos o nombres de pestañas.");
      });
  }, []);

  const { project, milestones, findings, pending, deliverables, updates } = data;

  const completedText = useMemo(() => {
    const completed = milestones.filter((m) => m.status === "Finalizado" || m.status === "Aprobado").length;
    return `${completed} hitos completados de ${milestones.length}`;
  }, [milestones]);

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} />

      <main className="main">
        <Header project={project} connected={connected} />

        <div className="content">
          <div className="mobileTabs">
            {["resumen", "hallazgos", "pendientes", "entregables", "whatsapp"].map((item) => (
              <button
                key={item}
                onClick={() => setView(item)}
                className={view === item ? "active" : ""}
              >
                {item}
              </button>
            ))}
          </div>

          {error && <div className="errorBox">{error}</div>}

          <div className="heroCard">
            <div>
              <div className="eyebrow">{connected ? "Tablero conectado" : "Revisar conexión"}</div>
              <h2>{project.service} · {project.client}</h2>
              <p>{completedText}. Avance general actualizado desde Google Sheets.</p>
            </div>
            <div className="responsible">
              <Users size={22} />
              <div>
                <span>Responsable cliente</span>
                <strong>{project.responsibleClient}</strong>
              </div>
            </div>
          </div>

          {view === "resumen" && (
            <>
              <KpiCards project={project} milestones={milestones} pending={pending} />
              <div className="layout">
                <div className="leftContent">
                  <Timeline milestones={milestones} />
                  <Findings findings={findings} />
                </div>
                <UpdatesPanel project={project} updates={updates} />
              </div>
              <div className="twoColumns">
                <PendingClient pending={pending} />
                <Deliverables deliverables={deliverables} />
              </div>
            </>
          )}

          {view === "hallazgos" && <Findings findings={findings} />}
          {view === "pendientes" && <PendingClient pending={pending} />}
          {view === "entregables" && <Deliverables deliverables={deliverables} />}
          {view === "whatsapp" && <WhatsAppMessage project={project} />}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

