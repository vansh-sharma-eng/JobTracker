import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  CalendarPlus,
  ExternalLink,
  Briefcase,
  Clock,
  Bookmark,
  Send,
  MessageSquare,
  Trophy,
  XCircle,
} from "lucide-react";
import Header from "../components/Header";
import { fetchJobs, updateJobStatus } from "../api/jobs";
import { getGoogleCalendarLink } from "../api/integrations";

const COLUMNS = [
  { key: "SAVED",     label: "Saved",     icon: Bookmark,       color: "#a855f7", bg: "rgba(168,85,247,.08)", soft: "rgba(168,85,247,.16)", line: "rgba(168,85,247,.28)" },
  { key: "APPLIED",   label: "Applied",   icon: Send,           color: "#60a5fa", bg: "rgba(96,165,250,.08)", soft: "rgba(96,165,250,.16)", line: "rgba(96,165,250,.28)" },
  { key: "INTERVIEW", label: "Interview", icon: MessageSquare,  color: "#fbbf24", bg: "rgba(251,191,36,.08)", soft: "rgba(251,191,36,.15)", line: "rgba(251,191,36,.28)" },
  { key: "OFFER",     label: "Offer",     icon: Trophy,         color: "#34d399", bg: "rgba(52,211,153,.08)", soft: "rgba(52,211,153,.15)", line: "rgba(52,211,153,.28)" },
  { key: "REJECTED",  label: "Rejected",  icon: XCircle,        color: "#f87171", bg: "rgba(248,113,113,.08)", soft: "rgba(248,113,113,.15)", line: "rgba(248,113,113,.28)" },
];

const EMPTY_BOARD = { SAVED: [], APPLIED: [], INTERVIEW: [], OFFER: [], REJECTED: [] };

// dot color for work type (same palette as the column colors)
const LOCATION_DOT = {
  REMOTE: "#34d399",
  HYBRID: "#fbbf24",
  ONSITE: "#60a5fa",
  "ON-SITE": "#60a5fa",
};

