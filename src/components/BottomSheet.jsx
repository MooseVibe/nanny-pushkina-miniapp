import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const OPEN_MS = 260;  // открытие как было
const CLOSE_MS = 400; // закрытие мягче (важно: совпадает с CSS)

export default function BottomSheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);
  const closeTimerRef = useRef(null);
  const raf1 = useRef(0);
  const raf2 = useRef(0);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const cancelRafs = () => {
    if (raf1.current) cancelAnimationFrame(raf1.current);
    if (raf2.current) cancelAnimationFrame(raf2.current);
    raf1.current = 0;
    raf2.current = 0;
  };

  useEffect(() => {
    if (open) {
      // если начали открывать во время "закрывающей" анимации — отменяем размонтирование
      clearCloseTimer();

      setMounted(true);

      // 2 кадра — в некоторых WebView один RAF бывает недостаточен для корректного старта transition
      cancelRafs();
      raf1.current = requestAnimationFrame(() => {
        raf2.current = requestAnimationFrame(() => setVisible(true));
      });

      return;
    }

    // закрываем (анимация вниз)
    setVisible(false);

    // размонтируем ПОСЛЕ анимации закрытия
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setMounted(false);
    }, CLOSE_MS);

    return () => {};
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

  // cleanup
  useEffect(() => {
    return () => {
      clearCloseTimer();
      cancelRafs();
    };
  }, []);

  if (!mounted) return null;

  const node = (
    <div
      className={`sheetRoot ${visible ? "sheetRoot--open" : ""}`}
      style={{
        // чтобы CSS мог использовать разные длительности, если захочешь
        // (не обязательно, но полезно)
        ["--sheet-open-ms"]: `${OPEN_MS}ms`,
        ["--sheet-close-ms"]: `${CLOSE_MS}ms`,
      }}
    >
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

  // Ключевой фикс: рендерим в body, чтобы не ломалось из-за transform/transition контейнеров
  return createPortal(node, document.body);
}