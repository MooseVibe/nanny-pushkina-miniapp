import { useEffect, useRef, useState } from "react";

export default function Pressable({
  as: Tag = "button",
  className = "",
  onPress,
  delayMs = 120,
  disabled = false,
  type,
  ...props
}) {
  const [pressed, setPressed] = useState(false);

  const tRef = useRef(null);
  const firedRef = useRef(false);
  const pointerIdRef = useRef(null);

  const hadPointerDownRef = useRef(false);

  // ✅ NEW: tracking for "scroll vs tap"
  const startRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);
  const MOVE_PX = 10; // порог: если палец уехал — это скролл, не press

  const clearTimer = () => {
    if (tRef.current) {
      clearTimeout(tRef.current);
      tRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const fireOnce = () => {
    if (disabled) return;
    if (firedRef.current) return;
    firedRef.current = true;
    onPress?.();
  };

  const isPointInside = (el, clientX, clientY) => {
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return (
      clientX >= r.left &&
      clientX <= r.right &&
      clientY >= r.top &&
      clientY <= r.bottom
    );
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    hadPointerDownRef.current = true;
    firedRef.current = false;

    // ✅ NEW
    movedRef.current = false;
    startRef.current = { x: e.clientX, y: e.clientY };

    clearTimer();
    setPressed(true);

    // Capture pointer so we get pointerup even if finger leaves the element
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
      pointerIdRef.current = e.pointerId;
    } catch (_) {}

    props.onPointerDown?.(e);
  };

  // ✅ NEW: если палец поехал — считаем это скроллом и убираем pressed
  const handlePointerMove = (e) => {
    if (disabled) return;
    if (pointerIdRef.current != null && e.pointerId !== pointerIdRef.current) return;
    if (!hadPointerDownRef.current) return;

    const dx = Math.abs(e.clientX - startRef.current.x);
    const dy = Math.abs(e.clientY - startRef.current.y);

    if (!movedRef.current && (dx > MOVE_PX || dy > MOVE_PX)) {
      movedRef.current = true;
      setPressed(false); // ✅ не показываем "нажатие" при скролле
      clearTimer();      // ✅ и на всякий — прибиваем возможный таймер
    }

    props.onPointerMove?.(e);
  };

  const handlePointerUp = (e) => {
    if (disabled) return;

    setPressed(false);
    clearTimer();

    const el = e.currentTarget;

    // release capture
    try {
      if (pointerIdRef.current != null) {
        el.releasePointerCapture(pointerIdRef.current);
      }
    } catch (_) {}

    pointerIdRef.current = null;

    // ✅ если это был скролл/drag — не считаем это кликом вообще
    if (movedRef.current) {
      firedRef.current = false;
      hadPointerDownRef.current = false;
      movedRef.current = false;
      props.onPointerUp?.(e);
      return;
    }

    const inside = isPointInside(el, e.clientX, e.clientY);

    // Only fire if we started press here AND released inside
    if (hadPointerDownRef.current && inside) {
      tRef.current = setTimeout(() => {
        fireOnce();
      }, Math.max(0, delayMs));
    } else {
      firedRef.current = false;
    }

    hadPointerDownRef.current = false;
    movedRef.current = false;
    props.onPointerUp?.(e);
  };

  const handlePointerCancel = (e) => {
    setPressed(false);
    clearTimer();

    firedRef.current = false;
    hadPointerDownRef.current = false;
    pointerIdRef.current = null;

    // ✅ NEW
    movedRef.current = false;

    props.onPointerCancel?.(e);
  };

  // Click fallback: если pointer-ивенты по какой-то причине не отработали
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // ✅ если был скролл — не вызываем onPress по клику тоже
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }

    // Если отработали pointer-ивенты — не дублируем
    if (firedRef.current) return;

    // Без второй "анимационной" задержки: клик — это уже завершённое действие
    fireOnce();
    props.onClick?.(e);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      firedRef.current = false;
      clearTimer();
      setPressed(true);

      tRef.current = setTimeout(() => {
        setPressed(false);
        fireOnce();
      }, Math.max(0, delayMs));
    }

    props.onKeyDown?.(e);
  };

  const mergedClass =
    `pressable${pressed ? " isPressed" : ""}` + (className ? ` ${className}` : "");

  return (
    <Tag
      {...props}
      type={Tag === "button" ? type || "button" : undefined}
      className={mergedClass}
      disabled={Tag === "button" ? disabled : undefined}
      aria-disabled={Tag !== "button" && disabled ? "true" : undefined}
      tabIndex={disabled && Tag !== "button" ? -1 : props.tabIndex}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}   // ✅ NEW
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
}