
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  Flag,
  Layers3,
  LockKeyhole,
  Monitor,
  Search,
  Target,
  Users,
  Video,
} from "lucide-react";
import { loadSheetData, demoData } from "./sheets";
import "./index.css";

const BRAND = "#00b8b5";

function getStatusType(status = "") {
  const normalized = String(status).toLowerCase();
  if (normalized.includes("finalizado") || normalized.includes("aprobado") || normalized.includes("disponible")) return "success";
  if (normalized.includes("validación") || normalized.includes("validacion") || normalized.includes("revision") || normalized.includes("revisión")) return "warning";
  if (normalized.includes("bloqueado")) return "danger";
  if (normalized.includes("desarrollo")) return "info";
  return "neutral";
}

function safeUrl(url = "") {
  const clean = String(url || "").trim();
  if (!clean) return "";
  if (clean.startsWith("http://") || clean.startsWith("https://")) return clean;
  return "";
}

function Badge({ children, status }) {
  return <span className={`badge ${getStatusType(status || children)}`}>{children}</span>;
}

function ProgressBar({ value, status, reverse = false }) {
  const width = Math.max(0, Math.min(Number(value) || 0, 100));
  return (
    <div className="progress">
      <div className={`progressFill ${reverse ? "danger" : getStatusType(status)}`} style={{ width: `${width}%` }} />
    </div>
  );
}

function Logo({ src, fallback, className = "" }) {
  const url = safeUrl(src);
  if (url) {
    return <img src={url} alt={fallback} className={`logoImage ${className}`} />;
  }
  return <div className={`logoFallback ${className}`}>{fallback}</div>;
}

function Sidebar({ view, setView, project }) {
  const items = [
    [BarChart3, "Resumen", "resumen"],
    [Target, "Ruta del proyecto", "ruta"],
    [Search, "Hallazgos", "hallazgos"],
    [AlertTriangle, "Pendientes", "pendientes"],
    [FileText, "Entregables", "entregables"],
    [BookOpen, "Educación", "educacion"],
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <Logo src={project.logoGSE} fallback="GSE" />
        <div>
          <div className="brandTitle">Ruta de Avance Visible™</div>
          <div className="brandSub">{project.service}</div>
        </div>
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
          <Layers3 size={18} /> GSE&CO.
        </div>
        <p>Procesos, estructura y talento humano para sostener el cambio.</p>
      </div>
    </aside>
  );
}

function Header({ project, connected }) {
  return (
    <header className="header">
      <div className="headerIdentity">
        <Logo src={project.logoGSE} fallback="GSE" />
        <div className="headerText">
          <div className="eyebrow">{project.service}</div>
          <h1>Ruta de Avance Visible™</h1>
          <p>Seguimiento ejecutivo del proyecto · {project.client}</p>
        </div>
      </div>

      <div className="clientLogoBox">
        <span>Cliente</span>
        <Logo src={project.logoClient} fallback={project.client?.slice(0, 2) || "CL"} />
      </div>

      <div className="headerActions">
        <Badge status={connected ? "Finalizado" : "Bloqueado"}>{connected ? "Conectado a Google Sheets" : "Sin conexión"}</Badge>
        <Badge status={project.status}>Estado general: {project.status}</Badge>
      </div>
    </header>
  );
}

