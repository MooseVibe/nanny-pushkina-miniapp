import { useState } from "react";

import hintIcon from "../assets/icons/hint.svg";

import LessonCard from "../components/LessonCard";
import BottomSheet from "../components/BottomSheet";

// ✅ ИКОНКИ ЗАНЯТИЙ (твои реальные файлы)
import schoolPrepIcon from "../assets/icons/school-prep.svg";
import speedReadingIcon from "../assets/icons/speed-reading.svg";
import calligraphyIcon from "../assets/icons/calligraphy.svg";
import englishIcon from "../assets/icons/english.svg";
import chessIcon from "../assets/icons/chess.svg";
import scienceLabIcon from "../assets/icons/science-lab.svg";
import watercolorIcon from "../assets/icons/watercolor.svg";
import graphicsIcon from "../assets/icons/graphics.svg";
import sculptureIcon from "../assets/icons/sculpture.svg";
import actorIcon from "../assets/icons/actor.svg"; // мультипликация
import handsIcon from "../assets/icons/hands.svg"; // очумелые ручки
import clayIcon from "../assets/icons/clay.svg"; // лепка
import drawingIcon from "../assets/icons/drawing.svg"; // рисование
import musicGamesIcon from "../assets/icons/music-games.svg"; // муз-игровые

// --------------------
// helpers
// --------------------
function normalizeDashes(s) {
  return String(s || "").replace(/-/g, "–");
}

function getMinAgeFromLesson(lesson) {
  // 1) ageMin
  if (typeof lesson?.ageMin === "number") return lesson.ageMin;

  // 2) try parse groups labels: "5–6 лет", "3-6 лет", "7 лет"
  const groups = lesson?.schedule?.groups;
  if (Array.isArray(groups) && groups.length) {
    const nums = groups
      .map((g) => String(g?.label || "").match(/\d+/g))
      .flat()
      .filter(Boolean)
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n));
    if (nums.length) return Math.min(...nums);
  }

  // 3) fallback
  return 6;
}

function ageTextFromLesson(lesson) {
  // Если задан диапазон (например "3–6 лет") — показываем диапазон
  if (lesson?.ageRange) return normalizeDashes(lesson.ageRange);

  // Иначе "от X лет"
  const min = getMinAgeFromLesson(lesson);
  return `от ${min} лет`;
}

