import { useState } from "react";

import LessonCard from "../components/LessonCard";
import BottomSheet from "../components/BottomSheet";
import HintButton from "../components/HintButton";

// ✅ ИКОНКИ ЗАНЯТИЙ
import schoolPrepIcon from "../assets/icons/school-prep.svg";
import speedReadingIcon from "../assets/icons/speed-reading.svg";
import calligraphyIcon from "../assets/icons/calligraphy.svg";
import englishIcon from "../assets/icons/english.svg";
import chessIcon from "../assets/icons/chess.svg";
import scienceLabIcon from "../assets/icons/science-lab.svg";
import watercolorIcon from "../assets/icons/watercolor.svg";
import graphicsIcon from "../assets/icons/graphics.svg";
import sculptureIcon from "../assets/icons/sculpture.svg";
import actorIcon from "../assets/icons/actor.svg";
import handsIcon from "../assets/icons/hands.svg";
import drawingIcon from "../assets/icons/drawing.svg";
import musicGamesIcon from "../assets/icons/music-games.svg";

// helpers
function normalizeDashes(s) {
  return String(s || "").replace(/-/g, "–");
}

function getMinAgeFromLesson(lesson) {
  if (typeof lesson?.ageMin === "number") return lesson.ageMin;

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

  return 6;
}

