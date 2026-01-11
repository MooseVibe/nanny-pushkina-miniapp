import { useEffect, useRef, useState } from "react";

/**
 * ScreenStack
 * - держит 2 экрана на время анимации: предыдущий + текущий
 * - direction: "forward" | "back"
 * - durationMs должен совпадать с CSS (--nav-ms)
 */
export default function ScreenStack({
  screenKey,
  direction = "forward",
  durationMs = 320,
  children,
}) {
  const [prev, setPrev] = useState(null); // { key, node }
  const [curr, setCurr] = useState({ key: screenKey, node: children });

  const lastKeyRef = useRef(screenKey);
  const timerRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    // первый рендер
    if (lastKeyRef.current === screenKey) {
      setCurr({ key: screenKey, node: children });
      return;
    }

    // фиксируем предыдущий экран
    setPrev({ key: curr.key, node: curr.node });

    // ставим новый текущий
    setCurr({ key: screenKey, node: children });

    lastKeyRef.current = screenKey;

    // через durationMs убираем prev
    clearTimer();
    timerRef.current = setTimeout(() => {
      setPrev(null);
    }, durationMs);

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  // если children поменялись, но screenKey тот же — просто обновим node
  useEffect(() => {
    if (lastKeyRef.current === screenKey) {
      setCurr({ key: screenKey, node: children });
    }
  }, [children, screenKey]);

  const dirClass = direction === "back" ? "isBack" : "isForward";
  const animClass = prev ? "isAnimating" : "";

  return (
    <div className={`screenStack ${dirClass} ${animClass}`}>
      {/* previous scene (анимируем её как уходящую) */}
      {prev ? (
        <div className="scene isPrev isExiting" key={`prev-${prev.key}`}>
          {prev.node}
        </div>
      ) : null}

      {/* current scene (всегда активная, всегда кликабельная) */}
      <div className="scene isNext isActive" key={`curr-${curr.key}`}>
        {curr.node}
      </div>
    </div>
  );
}