const KANBAN_CSS = `
.kbn-main {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 8px 20px 32px;
  font-family: inherit;
  container-type: inline-size;
}

/* 5 equal columns that always fill the available width,
   whether the sidebar is open or collapsed */
.kbn-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  align-items: start;
  width: 100%;
}
.kbn-skeleton { height: 460px; border-radius: 12px; }

/* ── Column ── */
.kbn-col {
  min-width: 0;
  background: #1b1b1e;
  border: 1px solid rgba(255,255,255,.06);
  border-radius: 12px;
  padding: 6px;
}
.kbn-col-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
  font-size: 13.5px;
  font-weight: 600;
}
.kbn-col-head svg { opacity: .9; }
.kbn-col-title { margin: 0; font-size: 13.5px; font-weight: 600; font-family: inherit; color: inherit; }
.kbn-col-count { margin-left: auto; font-size: 12px; font-weight: 600; opacity: .8; }

/* ── Drop zone ── */
.kbn-drop {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 140px;
  border-radius: 8px;
  outline: 1.5px dashed transparent;
  outline-offset: 2px;
  transition: outline-color .15s, background .15s;
}
.kbn-drop-over { background: rgba(255,255,255,.02); }
.kbn-empty {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 36px 0; color: #71717a; font-size: 12px;
}
.kbn-empty p { margin: 4px 0 0; }
.kbn-empty span { font-size: 11px; opacity: .7; }

/* ── Card ── */
.kbn-card {
  background: #27272b;
  border: 1px solid rgba(255,255,255,.05);
  border-radius: 8px;
  overflow: hidden;
  cursor: grab;
  transition: border-color .15s, background .15s, box-shadow .15s;
}
.kbn-card:hover { border-color: rgba(255,255,255,.14); }
.kbn-card-drag { cursor: grabbing; border-color: rgba(255,255,255,.28); box-shadow: 0 14px 34px rgba(0,0,0,.55); }

.kbn-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255,255,255,.07);
}
.kbn-logo {
  width: 24px; height: 24px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; flex-shrink: 0; text-transform: uppercase;
}
.kbn-card-company {
  flex: 1; min-width: 0;
  font-size: 14px; font-weight: 500; color: #f4f4f5;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.kbn-card-ext { display: inline-flex; color: #8b8b93; transition: color .15s; }
.kbn-card-ext:hover { color: #f4f4f5; }

.kbn-card-fields { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 10px; }
.kbn-field-label { font-size: 12.5px; color: #8b8b93; line-height: 1.2; }
.kbn-field-value {
  margin-top: 3px;
  font-size: 13.5px; color: #f4f4f5; line-height: 1.3;
  display: flex; align-items: center; gap: 8px;
}
.kbn-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.kbn-dot-empty { background: transparent; border: 1.5px solid #8b8b93; }

.kbn-card-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid rgba(255,255,255,.07);
  font-size: 12.5px;
  color: #7a7a82;
}
.kbn-card-foot svg { flex-shrink: 0; }
.kbn-card-gcal {
  margin-left: auto;
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 6px;
  border: 1px solid rgba(251,191,36,.3);
  background: rgba(251,191,36,.08); color: #fbbf24;
  font-size: 11px; font-family: inherit; cursor: pointer; transition: background .15s;
}
.kbn-card-gcal:hover { background: rgba(251,191,36,.16); }

/* Slightly tighter cards when the board area gets narrower (sidebar open) */
@container (max-width: 1180px) {
  .kbn-grid { gap: 10px; }
  .kbn-col { padding: 5px; }
  .kbn-col-head { padding: 6px 8px; font-size: 12.5px; }
  .kbn-col-title { font-size: 12.5px; }
  .kbn-card-head { padding: 8px 10px; gap: 8px; }
  .kbn-logo { width: 22px; height: 22px; font-size: 11px; }
  .kbn-card-company { font-size: 13px; }
  .kbn-card-fields { padding: 8px 10px 10px; gap: 8px; }
  .kbn-field-label { font-size: 11.5px; }
  .kbn-field-value { font-size: 12.5px; word-break: break-word; }
  .kbn-card-foot { padding: 8px 10px; font-size: 11.5px; }
}

/* Very narrow areas: keep columns readable and scroll sideways instead of squashing */
@container (max-width: 860px) {
  .kbn-grid {
    grid-template-columns: repeat(5, minmax(210px, 1fr));
    overflow-x: auto;
    padding-bottom: 12px;
  }
}

@media (max-width: 900px) { .kbn-main { padding: 8px 12px 24px; } }
`;