function KpiCards({ project, milestones, pending, setView }) {
  const done = milestones.filter((m) => m.status === "Finalizado" || m.status === "Aprobado").length;
  const blocked = pending.filter((p) => String(p.status).toLowerCase().includes("bloqueado")).length;
  const disorder = Math.max(0, 100 - (Number(project.progress) || 0));

  const cards = [
    { label: "Avance general", value: `${project.progress}%`, icon: BarChart3, note: "Proyecto actualizado", status: project.status },
    { label: "Desorden operativo", value: `${disorder}%`, icon: AlertTriangle, note: "Disminuye con el avance", status: disorder > 60 ? "Bloqueado" : disorder > 30 ? "En validación" : "Finalizado" },
    { label: "Hitos cumplidos", value: `${done}/${milestones.length}`, icon: CheckCircle2, note: "Avance validado", status: "Finalizado", target: "ruta" },
    { label: "Pendientes cliente", value: pending.length, icon: Clock3, note: "Requieren seguimiento", status: "En validación", target: "pendientes" },
    { label: "Bloqueos", value: blocked, icon: LockKeyhole, note: "Impactan cronograma", status: blocked ? "Bloqueado" : "Finalizado", target: "pendientes" },
  ];

  return (
    <div className="kpis">
      {cards.map((card) => {
        const Icon = card.icon;
        const clickable = Boolean(card.target);
        return (
          <div
            className={`card kpi ${clickable ? "clickable" : ""}`}
            key={card.label}
            onClick={() => clickable && setView?.(card.target)}
          >
            <div className="kpiTop">
              <div className="iconBox"><Icon size={22} /></div>
            </div>
            <div className="muted">{card.label}</div>
            <div className="kpiValue">{card.value}</div>
            <div className="badgeRow"><Badge status={card.status}>{card.note}</Badge></div>
          </div>
        );
      })}
    </div>
  );
}

function DisorderCard({ project }) {
  const progress = Number(project.progress) || 0;
  const disorder = Math.max(0, 100 - progress);

  return (
    <section className="card disorderCard">
      <div className="sectionHeader">
        <div>
          <h2>Nivel de desorden operativo</h2>
          <p>Esta barra disminuye conforme avanzan los hitos, validaciones y entregables del proyecto.</p>
        </div>
        <Badge status={disorder > 60 ? "Bloqueado" : disorder > 30 ? "En validación" : "Finalizado"}>{disorder}% restante</Badge>
      </div>
      <div className="disorderMeter">
        <div className="disorderLabels">
          <span>Caos</span>
          <strong>{disorder}%</strong>
          <span>Orden</span>
        </div>
        <ProgressBar value={disorder} status="Bloqueado" reverse />
      </div>
      <div className="disorderNote">
        Avance general: <strong>{progress}%</strong> · Desorden estimado: <strong>{disorder}%</strong>
      </div>
    </section>
  );
}

function ProjectHero({ project, completedText }) {
  const meetUrl = safeUrl(project.linkMeet);
  return (
    <div className="heroCard">
      <div>
        <div className="eyebrow">Tablero conectado</div>
        <h2>{project.service} · {project.client}</h2>
        <p>{project.projectPhrase || completedText}</p>
      </div>

      <div className="heroDetails">
        <div className="responsible">
          <Users size={22} />
          <div>
            <span>Gerente general / dueño</span>
            <strong>{project.generalManager}</strong>
          </div>
        </div>
        <div className="responsible">
          <Users size={22} />
          <div>
            <span>Responsable cliente</span>
            <strong>{project.responsibleClient}</strong>
          </div>
        </div>
        {meetUrl && (
          <a className="meetButton" href={meetUrl} target="_blank" rel="noreferrer">
            <Video size={18} />
            Conectarse a la reunión
          </a>
        )}
      </div>
    </div>
  );
}

