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
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    hadPointerDownRef.current = true;
    firedRef.current = false;

    clearTimer();
    setPressed(true);

    // Capture pointer so we get pointerup even if finger leaves the element
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
      pointerIdRef.current = e.pointerId;
    } catch (_) {}

    props.onPointerDown?.(e);
  };

  const handlePointerUp = (e) => {
    if (disabled) return;

    setPressed(false);
    clearTimer();

    const el = e.currentTarget;
    const inside = isPointInside(el, e.clientX, e.clientY);

    // release capture
    try {
      if (pointerIdRef.current != null) {
        el.releasePointerCapture(pointerIdRef.current);
      }
    } catch (_) {}

    pointerIdRef.current = null;

    // Only fire if we started press here AND released inside
    if (hadPointerDownRef.current && inside) {
      tRef.current = setTimeout(() => {
        fireOnce();
      }, Math.max(0, delayMs));
    } else {
      firedRef.current = false;
    }

    hadPointerDownRef.current = false;
    props.onPointerUp?.(e);
  };

  const handlePointerCancel = (e) => {
    setPressed(false);
    clearTimer();

    firedRef.current = false;
    hadPointerDownRef.current = false;
    pointerIdRef.current = null;

    props.onPointerCancel?.(e);
  };

  // Click fallback: если pointer-ивенты по какой-то причине не отработали
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
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
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
}