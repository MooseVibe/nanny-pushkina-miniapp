import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Pressable from "./Pressable";


let __ctaOwnerToken = 0;

function getRoot() {
  if (typeof document === "undefined") return null;
  return document.getElementById("cta-root");
}

function setCtaMountedFlag(on) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("ctaMounted", !!on);
}

function bumpOwner() {
  __ctaOwnerToken += 1;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cta-owner-changed"));
  }
  return __ctaOwnerToken;
}

export default function CtaButton({
  children,
  onPress,
  onClick, // fallback, чтобы не падало на старом коде
  disabled = false,
  delayMs = 140,
  className = "primaryCta",
  ariaDisabled,
}) {
  // наш токен — фиксируется на весь жизненный цикл экземпляра
  const myToken = useMemo(() => bumpOwner(), []);

  const [root, setRoot] = useState(() => getRoot());
  const [ownerTick, setOwnerTick] = useState(0);

  // 1) ждём появления #cta-root (если вдруг монтируется позже)
  useEffect(() => {
    if (root) return;

    let raf = 0;
    let tries = 0;

    const tick = () => {
      const r = getRoot();
      if (r) {
        setRoot(r);
        return;
      }
      tries += 1;
      if (tries < 60) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [root]);

  // 2) слушаем смену владельца (когда смонтировалась следующая страница)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const onChanged = () => setOwnerTick((t) => t + 1);
    window.addEventListener("cta-owner-changed", onChanged);

    return () => window.removeEventListener("cta-owner-changed", onChanged);
  }, []);

  // чтобы линтер не ругался: используется как триггер перерендера
  void ownerTick;

  const isOwner = myToken === __ctaOwnerToken;

  // 3) флаг на html: включаем только у владельца
  useEffect(() => {
    if (!root) return;

    if (isOwner) {
      setCtaMountedFlag(true);
    }

    return () => {
      // при размонтировании: если мы всё ещё владелец — чистим и снимаем флаг
      if (!root) return;
      if (myToken !== __ctaOwnerToken) return;

      root.innerHTML = "";
      setCtaMountedFlag(false);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("cta-owner-changed"));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner, root]);

  if (!root) return null;
  if (!isOwner) return null;

  const handler = onPress ?? onClick;

  return createPortal(
    <div className="globalCta">
      <Pressable
        as="button"
        className={className}
        onPress={handler}
        delayMs={delayMs}
        disabled={disabled}
        aria-disabled={ariaDisabled ?? (disabled ? "true" : "false")}
      >
        {children}
      </Pressable>
    </div>,
    root
  );
}