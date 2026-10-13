import { useState, useEffect, useRef } from "react";

const STORAGE_KEY = "investment-notepad-notes-v1";

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn("Failed to load notes:", e);
  }
  return [];
}

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export default function Notepad({
  isOpen,
  onClose,
  zIndex = 1000,
  onActivate,
}) {
  const [notes, setNotes] = useState(loadNotes);
  const [activeId, setActiveId] = useState(() => loadNotes()[0]?.id ?? null);
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const modalRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
      console.warn("Failed to save notes:", e);
    }
  }, [notes]);

  useEffect(() => {
    if (isOpen && !position && modalRef.current) {
      const { offsetWidth: w, offsetHeight: h } = modalRef.current;
      setPosition({
        x: Math.max(0, (window.innerWidth - w) / 2),
        y: Math.max(0, (window.innerHeight - h) / 2),
      });
    }
  }, [isOpen, position]);

  useEffect(() => {
    const handleResize = () => {
      if (!modalRef.current) return;
      const { offsetWidth: w, offsetHeight: h } = modalRef.current;
      setPosition((prev) =>
        prev
          ? {
              x: Math.min(Math.max(prev.x, 0), Math.max(0, window.innerWidth - w)),
              y: Math.min(Math.max(prev.y, 0), Math.max(0, window.innerHeight - h)),
            }
          : prev
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e) => {
      if (!modalRef.current) return;
      const { offsetWidth: w, offsetHeight: h } = modalRef.current;
      const newX = e.clientX - dragOffset.current.x;
      const newY = e.clientY - dragOffset.current.y;
      setPosition({
        x: Math.min(Math.max(newX, 0), Math.max(0, window.innerWidth - w)),
        y: Math.min(Math.max(newY, 0), Math.max(0, window.innerHeight - h)),
      });
    };

    const handleUp = () => setIsDragging(false);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [isDragging]);

  const handleHeaderPointerDown = (e) => {
    if (e.button !== 0) return;
    if (e.target.closest("button")) return;
    if (!position) return;
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    setIsDragging(true);
  };

  const activeNote = notes.find((n) => n.id === activeId) || null;

  const createNote = () => {
    const newNote = {
      id: makeId(),
      title: "Untitled Note",
      body: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveId(newNote.id);
  };

  const updateActive = (patch) => {
    if (!activeId) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeId ? { ...n, ...patch, updatedAt: Date.now() } : n
      )
    );
  };

  const deleteNote = (id) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      if (id === activeId) setActiveId(next[0]?.id ?? null);
      return next;
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      const el = document.activeElement;
      const tag = el?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") {
        el.blur();
        return;
      }
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal"
      style={{
        position: "fixed",
        top: position?.y ?? 0,
        left: position?.x ?? 0,
        visibility: position ? "visible" : "hidden",
        zIndex,
      }}
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Notepad"
    >
      <div className="modal-content notepad" onPointerDown={onActivate}>
        <div
          className="modal-header"
          onPointerDown={handleHeaderPointerDown}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <span className="drag-hint">Investment Notes</span>
          <button
            className="close"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Close notepad"
            type="button"
          >
            &times;
          </button>
        </div>

        <div className="notepad-body">
          <aside className="notepad-sidebar">
            <button type="button" className="new-note-btn" onClick={createNote}>
              + New Note
            </button>

            <ul className="note-list">
              {notes.length === 0 && (
                <li className="empty-hint">No notes yet.</li>
              )}
              {notes.map((n) => (
                <li
                  key={n.id}
                  className={`note-item ${n.id === activeId ? "active" : ""}`}
                  onClick={() => setActiveId(n.id)}
                >
                  <div className="note-item-title">
                    {n.title || "Untitled Note"}
                  </div>
                  <div className="note-item-date">
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </div>
                  <button
                    type="button"
                    className="note-delete"
                    aria-label={`Delete note ${n.title}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(n.id);
                    }}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <section className="notepad-editor">
            {activeNote ? (
              <>
                <input
                  type="text"
                  className="note-title-input"
                  value={activeNote.title}
                  onChange={(e) => updateActive({ title: e.target.value })}
                  placeholder="Note title"
                />
                <textarea
                  className="note-body-input"
                  value={activeNote.body}
                  onChange={(e) => updateActive({ body: e.target.value })}
                  placeholder="Write your investment notes here…"
                />
                <div className="note-meta">
                  <span>
                    Updated {new Date(activeNote.updatedAt).toLocaleString()}
                  </span>
                  <span>
                    {activeNote.body.length} chars ·{" "}
                    {activeNote.body.trim()
                      ? activeNote.body.trim().split(/\s+/).length
                      : 0}{" "}
                    words
                  </span>
                </div>
              </>
            ) : (
              <div className="empty-editor">
                <p>No note selected.</p>
                <p>Click “+ New Note” to start writing.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}