// --------------------
// data (пока черновик)
// --------------------
const lessons = [
  {
    title: "Подготовка к школе",
    price: "700 ₽",
    icon: schoolPrepIcon,
    ageMin: 5,
    schedule: {
      groups: [
        {
          label: "5–6 лет (2 года до школы)",
          sessions: [
            { day: "ВТ", time: "16:00" },
            { day: "ЧТ", time: "16:00" },
          ],
        },
        {
          label: "6–7 лет (1 год до школы)",
          sessions: [
            { day: "ПН", time: "17:00" },
            { day: "СР", time: "17:00" },
          ],
        },
      ],
    },
  },

  {
    title: "Скорочтение",
    price: "700 ₽",
    icon: speedReadingIcon,
    ageMin: 8,
    schedule: {
      sessions: [
        { day: "ПН", time: "18:00" },
        { day: "СР", time: "18:00" },
      ],
    },
  },

  {
    title: "Каллиграфия",
    price: "700 ₽",
    icon: calligraphyIcon,
    ageMin: 7,
    schedule: {
      sessions: [
        { day: "ВТ", time: "18:30" },
        { day: "ЧТ", time: "18:30" },
      ],
    },
  },

  {
    title: "Английский язык",
    price: "700 ₽",
    icon: englishIcon,
    ageMin: 3,
    schedule: {
      groups: [
        {
          label: "3–6 лет (выходной день)",
          sessions: [{ day: "СБ", time: "10:00" }],
        },
        {
          label: "7 лет",
          sessions: [
            { day: "ПН", time: "15:00" },
            { day: "СР", time: "15:00" },
          ],
        },
        {
          label: "8–10 лет",
          sessions: [
            { day: "ВТ", time: "17:30" },
            { day: "ЧТ", time: "17:30" },
          ],
        },
      ],
    },
  },

  {
    title: "Шахматы",
    price: "700 ₽",
    icon: chessIcon,
    ageMin: 7,
    schedule: {
      sessions: [
        { day: "СБ", time: "12:00" },
        { day: "СБ", time: "13:00" },
      ],
    },
  },

  {
    title: "Секретная лаборатория",
    price: "700 ₽",
    icon: scienceLabIcon,
    ageMin: 7,
    schedule: { sessions: [{ day: "ПТ", time: "17:00" }] },
  },

  {
    title: "Акварель",
    price: "700 ₽",
    icon: watercolorIcon,
    ageMin: 6,
    schedule: { sessions: [{ day: "СР", time: "16:00" }] },
  },

  {
    title: "Графика",
    price: "700 ₽",
    icon: graphicsIcon,
    ageMin: 8,
    schedule: { sessions: [{ day: "ПН", time: "16:30" }] },
  },

  {
    title: "Скульптура",
    price: "700 ₽",
    icon: sculptureIcon,
    ageMin: 8,
    schedule: { sessions: [{ day: "ЧТ", time: "16:30" }] },
  },

  {
    title: "Мультипликация",
    price: "700 ₽",
    icon: actorIcon,
    ageMin: 7,
    schedule: { sessions: [{ day: "ВТ", time: "19:00" }] },
  },

  {
    title: "Очумелые ручки",
    price: "700 ₽",
    icon: handsIcon,
    ageMin: 6,
    schedule: {
      sessions: [
        { day: "СР", time: "17:30" },
        { day: "ПТ", time: "17:30" },
      ],
    },
  },

  {
    title: "Лепка (выходной день)",
    price: "700 ₽",
    icon: clayIcon,
    ageRange: "3–6 лет",
    schedule: { sessions: [{ day: "СБ", time: "11:00" }] },
  },

  {
    title: "Рисование (выходной день)",
    price: "700 ₽",
    icon: drawingIcon,
    ageRange: "3–6 лет",
    schedule: { sessions: [{ day: "ВС", time: "10:00" }] },
  },

  {
    title: "Музыкально-игровые программы (выходной день)",
    price: "700 ₽",
    icon: musicGamesIcon,
    ageRange: "3–6 лет",
    schedule: { sessions: [{ day: "ВС", time: "11:00" }] },
  },
];

export default function VysheListPage({ onOpenLesson }) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="page vyshePage">
      <div className="pageHeaderRow">
        <div>
          <h1 className="pageTitle">Выше</h1>
          <div className="pageSubtitle">Занятия для детей и взрослых</div>
        </div>

        <button
          className="hintBtn"
          type="button"
          onClick={() => setIsAboutOpen(true)}
          aria-label="Что такое «Выше»"
        >
          <img className="hintIcon" src={hintIcon} alt="" />
        </button>
      </div>

      <div className="vysheList">
        {lessons.map((l) => {
          const ageText = ageTextFromLesson(l);

          return (
            <LessonCard
              key={l.title}
              iconSrc={l.icon}
              title={l.title}
              price={l.price}
              age={ageText}
              onClick={() =>
                onOpenLesson({
                  ...l,
                  age: ageText, // ✅ чтобы в деталке возраст совпадал с бейджем
                })
              }
            />
          );
        })}
      </div>

      <BottomSheet
        open={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title="Что такое «Выше»?"
      >
        <div>
          «Выше» — это комплексная программа интеллектуального, творческого и
          социального развития детей
          <br />
          <br />
          Наша цель — сформировать у ребёнка интерес к обучению, помочь раскрыть
          его способности и научить получать удовольствие от процесса познания
          <br />
          <br />
          Наш подход строится на доверии и комфорте: без стресса, без формализма,
          с уважением к темпу и интересам каждого ребёнка
        </div>
      </BottomSheet>
    </div>
  );
}