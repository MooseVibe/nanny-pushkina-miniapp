import { useRef, useState } from "react";

export default function Pressable({
  as: Tag = "button",
  className = "",
  onPress,
  delayMs = 140,
  disabled = false,
  type,
  ...props
}) {
  const [pressed, setPressed] = useState(false);
  const firedRef = useRef(false);
  const tRef = useRef(null);

  const clearTimer = () => {
    if (tRef.current) {
      clearTimeout(tRef.current);
      tRef.current = null;
    }
  };

  const fire = () => {
    if (disabled) return;
    if (firedRef.current) return;
    firedRef.current = true;
    onPress?.();
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;

    firedRef.current = false;
    clearTimer();
    setPressed(true);

    props.onPointerDown?.(e);
  };

  const handlePointerUp = (e) => {
    if (disabled) return;

    setPressed(false);
    clearTimer();

    // Даём прожиму “показаться”, и только потом делаем action
    tRef.current = setTimeout(() => {
      fire();
    }, delayMs);

    props.onPointerUp?.(e);
  };

  const handlePointerCancel = (e) => {
    setPressed(false);
    clearTimer();
    firedRef.current = false;
    props.onPointerCancel?.(e);
  };

  const handlePointerLeave = (e) => {
    // Если мышь ушла — считаем “передумал”
    if (e.pointerType === "mouse") {
      setPressed(false);
      clearTimer();
      firedRef.current = false;
    }
    props.onPointerLeave?.(e);
  };

  // Fallback: если pointer события не прилетели (или клавиатура)
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Если уже сработали через pointerUp — второй раз не надо
    if (firedRef.current) return;

    // Если это ссылка — пусть ведёт куда надо (но мы всё равно можем задержать)
    // Для button/div просто вызываем action.
    if (delayMs > 0) {
      e.preventDefault();
      clearTimer();
      tRef.current = setTimeout(() => {
        fire();
      }, delayMs);
    } else {
      fire();
    }

    props.onClick?.(e);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;

    // Enter / Space должны работать как “tap”
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      firedRef.current = false;
      clearTimer();
      setPressed(true);

      // Небольшая задержка, чтобы прожим был виден даже с клавиатуры
      tRef.current = setTimeout(() => {
        setPressed(false);
        fire();
      }, delayMs);
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
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
}