import { useEffect, useMemo, useRef, useState } from "react";

export default function LessonCard({ iconSrc, title, price, age, onClick }) {
  const titleRef = useRef(null);
  const [needsFade, setNeedsFade] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;

    const check = () => {
      // scrollWidth > clientWidth => текст реально не влезает
      setNeedsFade(el.scrollWidth > el.clientWidth + 1);
    };

    check();

    // на случай, если шрифты/окно загрузились позже
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [title]);

  const titleClass = useMemo(() => {
    return `lessonCard__title${needsFade ? " lessonCard__title--fade" : ""}`;
  }, [needsFade]);

  return (
    <button className="lessonCard" type="button" onClick={onClick}>
      <div className="lessonCard__iconBox">
        <img className="lessonCard__icon" src={iconSrc} alt="" />
      </div>

      <div className="lessonCard__mid">
        <div ref={titleRef} className={titleClass}>
          {title}
        </div>
        <div className="lessonCard__price">{price}</div>
      </div>

      <div className="lessonCard__badge">{age}</div>
    </button>
  );
}