import { useEffect, useRef, useState } from "react";

const PRESS_VISUAL_DELAY_MS = 45; // задержка перед "нажатием" (гасит случайные касания при скролле)
const MOVE_CANCEL_PX = 8;         // если палец уехал дальше — это скролл/drag, не тап

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

  const tRef = useRef(null);          // таймер на onPress (после pointerUp)
  const pressVisRef = useRef(null);   // таймер на визуальный pressed
  const firedRef = useRef(false);
  const pointerIdRef = useRef(null);
  const hadPointerDownRef = useRef(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const movedRef = useRef(false);

  const clearTimer = () => {
    if (tRef.current) {
      clearTimeout(tRef.current);
      tRef.current = null;
    }
  };

  const clearPressVis = () => {
    if (pressVisRef.current) {
      clearTimeout(pressVisRef.current);
      pressVisRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      clearPressVis();
    };
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

    movedRef.current = false;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;

    clearTimer();
    clearPressVis();
    setPressed(false);

    // визуальный pressed включаем только если палец НЕ начал скроллить
    pressVisRef.current = setTimeout(() => {
      if (!movedRef.current && hadPointerDownRef.current) {
        setPressed(true);
      }
    }, PRESS_VISUAL_DELAY_MS);

    // Capture pointer чтобы ловить move/up даже если палец съехал
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
      pointerIdRef.current = e.pointerId;
    } catch (_) {}

    props.onPointerDown?.(e);
  };

  const handlePointerMove = (e) => {
    if (!hadPointerDownRef.current) {
      props.onPointerMove?.(e);
      return;
    }

    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;

    if (!movedRef.current && Math.hypot(dx, dy) >= MOVE_CANCEL_PX) {
      movedRef.current = true;

      // это скролл/drag — визуалку убираем сразу
      clearPressVis();
      setPressed(false);
    }

    props.onPointerMove?.(e);
  };

  const handlePointerUp = (e) => {
    if (disabled) return;

    clearPressVis();
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

    // Главное: если палец двигался (скролл) — НЕ считаем это тапом вообще
    if (hadPointerDownRef.current && inside && !movedRef.current) {
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
    clearPressVis();
    setPressed(false);
    clearTimer();

    firedRef.current = false;
    hadPointerDownRef.current = false;
    movedRef.current = false;
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

    // Если уже отработали pointer-ивенты — не дублируем
    if (firedRef.current) return;

    // Если это был drag/scroll (мы его отметили) — тоже не кликаем
    if (movedRef.current) return;

    fireOnce();
    props.onClick?.(e);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      firedRef.current = false;
      clearTimer();
      clearPressVis();

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
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
}