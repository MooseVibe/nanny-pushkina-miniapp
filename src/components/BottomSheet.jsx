import { useEffect, useRef, useState } from "react";

const CLOSE_MS = 260; // должно совпадать с CSS transition (см. ниже)

export default function BottomSheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef(null);

  useEffect(() => {
    if (open) {
      setMounted(true);

      // важно: следующий кадр, чтобы transition гарантированно стартанул в WebView
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    // закрываем
    setVisible(false);

    // размонтируем ПОСЛЕ анимации
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setMounted(false);
    }, CLOSE_MS);
  }, [open]);

  // Esc -> закрыть
  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  // блокируем фон-скролл, пока шторка в DOM (и при открытии, и при закрытии-анимации)
  useEffect(() => {
    if (!mounted) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className={`sheetRoot ${visible ? "sheetRoot--open" : ""}`}>
      {/* Backdrop */}
      <button
        type="button"
        className="sheetBackdrop"
        aria-label="Закрыть"
        onClick={() => onClose?.()}
      />

      {/* Panel */}
      <div
        className="sheetPanel"
        role="dialog"
        aria-modal="true"
        aria-label={title || "Bottom sheet"}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Grabber */}
        <div className="sheetGrabArea">
          <div className="sheetGrabber" />
        </div>

        {title ? <div className="sheetTitle">{title}</div> : null}

        <div className="sheetBody">{children}</div>

        {/* нижний safe-area */}
        <div className="sheetBottomSafe" />
      </div>
    </div>
  );
}