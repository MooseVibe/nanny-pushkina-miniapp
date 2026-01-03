import { useEffect, useRef, useState } from "react";

const OPEN_MS = 220;  // должно совпадать с твоим CSS transition (sheetPanel)
const CLOSE_MS = 220;

export default function BottomSheet({ open, onClose, title, children }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  const startYRef = useRef(null);
  const lastYRef = useRef(null);

  // 1) Монтируемся/размонтируемся так, чтобы анимация была ПЛАВНОЙ (и на open, и на close)
  useEffect(() => {
    if (open) {
      setMounted(true);

      // следующий тик — чтобы transition успел примениться (иначе "резко")
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setVisible(true);
        });
      });
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), CLOSE_MS);
      return () => clearTimeout(t);
    }
  }, [open]);

  // 2) Лочим фон (скролл сзади)
  useEffect(() => {
    if (!mounted) return;

    const body = document.body;
    const html = document.documentElement;

    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;

    const scrollY = window.scrollY || window.pageYOffset || 0;

    // Блокируем прокрутку (надёжно и в iOS WebView)
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    // На всякий — чтобы не было "подскролла" у root
    const prevHtmlOverscroll = html.style.overscrollBehaviorY;
    html.style.overscrollBehaviorY = "none";

    // Запрещаем touchmove на фоне (важно для мобильного телеграма)
    const preventTouchMove = (e) => {
      // если тянем по затемнению/вне панели — не даём скроллить страницу
      e.preventDefault();
    };

    // Вешаем на документ, но будем останавливать только когда sheet открыт
    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventTouchMove);

      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;

      html.style.overscrollBehaviorY = prevHtmlOverscroll;

      // Возвращаем скролл туда, где он был
      const y = Math.abs(parseInt(prevBodyTop || "0", 10)) || scrollY;
      window.scrollTo(0, y);
    };
  }, [mounted]);

  // ESC (на десктопе удобно)
  useEffect(() => {
    if (!mounted) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, onClose]);

  const close = () => onClose?.();

  // 3) Свайп вниз по панели (простая версия)
  const onTouchStart = (e) => {
    const y = e.touches?.[0]?.clientY;
    startYRef.current = y ?? null;
    lastYRef.current = y ?? null;
  };

  const onTouchMove = (e) => {
    const y = e.touches?.[0]?.clientY;
    if (y == null) return;
    lastYRef.current = y;
  };

  const onTouchEnd = () => {
    const startY = startYRef.current;
    const endY = lastYRef.current;
    startYRef.current = null;
    lastYRef.current = null;

    if (startY == null || endY == null) return;

    const dy = endY - startY;
    // свайп вниз на 60px+ закрывает
    if (dy > 60) close();
  };

  if (!mounted) return null;

  return (
    <div className={`sheetRoot ${visible ? "sheetRoot--open" : ""}`}>
      {/* затемнение, кликом закрываем */}
      <button
        type="button"
        className="sheetBackdrop"
        aria-label="Закрыть"
        onClick={close}
      />

      {/* панель */}
      <div
        className="sheetPanel"
        role="dialog"
        aria-modal="true"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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