function ageTextFromLesson(lesson) {
  if (lesson?.ageRange) return normalizeDashes(lesson.ageRange);
  const min = getMinAgeFromLesson(lesson);
  return `от ${min} лет`;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// data
const lessons = [
  {
    title: "Подготовка к школе",
    subtitle: "Первый шаг к знаниям — с улыбкой и уверенностью!",
    about: {
      title: "Подробнее о занятии",
      text:
        "Наша уникальная программа обеспечивает комфортный и эффективный переход к школьной жизни\n\n" +
        "Комплексное развитие:\n" +
        "— Чтение: от знакомства с буквами до уверенного чтения (40+ слов/мин)\n" +
        "— Письмо: освоение базовых навыков и развитие мелкой моторики\n" +
        "— Математика: основы счёта, логические задачи\n" +
        "— Развитие речи и логического мышления, обогащение словарного запаса, умение анализировать\n" +
        "— Окружающий мир: формирование базовых представлений\n\n" +
        "Наша цель — воспитать в ребёнке уверенность в себе, любовь к учёбе и желание познавать новое"
    },
    price: "1 000 ₽",
    icon: schoolPrepIcon,
    ageMin: 5,
    teacher: {
      name: "Рудич Василина Андреевна",
      role: "Преподаватель",
      bio: "Настоящая волшебница, которая умеет превращать подготовку к школе в увлекательное приключение. После её занятий дети выходят с сияющими улыбками, горящими глазами и полны вдохновения для выполнения домашних заданий",
      education: "",
      approach: "",
    },
    schedule: {
      groups: [
        {
          label: "1 год до школы",
          sessions: [
            { day: "ЧТ", time: "19:00" },
            { day: "ВС", time: "12:00" },
          ],
        },
        {
          label: "2 года до школы",
          sessions: [
            { day: "ЧТ", time: "18:00" },
            { day: "ВС", time: "11:00" },
          ],
        },
        {
          label: "1 год до школы выходного дня",
          sessions: [{ day: "ВС", time: "12:00 - 14:00" }],
        },
      ],
    },
  },

  {
    title: "Чистописание, скорочтение и развитие памяти",
    subtitle: "Развиваем память, ускоряем чтение и формируем красивый почерк",
    price: "1 000 ₽",
    icon: speedReadingIcon,
    ageMin: 6,
  
    about: {
      title: "О курсе",
      text:
        "Курс направлен на комплексное развитие ключевых учебных навыков\n\n" +
        "На занятиях мы:\n" +
        "— Развиваем память: улучшаем способность запоминать и воспроизводить информацию, увеличиваем объём кратковременной и долговременной памяти\n" +
        "— Ускоряем чтение и восприятие информации: повышаем концентрацию и понимание прочитанного\n" +
        "— Совершенствуем почерк: учимся писать красиво и разборчиво, развиваем мелкую моторику и координацию движений\n" +
        "— Формируем усидчивость и навык доведения задачи до конца\n\n" +
        "Занятия проходят в спокойной и поддерживающей атмосфере, без давления и стресса"
    },
  
    teacher: {
      name: "Рудич Василина Андреевна",
      role: "Преподаватель",
      bio: "Настоящая волшебница, которая умеет превращать обучение в увлекательный и понятный процесс. Дети выходят с занятий уверенными в себе, мотивированными и с искренним интересом к учёбе",
      education: "",
      approach: "",
      // avatar не указываем — подхватится плейсхолдер
    },
  
    schedule: {
      groups: [
        {
          label: "1 класс (в процессе набора)",
          sessions: [
            { day: "ЧТ", time: "16:00" },
            { day: "ВС", time: "10:00" }
          ]
        },
        {
          label: "2 класс и старше",
          sessions: [
            { day: "ЧТ", time: "16:00" },
            { day: "ВС", time: "10:00" }
          ]
        }
      ]
    }
  },

  {
    title: "Каллиграфия",
    price: "1 000 ₽",
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
    price: "1 000 ₽",
    icon: englishIcon,
    ageMin: 3,
    schedule: {
      groups: [
        { label: "Для малышей", sessions: [{ day: "ВС", time: "10:00" }] },
        {
          label: "1–2 класс",
          sessions: [
            { day: "СР", time: "16:00" },
            { day: "ПТ", time: "16:00" },
          ],
        },
        {
          label: "3 класс",
          sessions: [
            { day: "ЧТ", time: "16:00" },
            { day: "СБ", time: "17:00" },
          ],
        },
        {
          label: "4 класс",
          sessions: [
            { day: "ВТ", time: "17:00" },
            { day: "ЧТ", time: "17:00" },
          ],
        },
        {
          label: "5 класс",
          sessions: [
            { day: "ВТ", time: "18:00" },
            { day: "ЧТ", time: "18:00" },
          ],
        },
      ],
    },
  },

  {
    title: "Шахматы",
    subtitle: "Развиваем логику, внимание и стратегическое мышление.",
    price: "1 000 ₽",
    icon: chessIcon,
    ageMin: 5,
    teacher: {
      name: "Кулькаев Самат Вячеславович",
      role: "Преподаватель",
      bio:
        "Чемпион МО и призёр международных турниров\n\n" +
        "Он умеет пробудить у детей интерес к шахматам, сделать каждое занятие занимательным и нескучным. Его ученики уже через полгода участвуют в турнирах разного уровня и занимают призовые места" 
        ,
      education: "",
      approach: "",
    },
    schedule: {
      sessions: [
        { day: "ПН", time: "18:00" },
        { day: "СР", time: "18:00" },
      ],
    },
  },

  {
    title: "Секретная лаборатория",
    price: "1 000 ₽",
    icon: scienceLabIcon,
    ageMin: 7,
    schedule: { sessions: [{ day: "ПТ", time: "17:00" }] },
  },

  {
    title: "Акварель",
    price: "1 000 ₽",
    icon: watercolorIcon,
    ageMin: 6,
    schedule: {
      sessions: [
        { day: "ВТ", time: "19:00" },
        { day: "ЧТ", time: "19:00" },
        { day: "СБ", time: "18:00" },
      ],
    },
  },

  {
    title: "Графика",
    price: "1 000 ₽",
    icon: graphicsIcon,
    ageMin: 8,
    schedule: { sessions: [{ day: "ПН", time: "19:00" }] },
  },

  {
    title: "Скульптура и лепка",
    subtitle: "Учимся познавать мир и создавать красоту в объёме",
    about: {
      title: "Подробнее о занятии",
      text:
        "На занятиях работаем с разными материалами: глина, полимерная глина (полимерка), гипс, папье-маше\n\n" +
        "Развиваем мелкую моторику, воображение и пространственное мышление — через практику, формы и объём",
    },
    price: "1 000 ₽",
    icon: sculptureIcon,
    ageMin: 3,
    teacher: {
      name: "Нестеров Юрий Иванович",
      role: "Преподаватель",
      bio:
        "Педагог, который находит подход к каждому ребёнку и создаёт на занятиях особую творческую атмосферу.\n\n" +
        "Через искусство и живой диалог он не только развивает таланты детей, но и приобщает к вечным ценностям.",
      education: "",
      approach: "",
    },
    schedule: {
      groups: [
        {
          label: "Лепка для малышей (3–6 лет)",
          sessions: [
            { day: "СБ", time: "11:00" },
            { day: "ВС", time: "12:00" },
          ],
        },
        {
          label: "Скульптура (7–8 лет)",
          sessions: [{ day: "ЧТ", time: "18:00" }],
        },
        {
          label: "Скульптура (9–10 лет)",
          sessions: [
            { day: "СР", time: "18:00" },
            { day: "ПТ", time: "18:00" },
          ],
        },
        {
          label: "Скульптура (11+ лет)",
          sessions: [
            { day: "СР", time: "19:00" },
            { day: "ПТ", time: "19:00" },
          ],
        },
      ],
    },
  },

  {
    title: "Мультипликация",
    price: "1 000 ₽",
    icon: actorIcon,
    ageMin: 7,
    schedule: {
      sessions: [
        { day: "ПТ", time: "19:00" },
        { day: "ВС", time: "18:00" },
      ],
    },
  },

  {
    title: "Очумелые ручки",
    price: "1 000 ₽",
    icon: handsIcon,
    ageMin: 6,
    schedule: {
      sessions: [
        { day: "ПН", time: "18:00" },
        { day: "СБ", time: "12:00" },
      ],
    },
  },

  {
    title: "Рисование",
    price: "1 000 ₽",
    icon: drawingIcon,
    ageRange: "3–6 лет",
    schedule: {
      sessions: [
        { day: "СБ", time: "11:00" },
        { day: "ВС", time: "12:00" },
      ],
    },
  },

  {
    title: "Музыкально-игровые программы",
    price: "1 000 ₽",
    icon: musicGamesIcon,
    ageRange: "3–6 лет",
    schedule: { sessions: [{ day: "ВС", time: "13:00" }] },
  },
];

export default function VysheListPage({ onOpenLesson }) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const openLessonWithFeedback = async (lesson, ageText) => {
    await delay(140);
    onOpenLesson?.({ ...lesson, age: ageText });
  };

  return (
    <div className="page vyshePage stack20">
      <div className="pageHeaderRow">
        <div className="pageHeaderTitle">
          <h1 className="pageTitle">Выше</h1>
          <div className="pageSubtitle">Занятия для детей и взрослых</div>
        </div>

        <HintButton
          ariaLabel="Что такое «Выше»"
          onPress={() => setIsAboutOpen(true)}
        />
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
              onClick={() => openLessonWithFeedback(l, ageText)}
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