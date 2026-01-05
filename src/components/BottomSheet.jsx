import { useEffect, useRef, useState } from "react";

const CLOSE_MS = 240; // должно совпадать с transition в CSS (≈220–260)

export default function BottomSheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open); // управляет классом --open
  const closeTimerRef = useRef(null);

  // Когда open=true → монтируем и показываем (с анимацией)
  useEffect(() => {
    if (open) {
      setMounted(true);

      // Важно: следующий тик, чтобы CSS transition успел схватиться
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    // Когда open=false → запускаем анимацию закрытия
    setVisible(false);

    // и размонтируем ПОСЛЕ анимации
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setMounted(false);
    }, CLOSE_MS);
  }, [open]);

  // Esc → закрыть
  useEffect(() => {
    if (!mounted) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose]);

  // Блокируем скролл фона, пока штора открыта/анимируется
  useEffect(() => {
    if (!mounted) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted]);

  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current);
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

        <div className="sheetBottomSafe" />
      </div>
    </div>
  );
}