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
    // только основная кнопка мыши
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

    tRef.current = setTimeout(() => {
      fire();
    }, delayMs);

    props.onPointerUp?.(e);
  };

  const handlePointerCancel = (e) => {
    setPressed(false);
    clearTimer();
    props.onPointerCancel?.(e);
  };

  const handlePointerLeave = (e) => {
    // если мышь ушла — считаем “передумал”
    if (e.pointerType === "mouse") {
      setPressed(false);
      clearTimer();
    }
    props.onPointerLeave?.(e);
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
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      // важно: чтобы не было “мгновенного” перехода обычным onClick
      onClick={(e) => e.preventDefault()}
    />
  );
}