function Timeline({ milestones, deliverables = [], detailed = false, setView, setSelectedDeliverable, selectedHito = "", setSelectedHito }) {
  const goToRoute = (title) => {
    setSelectedHito?.(title);
    setView?.("ruta");
  };

  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>Ruta del proyecto</h2>
          <p>
            {detailed
              ? "Cada tarjeta muestra el detalle del hito, lo que incluye y el enlace relacionado."
              : "Hitos visibles para entender qué se logró, qué contiene cada etapa y qué sigue."}
          </p>
        </div>
      </div>

      <div className={detailed ? "timelineDetailed" : "timeline timelineSummary"}>
        {milestones.map((m, index) => {
          const relatedDeliverables = deliverables.filter((d) => String(d.milestone || "").trim().toLowerCase() === String(m.title || "").trim().toLowerCase());
          const isSelected = selectedHito === m.title;

          return (
            <div
              className={`milestone ${!detailed ? "clickable" : ""} ${isSelected ? "selected" : ""}`}
              key={`${m.id}-${m.title}`}
              onClick={() => {
                if (!detailed) goToRoute(m.title);
              }}
              role={!detailed ? "button" : undefined}
              tabIndex={!detailed ? 0 : undefined}
              onKeyDown={(e) => {
                if (!detailed && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  goToRoute(m.title);
                }
              }}
            >
              <div className={`circle ${getStatusType(m.status)}`}>
                {m.status === "Finalizado" || m.status === "Aprobado" ? <CheckCircle2 size={20} /> : index + 1}
              </div>

              <div className="milestoneTitle">{m.title}</div>

              <div className="badgeRow center">
                {m.system && <Badge status="info">{m.system}</Badge>}
                {m.status && <Badge status={m.status}>{m.status}</Badge>}
              </div>

              {m.targetDate && (
                <div className="targetDate">
                  <Clock3 size={14} />
                  <span>Fecha objetivo:</span>
                  <strong>{m.targetDate}</strong>
                </div>
              )}

              <ProgressBar value={m.progress} status={m.status} />
              <div className="milestoneStatus">{m.progress}% de avance</div>

              {detailed && (
                <div className="milestoneDetails alwaysVisible">
                  {m.description && (
                    <div className="detailBlock">
                      <strong>Descripción</strong>
                      <p>{m.description}</p>
                    </div>
                  )}

                  {m.includes && (
                    <div className="detailBlock">
                      <strong>Qué incluye</strong>
                      <p>{m.includes}</p>
                    </div>
                  )}

                  {relatedDeliverables.length > 0 && (
                    <div className="miniList">
                      <strong>Entregables dentro de este hito:</strong>
                      {relatedDeliverables.map((d) => (
                        <button
                          key={d.deliverable}
                          className="miniListItem"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDeliverable?.(d.deliverable);
                            setView?.("entregables");
                          }}
                        >
                          {d.deliverable}
                          <ChevronRight size={14} />
                        </button>
                      ))}
                    </div>
                  )}

                  {m.link && safeUrl(m.link) && (
                    <a
                      className="secondaryLink"
                      href={m.link}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Abrir enlace del hito <ExternalLink size={15} />
                    </a>
                  )}

                  {!m.description && !m.includes && !safeUrl(m.link) && relatedDeliverables.length === 0 && (
                    <p className="muted">
                      Agrega Descripcion, Qué incluye, Link o entregables relacionados para mostrar el detalle de este hito.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Findings({ findings }) {
  const [open, setOpen] = useState("");
  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>Hallazgos encontrados</h2>
          <p>Haz clic en cada hallazgo para ver su descripción, evidencia y solución propuesta.</p>
        </div>
      </div>

      <div className="list">
        {findings.map((item) => {
          const isOpen = open === item.finding;
          const image = safeUrl(item.image);
          return (
            <div key={item.finding} className="findingItem clickable" onClick={() => setOpen(isOpen ? "" : item.finding)}>
              <div className="findingHeader">
                <div>
                  <div className="area">{item.area}</div>
                  <div className="itemTitle">{item.finding}</div>
                  <div className="muted">Sistema que lo resolverá: {item.system}</div>
                  <div className="badgeRow">
                    <Badge status={item.impact}>Impacto: {item.impact}</Badge>
                    <Badge status={item.priority === "Alta" ? "Bloqueado" : "En validación"}>Prioridad: {item.priority}</Badge>
                  </div>
                </div>
                <ChevronRight className={`chevron ${isOpen ? "open" : ""}`} size={20} />
              </div>

              {isOpen && (
                <div className="findingExpanded" onClick={(e) => e.stopPropagation()}>
                  {image && <img className="findingImage" src={image} alt={item.finding} />}
                  {item.description && <p><strong>Descripción:</strong><br />{item.description}</p>}
                  {item.solution && <p><strong>Solución propuesta:</strong><br />{item.solution}</p>}
                  {!item.description && !item.solution && <p className="muted">Agrega columnas Descripcion y Solucion en la pestaña Hallazgos para mostrar más detalle.</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PendingClient({ pending, compact = false, setView }) {
  const [openPending, setOpenPending] = useState("");
  const items = compact ? pending.slice(0, 4) : pending;

  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>Pendientes del cliente</h2>
          <p>Acciones necesarias para avanzar sin retrasos. Haz clic para ver descripción y enlace de aprobación.</p>
        </div>
      </div>
      <div className="badgeRow"><Badge status="En validación">{pending.length} activos</Badge></div>

      <div className="pendingList">
        {items.map((item) => {
          const isOpen = openPending === item.request;
          const link = safeUrl(item.link);

          return (
            <div
              className={`pendingCard clickable ${isOpen ? "selected" : ""}`}
              key={`${item.request}-${item.owner}`}
              onClick={() => {
                if (compact) {
                  setView?.("pendientes");
                  return;
                }
                setOpenPending(isOpen ? "" : item.request);
              }}
            >
              <div className="pendingHeader">
                <div>
                  <div className="itemTitle">{item.request}</div>
                  <div className="muted">Bloquea: {item.blocks}</div>
                </div>
                <ChevronRight className={`chevron ${isOpen ? "open" : ""}`} size={18} />
              </div>

              <div className="pendingMeta">
                <span><strong>Responsable:</strong> {item.owner}</span>
                <span><strong>Fecha:</strong> {item.dueDate}</span>
              </div>

              <div className="badgeRow">
                <Badge status={item.status}>{item.status}</Badge>
              </div>

              {!compact && isOpen && (
                <div className="pendingDetails" onClick={(e) => e.stopPropagation()}>
                  {item.description && (
                    <div className="detailBlock">
                      <strong>Descripción</strong>
                      <p>{item.description}</p>
                    </div>
                  )}

                  {link && (
                    <a className="secondaryLink" href={link} target="_blank" rel="noreferrer">
                      Abrir documento para aprobación <ExternalLink size={15} />
                    </a>
                  )}

                  {!item.description && !link && (
                    <p className="muted">Agrega Descripcion y Link en la pestaña PendientesCliente para mostrar más detalle.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {compact && pending.length > 4 && (
        <button className="plainAction" onClick={() => setView?.("pendientes")}>
          Ver todos los pendientes <ChevronRight size={16} />
        </button>
      )}
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="filter">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="Todos">Todos</option>
        {options.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
    </label>
  );
}

function Deliverables({ deliverables, selectedDeliverable, setSelectedDeliverable, compact = false, setView }) {
  const [systemFilter, setSystemFilter] = useState("Todos");
  const [milestoneFilter, setMilestoneFilter] = useState("Todos");

  const systems = [...new Set(deliverables.map((d) => d.system).filter(Boolean))];
  const milestones = [...new Set(deliverables.map((d) => d.milestone).filter(Boolean))];

  const filtered = deliverables.filter((item) => {
    const systemOk = systemFilter === "Todos" || item.system === systemFilter;
    const milestoneOk = milestoneFilter === "Todos" || item.milestone === milestoneFilter;
    return systemOk && milestoneOk;
  });

  const items = compact ? filtered.slice(0, 6) : filtered;

  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>{compact ? "Entregables principales" : "Entregables"}</h2>
          <p>Vista por sistema e hito, con acceso al documento cuando esté disponible.</p>
        </div>
      </div>

      {!compact && (
        <div className="filters">
          <FilterSelect label="Sistema" value={systemFilter} onChange={setSystemFilter} options={systems} />
          <FilterSelect label="Hito" value={milestoneFilter} onChange={setMilestoneFilter} options={milestones} />
        </div>
      )}

      <div className="deliverablesGrid">
        {items.map((item) => {
          const link = safeUrl(item.link);
          const selected = selectedDeliverable === item.deliverable;
          return (
            <div
              className={`deliverableCard ${selected ? "selected" : ""} ${compact ? "clickable" : ""}`}
              key={`${item.system}-${item.milestone}-${item.deliverable}`}
              onClick={() => {
                if (compact) {
                  setSelectedDeliverable?.(item.deliverable);
                  setView?.("entregables");
                }
              }}
            >
              <div className="area">{item.system}</div>
              <div className="itemTitle">{item.deliverable}</div>
              <div className="badgeRow"><Badge status={item.status}>{item.status}</Badge></div>
              {item.milestone && <div className="muted">Hito: {item.milestone}</div>}
              <ProgressBar value={item.progress} status={item.status} />
              <div className="muted">{item.progress}% de avance</div>
              {item.observation && <p className="observation">{item.observation}</p>}
              {link && (
                <a className="secondaryLink" href={link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                  Ver entregable <ExternalLink size={15} />
                </a>
              )}
            </div>
          );
        })}
      </div>

      {compact && deliverables.length > 6 && (
        <button className="plainAction" onClick={() => setView?.("entregables")}>Ver todos los entregables <ChevronRight size={16} /></button>
      )}
    </section>
  );
}

function UpdatesPanel({ project, updates, setView }) {
  const safeUpdates = updates.length ? updates : [{ title: "Próximo paso", text: project.nextStep, target: "ruta" }];
  const meetUrl = safeUrl(project.linkMeet);

  const inferTarget = (u) => {
    const manual = String(u.target || "").toLowerCase();
    if (manual.includes("hallazgo")) return "hallazgos";
    if (manual.includes("pendiente")) return "pendientes";
    if (manual.includes("entregable")) return "entregables";
    if (manual.includes("ruta") || manual.includes("hito")) return "ruta";
    const title = String(u.title || "").toLowerCase();
    if (title.includes("hallazgo")) return "hallazgos";
    if (title.includes("pendiente")) return "pendientes";
    if (title.includes("entregable")) return "entregables";
    return "ruta";
  };

  return (
    <aside className="rightPanel">
      <div className="nextCard">
        <div className="nextLabel"><Flag size={18} /> Próximo paso</div>
        <h3>{project.nextStep}</h3>
        <p>{project.nextDate}</p>
        {meetUrl && (
          <a className="tealButton" href={meetUrl} target="_blank" rel="noreferrer">
            <Video size={17} />
            Conectarse a Google Meet
          </a>
        )}
      </div>

      {safeUpdates.map((u, index) => {
        const target = inferTarget(u);
        return (
          <div className="card updateCard" key={`${u.title}-${index}`}>
            <div className="updateTitle">
              <div className="iconBox teal"><Search size={20} /></div>
              <strong>{u.title}</strong>
            </div>
            <p>{u.text}</p>
            <button className="linkBtn" onClick={() => setView(target)}>
              Ver detalle <ChevronRight size={16} />
            </button>
          </div>
        );
      })}
    </aside>
  );
}

function Education({ education }) {
  const [systemFilter, setSystemFilter] = useState("Todos");
  const [milestoneFilter, setMilestoneFilter] = useState("Todos");

  const systems = [...new Set(education.map((d) => d.system).filter(Boolean))];
  const milestones = [...new Set(education.map((d) => d.milestone).filter(Boolean))];

  const filtered = education.filter((item) => {
    const systemOk = systemFilter === "Todos" || item.system === systemFilter;
    const milestoneOk = milestoneFilter === "Todos" || item.milestone === milestoneFilter;
    return systemOk && milestoneOk;
  });

  return (
    <section className="card">
      <div className="sectionHeader">
        <div>
          <h2>Educación</h2>
          <p>Aprende qué es cada entregable, para qué sirve y cómo debe leerse.</p>
        </div>
      </div>
      <div className="badgeRow"><Badge status="Disponible">{filtered.length} recursos</Badge></div>

      <div className="filters">
        <FilterSelect label="Sistema" value={systemFilter} onChange={setSystemFilter} options={systems} />
        <FilterSelect label="Hito" value={milestoneFilter} onChange={setMilestoneFilter} options={milestones} />
      </div>

      <div className="educationGrid">
        {filtered.map((item, index) => {
          const image = safeUrl(item.imagePreview);
          const link = safeUrl(item.link);
          return (
            <article className="educationCard" key={`${item.deliverable}-${index}`}>
              {image ? (
                <img className="previewImage" src={image} alt={item.deliverable || "Imagen previa"} />
              ) : (
                <div className="previewPlaceholder"><Monitor size={34} />Imagen previa</div>
              )}
              <div className="educationContent">
                <div className="area">{item.system}</div>
                <h3>{item.deliverable}</h3>
                <div className="badgeRow">
                  {item.milestone && <Badge status="En validación">Hito: {item.milestone}</Badge>}
                  {item.status && <Badge status={item.status}>{item.status}</Badge>}
                </div>
                {item.whatIs && <p><strong>¿Qué es?</strong><br />{item.whatIs}</p>}
                {item.purpose && <p><strong>¿Para qué sirve?</strong><br />{item.purpose}</p>}
                {item.howToRead && <p><strong>¿Cómo leerlo?</strong><br />{item.howToRead}</p>}
                {link && <a className="secondaryLink" href={link} target="_blank" rel="noreferrer">Ver entregable <ExternalLink size={15} /></a>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function App() {
  const [view, setView] = useState("resumen");
  const [data, setData] = useState(demoData);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [selectedDeliverable, setSelectedDeliverable] = useState("");
  const [selectedHito, setSelectedHito] = useState("");

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

  const { project, milestones, findings, pending, deliverables, updates, education } = data;

  const completedText = useMemo(() => {
    const completed = milestones.filter((m) => m.status === "Finalizado" || m.status === "Aprobado").length;
    return `${completed} hitos completados de ${milestones.length}`;
  }, [milestones]);

  return (
    <div className="app">
      <Sidebar view={view} setView={setView} project={project} />

      <main className="main">
        <Header project={project} connected={connected} />

        <div className="content">
          <div className="mobileTabs">
            {[
              ["resumen", "Resumen"],
              ["ruta", "Ruta"],
              ["hallazgos", "Hallazgos"],
              ["pendientes", "Pendientes"],
              ["entregables", "Entregables"],
              ["educacion", "Educación"],
            ].map(([value, label]) => (
              <button key={value} onClick={() => setView(value)} className={view === value ? "active" : ""}>
                {label}
              </button>
            ))}
          </div>

          {error && <div className="errorBox">{error}</div>}

          <ProjectHero project={project} completedText={completedText} />

          {view === "resumen" && (
            <>
              <KpiCards project={project} milestones={milestones} pending={pending} setView={setView} />
              <div className="layout">
                <div className="leftContent">
                  <DisorderCard project={project} />
                  <Timeline milestones={milestones} deliverables={deliverables} setView={setView} setSelectedDeliverable={setSelectedDeliverable} selectedHito={selectedHito} setSelectedHito={setSelectedHito} />
                  <Findings findings={findings} />
                </div>
                <UpdatesPanel project={project} updates={updates} setView={setView} />
              </div>
              <div className="twoColumns">
                <PendingClient pending={pending} compact setView={setView} />
                <Deliverables deliverables={deliverables} compact setView={setView} selectedDeliverable={selectedDeliverable} setSelectedDeliverable={setSelectedDeliverable} />
              </div>
            </>
          )}

          {view === "ruta" && <Timeline milestones={milestones} deliverables={deliverables} setView={setView} setSelectedDeliverable={setSelectedDeliverable} selectedHito={selectedHito} setSelectedHito={setSelectedHito} />}
          {view === "hallazgos" && <Findings findings={findings} />}
          {view === "pendientes" && <PendingClient pending={pending} />}
          {view === "entregables" && <Deliverables deliverables={deliverables} selectedDeliverable={selectedDeliverable} setSelectedDeliverable={setSelectedDeliverable} />}
          {view === "educacion" && <Education education={education} />}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
