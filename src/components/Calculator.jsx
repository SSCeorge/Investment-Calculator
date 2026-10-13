import { useState, useEffect, useRef, useCallback } from "react";

function safeEvaluate(expression) {
  const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, "");
  if (!sanitized.trim()) return "";
  
  const result = Function(`"use strict"; return (${sanitized});`)();
  if (result === undefined || Number.isNaN(result)) throw new Error("Invalid");
  return String(result);
}

export default function Calculator({
  isOpen,
  onClose,
  zIndex = 1000,
  onActivate,
}) {
  const [input, setInput] = useState("");
  const [position, setPosition] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const modalRef = useRef(null);
  const inputRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  /* Center modal on first open */
  useEffect(() => {
    if (isOpen && !position && modalRef.current) {
      const { offsetWidth: w, offsetHeight: h } = modalRef.current;
      setPosition({
        x: Math.max(0, (window.innerWidth - w) / 2),
        y: Math.max(0, (window.innerHeight - h) / 2),
      });
    }
  }, [isOpen, position]);

  /* Keep modal inside viewport on resize */
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

  /* Dragging */
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

  const handleCalculate = useCallback(() => {
    setInput((prev) => {
      try {
        return safeEvaluate(prev);
      } catch {
        return "Error";
      }
    });
  }, []);

  /* Keyboard input — only when no editable element has focus */
  useEffect(() => {
    if (!isOpen) return;

    const isEditableFocused = () => {
      const el = document.activeElement;
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        el.isContentEditable
      );
    };

    const handleKeyDown = (e) => {
      if (isEditableFocused()) {
        if (e.key === "Escape") {
          if (document.activeElement === inputRef.current) {
            inputRef.current.blur();
          } else {
            document.activeElement.blur();
          }
        }
        return;
      }

      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (/^[0-9+\-*/.]$/.test(e.key)) {
        e.preventDefault();
        setInput((prev) => (prev === "Error" ? e.key : prev + e.key));
      } else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        handleCalculate();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setInput((prev) => (prev === "Error" ? "" : prev.slice(0, -1)));
      } else if (e.key === "Delete") {
        e.preventDefault();
        setInput("");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, handleCalculate]);

  const append = (value) =>
    setInput((prev) => (prev === "Error" ? value : prev + value));

  const clear = () => setInput("");

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
      aria-label="Calculator"
    >
      <div className="modal-content" onPointerDown={onActivate}>
        <div
          className="modal-header"
          onPointerDown={handleHeaderPointerDown}
          style={{ cursor: isDragging ? "grabbing" : "grab" }}
        >
          <span className="drag-hint">Drag me</span>
          <button
            className="close"
            onClick={onClose}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label="Close calculator"
            type="button"
          >
            &times;
          </button>
        </div>

        <div className="calculator">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="0"
            inputMode="decimal"
            aria-label="Calculator display"
          />

          <div className="buttons">
            <button type="button" onClick={() => append("7")}>7</button>
            <button type="button" onClick={() => append("8")}>8</button>
            <button type="button" onClick={() => append("9")}>9</button>
            <button type="button" onClick={() => append("/")}>/</button>

            <button type="button" onClick={() => append("4")}>4</button>
            <button type="button" onClick={() => append("5")}>5</button>
            <button type="button" onClick={() => append("6")}>6</button>
            <button type="button" onClick={() => append("*")}>*</button>

            <button type="button" onClick={() => append("1")}>1</button>
            <button type="button" onClick={() => append("2")}>2</button>
            <button type="button" onClick={() => append("3")}>3</button>
            <button type="button" onClick={() => append("-")}>-</button>

            <button type="button" onClick={() => append("0")}>0</button>
            <button type="button" onClick={() => append(".")}>.</button>
            <button type="button" onClick={clear} className="clear">C</button>
            <button type="button" onClick={() => append("+")}>+</button>

            <button
              type="button"
              onClick={handleCalculate}
              className="equals"
              style={{ gridColumn: "span 4" }}
            >
              =
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}