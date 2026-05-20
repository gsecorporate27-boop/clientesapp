
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileText,
  UploadCloud,
  FolderOpen,
  Flag,
  Layers3,
  LockKeyhole,
  LogIn,
  Monitor,
  Search,
  ShieldCheck,
  Sparkles,
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
    [Sparkles, "Portal del proyecto", "portal"],
    [BarChart3, "Resumen", "resumen"],
    [Target, "Ruta del proyecto", "ruta"],
    [Search, "Hallazgos", "hallazgos"],
    [AlertTriangle, "Pendientes", "pendientes"],
    [FileText, "Entregables", "entregables"],
    [UploadCloud, "Carga de documentos", "documentos"],
    [BookOpen, "Lo que vas a recibir", "educacion"],
  ];

  const company = project.companyClient || project.client;
  const contact = project.contactName || project.generalManager || project.responsibleClient;
  const role = project.contactRole || "Responsable del proyecto";

  return (
    <aside className="sidebar premiumSidebar">
      <div className="brand premiumBrand">
        <Logo src={project.logoGSE} fallback="GSE" />
        <div>
          <div className="brandTitle">GSE&CO.</div>
          <div className="brandSub">Ruta de Avance Visible™</div>
        </div>
      </div>

      <div className="clientProfile">
        <div className="clientProfileTop">
          <Logo src={project.logoClient} fallback={company?.slice(0, 2) || "CL"} className="clientMiniLogo" />
          <div>
            <span>Cliente</span>
            <strong>{company}</strong>
          </div>
        </div>

        <div className="clientProfileLine">
          <Users size={15} />
          <div>
            <span>{contact || "Sin contacto definido"}</span>
            <small>{role}</small>
          </div>
        </div>

        <div className="clientProfileLine">
          <Layers3 size={15} />
          <div>
            <span>{project.service}</span>
            <small>Proyecto activo</small>
          </div>
        </div>
      </div>

      <nav className="nav premiumNav">
        {items.map(([Icon, label, value]) => (
          <button key={label} className={`navItem ${view === value ? "active" : ""}`} onClick={() => setView(value)}>
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebarCard premiumSidebarCard">
        <div className="sidebarCardTitle"><ShieldCheck size={18} /> Portal privado</div>
        <p>Avance, decisiones, entregables y próximos pasos del proyecto en un solo lugar.</p>
      </div>
    </aside>
  );
}

function Header({ project, connected }) {
  const company = project.companyClient || project.client;

  return (
    <header className="header premiumHeader">
      <div className="headerIdentity">
        <div className="headerIcon">
          <Building2 size={22} />
        </div>
        <div className="headerText">
          <div className="eyebrow">{project.service}</div>
          <h1>{company}</h1>
          <p>Seguimiento ejecutivo del proyecto · Ruta de Avance Visible™</p>
        </div>
      </div>

      <div className="headerActions">
        <Badge status={connected ? "Finalizado" : "Bloqueado"}>{connected ? "Google Sheets conectado" : "Sin conexión"}</Badge>
        <Badge status={project.status}>Estado: {project.status}</Badge>
      </div>
    </header>
  );
}

function PortalProject({ project, milestones, pending, setView }) {
  const meetUrl = safeUrl(project.linkMeet);
  const company = project.companyClient || project.client;
  const contact = project.contactName || project.generalManager || project.responsibleClient;
  const role = project.contactRole || "Responsable del proyecto";
  const completed = milestones.filter((m) => m.status === "Finalizado" || m.status === "Aprobado").length;
  const disorder = Math.max(0, 100 - (Number(project.progress) || 0));
  const welcome = project.welcomeMessage || "Bienvenido a tu Ruta de Avance Visible™. Aquí podrás revisar el avance del proyecto, los hitos trabajados, los pendientes activos y los entregables construidos por GSE para ordenar tu empresa.";

  return (
    <div className="portalPage">
      <section className="portalHero">
        <div className="portalOverlay"></div>

        <div className="portalContent">
          <div className="portalLogos">
            <Logo src={project.logoGSE} fallback="GSE" />
            <div className="portalDivider"></div>
            <Logo src={project.logoClient} fallback={company?.slice(0, 2) || "CL"} />
          </div>

          <div className="portalEyebrow">
            <Sparkles size={16} />
            Portal privado del proyecto
          </div>

          <h2>Bienvenido a tu Ruta de Avance Visible™</h2>
          <p>{welcome}</p>

          <div className="portalClientBox">
            <div>
              <span>Empresa</span>
              <strong>{company}</strong>
            </div>
            <div>
              <span>Contacto principal</span>
              <strong>{contact || "Sin contacto definido"}</strong>
              <small>{role}</small>
            </div>
            <div>
              <span>Servicio</span>
              <strong>{project.service}</strong>
            </div>
          </div>

          <div className="portalActions">
            <button className="primaryPortalButton" onClick={() => setView("resumen")}>
              <LogIn size={18} />
              Entrar al tablero
              <ArrowRight size={18} />
            </button>

            {meetUrl && (
              <a className="secondaryPortalButton" href={meetUrl} target="_blank" rel="noreferrer">
                <Video size={18} />
                Conectarse a reunión
              </a>
            )}
          </div>
        </div>

        <div className="portalMetrics">
          <div className="portalMetricCard">
            <span>Avance general</span>
            <strong>{project.progress}%</strong>
            <ProgressBar value={project.progress} status={project.status} />
          </div>

          <div className="portalMetricCard">
            <span>Desorden restante</span>
            <strong>{disorder}%</strong>
            <ProgressBar value={disorder} status="Bloqueado" reverse />
          </div>

          <div className="portalMetricCard">
            <span>Hitos completados</span>
            <strong>{completed}/{milestones.length}</strong>
          </div>

          <div className="portalMetricCard">
            <span>Pendientes activos</span>
            <strong>{pending.length}</strong>
          </div>
        </div>
      </section>

      <section className="portalNextStep">
        <div>
          <div className="eyebrow">Próximo paso</div>
          <h3>{project.nextStep}</h3>
          <p>{project.nextDate}</p>
        </div>

        <button className="plainPortalAction" onClick={() => setView("ruta")}>
          Ver ruta del proyecto
          <ChevronRight size={18} />
        </button>
      </section>
    </div>
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
    <div className="heroCard premiumHeroCard">
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
    <section className="card premiumSectionCard">
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
              className={`milestone premiumMilestone ${!detailed ? "clickable" : ""} ${isSelected ? "selected" : ""}`}
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
    <section className="card premiumSectionCard">
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
    <section className="card premiumSectionCard">
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
    <section className="card premiumSectionCard">
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

  const systemOrder = [
    "Sistema 1: Operación sin Caos",
    "Sistema 2: Talento en el Rol Correcto",
    "Sistema 3: Salarios Justos que Retienen",
    "Sistema 4: Desempeño que Optimiza la Estructura",
    "Sistema 5: K&ZEN Interno Permanente",
  ];

  const normalizeSystem = (value = "") => String(value || "").trim();

  const systemsFromSheet = [...new Set(education.map((d) => normalizeSystem(d.system)).filter(Boolean))];
  const orderedSystems = [
    ...systemOrder.filter((system) => systemsFromSheet.includes(system)),
    ...systemsFromSheet.filter((system) => !systemOrder.includes(system)),
  ];

  const milestones = [...new Set(education.map((d) => d.milestone).filter(Boolean))];

  const filtered = education.filter((item) => {
    const systemOk = systemFilter === "Todos" || item.system === systemFilter;
    const milestoneOk = milestoneFilter === "Todos" || item.milestone === milestoneFilter;
    return systemOk && milestoneOk;
  });

  const grouped = orderedSystems
    .map((system) => ({
      system,
      items: filtered.filter((item) => normalizeSystem(item.system) === system),
    }))
    .filter((group) => group.items.length > 0);

  const ungrouped = filtered.filter((item) => !normalizeSystem(item.system));

  const renderEducationCard = (item, index, prefix = "") => {
    const image = safeUrl(item.imagePreview);
    const link = safeUrl(item.link);

    return (
      <article className="educationCard premiumEducationCard" key={`${prefix}${item.deliverable}-${index}`}>
        {image ? (
          <img className="previewImage" src={image} alt={item.deliverable || "Imagen previa"} />
        ) : (
          <div className="previewPlaceholder"><Monitor size={34} />Imagen previa</div>
        )}

        <div className="educationContent">
          <div className="area">{item.system || "Entregable"}</div>
          <h3>{item.deliverable}</h3>

          <div className="badgeRow">
            {item.milestone && <Badge status="En validación">Hito: {item.milestone}</Badge>}
            {item.status && <Badge status={item.status}>{item.status}</Badge>}
          </div>

          {item.whatIs && <p><strong>¿Qué es?</strong><br />{item.whatIs}</p>}
          {item.purpose && <p><strong>¿Para qué sirve?</strong><br />{item.purpose}</p>}
          {item.howToRead && <p><strong>¿Cómo leerlo?</strong><br />{item.howToRead}</p>}

          {link && (
            <a className="secondaryLink" href={link} target="_blank" rel="noreferrer">
              Ver entregable <ExternalLink size={15} />
            </a>
          )}
        </div>
      </article>
    );
  };

  return (
    <section className="card premiumSectionCard">
      <div className="sectionHeader">
        <div>
          <h2>Lo que vas a recibir</h2>
          <p>
            Aquí encontrarás una guía clara de los entregables que estamos construyendo, qué significa cada uno,
            para qué sirve y cómo debes leerlo.
          </p>
        </div>
      </div>

      <p className="sectionIntro">
        La información está organizada por sistemas para que puedas entender cómo cada entregable aporta al orden,
        control y sostenibilidad de tu empresa.
      </p>

      <div className="badgeRow"><Badge status="Disponible">{filtered.length} recursos</Badge></div>

      <div className="filters">
        <FilterSelect label="Sistema" value={systemFilter} onChange={setSystemFilter} options={orderedSystems} />
        <FilterSelect label="Hito" value={milestoneFilter} onChange={setMilestoneFilter} options={milestones} />
      </div>

      <div className="systemsEducation">
        {grouped.map((group, groupIndex) => (
          <div className="systemSection premiumSystemSection" key={group.system}>
            <div className="systemHeader">
              <div className="systemNumber">Sistema {groupIndex + 1}</div>
              <h3>{group.system.replace(/^Sistema\s*\d+\s*:\s*/i, "")}</h3>
            </div>

            <div className="educationGrid">
              {group.items.map((item, index) => renderEducationCard(item, index, group.system))}
            </div>
          </div>
        ))}

        {ungrouped.length > 0 && (
          <div className="systemSection premiumSystemSection">
            <div className="systemHeader">
              <div className="systemNumber">Otros</div>
              <h3>Entregables adicionales</h3>
            </div>

            <div className="educationGrid">
              {ungrouped.map((item, index) => renderEducationCard(item, index, "ungrouped"))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


function DocumentsUpload({ documents = [], project }) {
  const uploadLink = safeUrl(project.documentUploadLink || project.linkCargaDocumentos || "");
  const title = documents.find((item) => item.title)?.title || "Carga de documentos iniciales";
  const description =
    documents.find((item) => item.description)?.description ||
    "Para iniciar el diagnóstico, revisa qué documentos tiene tu empresa y súbelos en la carpeta compartida.";

  const categories = [...new Set(documents.map((item) => item.category).filter(Boolean))];
  const grouped = categories.map((category) => ({
    category,
    items: documents.filter((item) => item.category === category),
  }));
  const ungrouped = documents.filter((item) => !item.category);

  const uploaded = documents.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status.includes("cargado") || status.includes("validado");
  }).length;
  const required = documents.filter((item) => String(item.required || "").toLowerCase().startsWith("s")).length;

  const renderDocumentItem = (item, index) => {
    const status = String(item.status || "").toLowerCase();
    const isDone = status.includes("cargado") || status.includes("validado");

    return (
      <article className="documentChecklistItem" key={`${item.category || "general"}-${item.item}-${index}`}>
        <div className="documentCheckIcon">
          {isDone ? <CheckCircle2 size={19} /> : <ClipboardCheck size={19} />}
        </div>

        <div className="documentChecklistContent">
          <div className="documentItemTop">
            <h3>{item.item}</h3>
            <div className="badgeRow">
              {item.required && <Badge status="Disponible">Obligatorio: {item.required}</Badge>}
              {item.status && <Badge status={item.status}>{item.status}</Badge>}
            </div>
          </div>

          {item.detail && <p>{item.detail}</p>}
          {item.observation && <div className="documentObservation">{item.observation}</div>}
        </div>
      </article>
    );
  };

  return (
    <section className="documentsPage">
      <div className="documentsHero">
        <div className="documentsHeroContent">
          <div className="portalEyebrow">
            <UploadCloud size={16} />
            Checklist documental
          </div>

          <h2>{title}</h2>
          <p>{description}</p>

          <div className="documentsActions">
            {uploadLink ? (
              <a className="primaryPortalButton documentsUploadButton" href={uploadLink} target="_blank" rel="noreferrer">
                <UploadCloud size={18} />
                Subir documentos
                <ExternalLink size={17} />
              </a>
            ) : (
              <button className="primaryPortalButton documentsUploadButton disabledButton" type="button">
                <UploadCloud size={18} />
                Enlace de carga pendiente
              </button>
            )}

            <button className="secondaryPortalButton documentsSecondaryButton" type="button">
              <FolderOpen size={18} />
              {documents.length} ítems solicitados
            </button>
          </div>
        </div>

        <div className="documentsHeroMetrics">
          <div className="portalMetricCard">
            <span>Ítems cargados</span>
            <strong>{uploaded}/{documents.length}</strong>
          </div>
          <div className="portalMetricCard">
            <span>Obligatorios</span>
            <strong>{required}</strong>
          </div>
          <div className="portalMetricCard">
            <span>Estado general</span>
            <strong>{documents.length && uploaded === documents.length ? "Completo" : "En proceso"}</strong>
          </div>
        </div>
      </div>

      <div className="documentsChecklist">
        {!documents.length && (
          <div className="documentCategoryBlock">
            <div className="documentCategoryHeader">
              <div>
                <span>Checklist pendiente</span>
                <h3>No se encontraron ítems en Google Sheet</h3>
              </div>
              <Badge status="Pendiente">Revisar pestaña Documentos</Badge>
            </div>
            <div className="documentItemsGrid">
              <article className="documentChecklistItem">
                <div className="documentCheckIcon"><ClipboardCheck size={19} /></div>
                <div className="documentChecklistContent">
                  <div className="documentItemTop">
                    <h3>Revisa el nombre de la pestaña y los encabezados</h3>
                  </div>
                  <p>La app busca una pestaña llamada Documentos con columnas como Titulo, Descripcion, Categoria, Item, Detalle, Obligatorio, Estado y Observacion.</p>
                </div>
              </article>
            </div>
          </div>
        )}

        {grouped.map((group) => (
          <div className="documentCategoryBlock" key={group.category}>
            <div className="documentCategoryHeader">
              <div>
                <span>Categoría</span>
                <h3>{group.category}</h3>
              </div>
              <Badge status="Disponible">{group.items.length} documentos</Badge>
            </div>

            <div className="documentItemsGrid">
              {group.items.map((item, index) => renderDocumentItem(item, index))}
            </div>
          </div>
        ))}

        {ungrouped.length > 0 && (
          <div className="documentCategoryBlock">
            <div className="documentCategoryHeader">
              <div>
                <span>Categoría</span>
                <h3>Documentos generales</h3>
              </div>
              <Badge status="Disponible">{ungrouped.length} documentos</Badge>
            </div>

            <div className="documentItemsGrid">
              {ungrouped.map((item, index) => renderDocumentItem(item, index))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


function App() {
  const [view, setView] = useState("portal");
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

  const { project, milestones, findings, pending, deliverables, updates, education, documents = [] } = data;

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
              ["portal", "Portal"],
              ["resumen", "Resumen"],
              ["ruta", "Ruta"],
              ["hallazgos", "Hallazgos"],
              ["pendientes", "Pendientes"],
              ["entregables", "Entregables"],
              ["documentos", "Documentos"],
              ["educacion", "Lo que vas a recibir"],
            ].map(([value, label]) => (
              <button key={value} onClick={() => setView(value)} className={view === value ? "active" : ""}>
                {label}
              </button>
            ))}
          </div>

          {error && <div className="errorBox">{error}</div>}

          <ProjectHero project={project} completedText={completedText} />

          {view === "portal" && <PortalProject project={project} milestones={milestones} pending={pending} setView={setView} />}

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
          {view === "documentos" && <DocumentsUpload documents={documents} project={project} />}
          {view === "educacion" && <Education education={education} />}
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
