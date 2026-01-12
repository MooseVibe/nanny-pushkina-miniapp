import { useEffect, useRef, useState } from "react";

/**
 * ScreenStack
 * - В статике: current screen в потоке (нет “дыры”)
 * - Во время анимации: обе сцены absolute (есть свайп)
 */
export default function ScreenStack({
  screenKey,
  direction = "forward",
  durationMs = 340,
  children,
}) {
  const [prev, setPrev] = useState(null); // { key, node }
  const [curr, setCurr] = useState({ key: screenKey, node: children });

  const lastKeyRef = useRef(screenKey);
  const timerRef = useRef(null);

  useEffect(() => {
    if (lastKeyRef.current === screenKey) {
      setCurr({ key: screenKey, node: children });
      return;
    }

    // фиксируем предыдущий
    setPrev({ key: curr.key, node: curr.node });
    // ставим новый текущий
    setCurr({ key: screenKey, node: children });
    lastKeyRef.current = screenKey;

    // после анимации убираем prev
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPrev(null);
    }, durationMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  // обновление node без смены ключа
  useEffect(() => {
    if (lastKeyRef.current === screenKey) {
      setCurr({ key: screenKey, node: children });
    }
  }, [children, screenKey]);

  const dirClass = direction === "back" ? "isBack" : "isForward";
  const isAnimating = !!prev;

  return (
    <div className={`screenStack ${dirClass} ${isAnimating ? "isAnimating" : ""}`}>
      {prev ? (
        <div className="scene isPrev isExiting" key={`prev-${prev.key}`}>
          {prev.node}
        </div>
      ) : null}

      <div className="scene isNext isActive" key={`curr-${curr.key}`}>
        {curr.node}
      </div>
    </div>
  );
}