const Kanban = () => {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchJobs({ size: 250, sort: "createdAt,desc" });
      const grouped = { SAVED: [], APPLIED: [], INTERVIEW: [], OFFER: [], REJECTED: [] };
      data.content.forEach((job) => {
        if (grouped[job.status]) grouped[job.status].push(job);
        else grouped.APPLIED.push(job);
      });
      setBoard(grouped);
    } catch {
      toast.error("Could not load the board");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    setBoard((prev) => {
      const sourceItems = Array.from(prev[sourceCol] || []);
      const [moved] = sourceItems.splice(source.index, 1);
      const destItems = sourceCol === destCol ? sourceItems : Array.from(prev[destCol] || []);
      const updatedMoved = { ...moved, status: destCol };
      destItems.splice(destination.index, 0, updatedMoved);
      return { ...prev, [sourceCol]: sourceCol === destCol ? destItems : sourceItems, [destCol]: destItems };
    });

    if (sourceCol !== destCol) {
      try {
        await updateJobStatus(Number(draggableId), destCol);
        toast.success(`Moved to ${destCol.toLowerCase()}`);
      } catch {
        toast.error("Could not update status");
        load();
      }
    }
  };

  const handleAddCalendar = async (e, jobId) => {
    e.stopPropagation();
    try {
      const { calendarUrl } = await getGoogleCalendarLink(jobId);
      if (calendarUrl) window.open(calendarUrl, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Could not generate calendar link");
    }
  };

  const totalJobs = Object.values(board).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <>
      <style>{KANBAN_CSS}</style>
      <Header
        title="Kanban Board"
        subtitle={`${totalJobs} application${totalJobs !== 1 ? "s" : ""} across ${COLUMNS.length} stages`}
      />

      <main className="kbn-main">
        {loading ? (
          <div className="kbn-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton kbn-skeleton" />
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="kbn-grid">
              {COLUMNS.map((col) => {
                const ColIcon = col.icon;
                const count = board[col.key]?.length ?? 0;
                return (
                  <section key={col.key} className="kbn-col">
                    {/* Coloured header bar */}
                    <div
                      className="kbn-col-head"
                      style={{ background: col.soft, color: col.color, border: `1px solid ${col.line}` }}
                    >
                      <ColIcon size={14} />
                      <h3 className="kbn-col-title">{col.label}</h3>
                      <span className="kbn-col-count">{count}</span>
                    </div>

                    <Droppable droppableId={col.key}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`kbn-drop ${snapshot.isDraggingOver ? "kbn-drop-over" : ""}`}
                          style={snapshot.isDraggingOver ? { outlineColor: col.color } : undefined}
                        >
                          {count === 0 && !snapshot.isDraggingOver && (
                            <div className="kbn-empty">
                              <Briefcase size={20} strokeWidth={1.3} />
                              <p>No {col.label.toLowerCase()} jobs</p>
                              <span>Drag cards here</span>
                            </div>
                          )}

                          {board[col.key]?.map((job, index) => {
                            const loc = job.locationType?.toUpperCase();
                            const dot = LOCATION_DOT[loc];
                            return (
                              <Draggable key={job.id} draggableId={String(job.id)} index={index}>
                                {(dp, ds) => (
                                  <article
                                    ref={dp.innerRef}
                                    {...dp.draggableProps}
                                    {...dp.dragHandleProps}
                                    className={`kbn-card ${ds.isDragging ? "kbn-card-drag" : ""}`}
                                  >
                                    {/* Header: logo + company + open link */}
                                    <div className="kbn-card-head">
                                      <div className="kbn-logo" style={{ background: col.bg, color: col.color }}>
                                        {job.companyName?.charAt(0) || "?"}
                                      </div>
                                      <span className="kbn-card-company">{job.companyName}</span>
                                      {job.jobUrl && (
                                        <a
                                          href={job.jobUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          onClick={(e) => e.stopPropagation()}
                                          className="kbn-card-ext"
                                          title="Open posting"
                                        >
                                          <ExternalLink size={14} />
                                        </a>
                                      )}
                                    </div>

                                    {/* Labeled fields */}
                                    <div className="kbn-card-fields">
                                      <div>
                                        <div className="kbn-field-label">Role</div>
                                        <div className="kbn-field-value">{job.role}</div>
                                      </div>
                                      <div>
                                        <div className="kbn-field-label">Applied Date</div>
                                        <div className="kbn-field-value">{job.appliedDate || "Recently"}</div>
                                      </div>
                                      {job.salary && (
                                        <div>
                                          <div className="kbn-field-label">Salary</div>
                                          <div className="kbn-field-value">{job.salary}</div>
                                        </div>
                                      )}
                                      <div>
                                        <div className="kbn-field-label">Work Type</div>
                                        <div className="kbn-field-value">
                                          <span
                                            className={`kbn-dot ${dot ? "" : "kbn-dot-empty"}`}
                                            style={dot ? { background: dot } : undefined}
                                          />
                                          <span style={{ textTransform: "capitalize" }}>
                                            {job.locationType?.toLowerCase() || "Not specified"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="kbn-card-foot">
                                      <Clock size={15} />
                                      <span>In {col.label}</span>
                                      {col.key === "INTERVIEW" && (
                                        <button
                                          type="button"
                                          onClick={(e) => handleAddCalendar(e, job.id)}
                                          className="kbn-card-gcal"
                                          title="Add to Google Calendar"
                                        >
                                          <CalendarPlus size={12} /> GCal
                                        </button>
                                      )}
                                    </div>
                                  </article>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </section>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </main>
    </>
  );
};

export default Kanban;