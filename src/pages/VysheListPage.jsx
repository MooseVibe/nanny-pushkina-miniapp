import { useState } from "react";

import hintIcon from "../assets/icons/hint.svg";
import iconAny from "../assets/illustrations/vyshe.svg"; // временно

import LessonCard from "../components/LessonCard";
import BottomSheet from "../components/BottomSheet";

// --------------------
// helpers
// --------------------
function formatAgeFromGroupLabel(label) {
  // "3–6 лет" -> "3–6 лет", "6-7 лет" -> "6–7 лет"
  if (!label) return "";
  return label.replace("-", "–");
}

function getMinAgeFromLesson(lesson) {
  // 1) Если явно задано ageMin — используем
  if (typeof lesson.ageMin === "number") return lesson.ageMin;

  // 2) Если есть группы — берём минимальную цифру из label
  const groups = lesson?.schedule?.groups;
  if (Array.isArray(groups) && groups.length) {
    const nums = groups
      .map((g) => String(g.label || "").match(/\d+/g))
      .flat()
      .filter(Boolean)
      .map((n) => Number(n))
      .filter((n) => Number.isFinite(n));
    if (nums.length) return Math.min(...nums);
  }

  // 3) Фоллбек
  return 6;
}

function ageBadgeText(lesson) {
  // Если явно задан диапазон (например "3–6 лет") — показываем его
  if (lesson.ageRange) return formatAgeFromGroupLabel(lesson.ageRange);

  // Иначе показываем "от X лет"
  const min = getMinAgeFromLesson(lesson);
  return `от ${min} лет`;
}

// --------------------
// data (ПРОВЕРЬ/ПРАВЬ ПО МЕРЕ ПРИХОДА ДАННЫХ ОТ ЮРИЯ)
// --------------------
const lessons = [
  {
    title: "Подготовка к школе",
    price: "700 ₽",
    icon: iconAny,
    // Минимальный возраст для бейджа на списке:
    ageMin: 5, // условно (2 года до школы)
    // Группы внутри деталки:
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
    icon: iconAny,
    ageMin: 8,
    // без групп — просто расписание
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
    icon: iconAny,
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
    icon: iconAny,
    ageMin: 3, // минимальный возраст теперь 3
    schedule: {
      groups: [
        {
          label: "3–6 лет (выходной день)",
          sessions: [
            { day: "СБ", time: "10:00" },
          ],
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
    icon: iconAny,
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
    icon: iconAny,
    ageMin: 7,
    schedule: {
      sessions: [
        { day: "ПТ", time: "17:00" },
      ],
    },
  },

  {
    title: "Акварель",
    price: "700 ₽",
    icon: iconAny,
    ageMin: 6,
    schedule: {
      sessions: [
        { day: "СР", time: "16:00" },
      ],
    },
  },

  {
    title: "Графика",
    price: "700 ₽",
    icon: iconAny,
    ageMin: 8,
    schedule: {
      sessions: [
        { day: "ПН", time: "16:30" },
      ],
    },
  },

  {
    title: "Скульптура",
    price: "700 ₽",
    icon: iconAny,
    ageMin: 8,
    schedule: {
      sessions: [
        { day: "ЧТ", time: "16:30" },
      ],
    },
  },

  {
    title: "Мультипликация",
    price: "700 ₽",
    icon: iconAny,
    ageMin: 7,
    schedule: {
      sessions: [
        { day: "ВТ", time: "19:00" },
      ],
    },
  },

  {
    title: "Очумелые ручки",
    price: "700 ₽",
    icon: iconAny,
    ageMin: 6,
    schedule: {
      sessions: [
        { day: "СР", time: "17:30" },
        { day: "ПТ", time: "17:30" },
      ],
    },
  },

  // Группа выходного дня 3–6
  {
    title: "Лепка (выходной день)",
    price: "700 ₽",
    icon: iconAny,
    ageRange: "3–6 лет",
    schedule: {
      sessions: [
        { day: "СБ", time: "11:00" },
      ],
    },
  },
  {
    title: "Рисование (выходной день)",
    price: "700 ₽",
    icon: iconAny,
    ageRange: "3–6 лет",
    schedule: {
      sessions: [
        { day: "ВС", time: "10:00" },
      ],
    },
  },
  {
    title: "Музыкально-игровые программы (выходной день)",
    price: "700 ₽",
    icon: iconAny,
    ageRange: "3–6 лет",
    schedule: {
      sessions: [
        { day: "ВС", time: "11:00" },
      ],
    },
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
        {lessons.map((l) => (
          <LessonCard
            key={l.title}
            iconSrc={l.icon || iconAny}
            title={l.title}
            price={l.price}
            age={ageBadgeText(l)}     // <-- ВОТ ЗДЕСЬ МИНИМАЛЬНЫЙ ВОЗРАСТ/ДИАПАЗОН
            onClick={() => onOpenLesson(l)} // <-- передаём ВЕСЬ lesson со schedule
          />
        ))}
      </div>

      <BottomSheet
        open={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title="Что такое «Выше»?"
      >
        <div>
          «Выше» — это комплексная программа интеллектуального, творческого и социального развития детей
          <br /><br />
          Наша цель — сформировать у ребёнка интерес к обучению, помочь раскрыть его способности и научить получать удовольствие от процесса познания
          <br /><br />
          Наш подход строится на доверии и комфорте: без стресса, без формализма, с уважением к темпу и интересам каждого ребёнка
        </div>
      </BottomSheet>
    </div>
  );
}