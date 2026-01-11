import { useEffect, useRef, useState } from "react";

const OPEN_MS = 260;  // открытие как было
const CLOSE_MS = 360; // закрытие мягче (важно: совпадает с CSS)

export default function BottomSheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (open) {
      // если начали открывать во время "закрывающей" анимации — отменяем размонтирование
      clearCloseTimer();

      setMounted(true);

      // следующий кадр — чтобы transition гарантированно стартанул в WebView
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    // закрываем (анимация вниз)
    setVisible(false);

    // размонтируем ПОСЛЕ анимации закрытия
    clearCloseTimer();
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
    return () => clearCloseTimer();
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
        <div className="sheetGrabArea">
          <div className="sheetGrabber" />
        </div>

        {title ? <div className="sheetTitle">{title}</div> : null}
        <div className="sheetBody">{children}</div>
        <div className="sheetBottomSafe" />
      </div>
    </div>
  );
}