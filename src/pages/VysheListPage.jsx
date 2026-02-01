import { useEffect, useRef, useState } from "react";

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

const SCROLL_KEY = "vysheListScrollTop_v1";

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

function findScrollParent(el) {
  let node = el;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const canScroll =
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight;

    if (canScroll) return node;
    node = node.parentElement;
  }
  return document.scrollingElement || document.documentElement;
}

// data
const lessons = [
  {
    teacherId: "rudich-vasilina",
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
        "Наша цель — воспитать в ребёнке уверенность в себе, любовь к учёбе и желание познавать новое",
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
    teacherId: "rudich-vasilina",
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
        "Занятия проходят в спокойной и поддерживающей атмосфере, без давления и стресса",
    },

    teacher: {
      name: "Рудич Василина Андреевна",
      role: "Преподаватель",
      bio: "Настоящая волшебница, которая умеет превращать обучение в увлекательный и понятный процесс. Дети выходят с занятий уверенными в себе, мотивированными и с искренним интересом к учёбе",
      education: "",
      approach: "",
    },

    schedule: {
      groups: [
        {
          label: "1 класс (в процессе набора)",
          sessions: [
            { day: "ЧТ", time: "16:00" },
            { day: "ВС", time: "10:00" },
          ],
        },
        {
          label: "2 класс и старше",
          sessions: [
            { day: "ЧТ", time: "16:00" },
            { day: "ВС", time: "10:00" },
          ],
        },
      ],
    },
  },

  {
    teacherId: "kasabutskaya-katarina",
    title: "Английский язык",
    subtitle: "Изучаем английский язык с раннего возраста — легко и с интересом",
    price: "1 000 ₽",
    icon: englishIcon,
    ageMin: 7,

    teacher: {
      name: "Касабуцкая Катарина Сергеевна",
      role: "Преподаватель",
      bio:
        "Создаёт на своих занятиях волшебную атмосферу, в которой дети легко и с интересом погружаются в изучение английского языка.\n\n" +
        "С ней ребята отправляются в увлекательное путешествие, где обучение проходит через игру, творчество и живое общение. Добро пожаловать на занятия!",
      education: "",
      approach: "",
    },

    schedule: {
      groups: [
        {
          label: "7–8 лет",
          sessions: [
            { day: "СР", time: "16:00" },
            { day: "ПТ", time: "16:00" },
          ],
        },
        {
          label: "9–10 лет",
          sessions: [
            { day: "СР", time: "18:00" },
            { day: "ПТ", time: "18:00" },
          ],
        },
        {
          label: "11–12 лет",
          sessions: [
            { day: "ВТ", time: "19:30" },
            { day: "ЧТ", time: "19:30" },
          ],
        },
      ],
    },
  },

  {
    teacherId: "kulkaev-samat",
    title: "Шахматы",
    subtitle: "Развиваем логику, внимание и стратегическое мышление.",
    price: "1 000 ₽",
    icon: chessIcon,
    ageMin: 5,
    teacher: {
      name: "Кулькаев Самат Вячеславович",
      role: "Преподаватель",
      bio:
        "Чемпион МО и призёр международных турниров.\n\n" +
        "Он умеет пробудить у детей интерес к шахматам, сделать каждое занятие занимательным и нескучным. Его ученики уже через полгода участвуют в турнирах разного уровня и занимают призовые места",
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
    teacherId: "rudich-artem",
    title: "Секретная лаборатория",
    subtitle: "Опыты и открытия: физика, химия и тайны окружающего мира",
    price: "1 000 ₽",
    icon: scienceLabIcon,
    ageMin: 7,

    about: {
      title: "Подробнее о занятии",
      text:
        "«Секретная лаборатория» — место, где детям открываются тайны мира.\n\n" +
        "На занятиях:\n" +
        "— знакомимся с основами естествознания\n" +
        "— разбираем физические законы на понятных примерах\n" +
        "— проводим химические опыты и учимся делать выводы\n\n" +
        "Ребёнок лучше понимает, как устроен мир и почему на нашей планете всё так разнообразно.",
    },

    teacher: {
      name: "Рудич Артём Васильевич",
      role: "Преподаватель",
      bio:
        "Студент Московского педагогического государственного университета.\n\n" +
        "Специальность — биология и иностранный язык (английский).\n\n" +
        "Увлечённый и эрудированный педагог, обладающий широкими энциклопедическими знаниями. Умеет заинтересовать любого собеседника и объяснять сложные вещи простым и понятным языком.",
      education: "",
      approach: "",
    },

    schedule: {
      sessions: [{ day: "ПТ", time: "17:00" }],
    },
  },

  {
    teacherId: "kasabutskaya-katarina",
    title: "Акварель",
    subtitle: "Учимся видеть прекрасное и передавать его в рисунке",
    price: "1 000 ₽",
    icon: watercolorIcon,
    ageMin: 7,

    about: {
      title: "О занятии",
      text:
        "Занятия по акварели направлены на развитие художественного вкуса и образного мышления\n\n" +
        "На уроках дети:\n" +
        "— Знакомятся с основами изобразительного искусства: композицией, пропорциями, цветом и формой\n" +
        "— Учятся передавать настроение и характер изображения\n" +
        "— Работают с разными материалами: акварелью, пастелью и карандашами\n\n" +
        "Занятия подходят как для начинающих, так и для ребят с опытом рисования",
    },

    teacher: {
      name: "Касабуцкая Катарина Сергеевна",
      role: "Преподаватель",
      bio:
        "Создаёт на занятиях тёплую и вдохновляющую атмосферу творчества.\n\n" +
        "С ней ребята отправляются в путешествие в мир красок и линий, развивают художественное мышление и интерес к обучению. В процессе занятий дети также мягко расширяют знания английского языка.",
      education: "",
      approach: "",
    },

    schedule: {
      sessions: [
        { day: "ВТ", time: "19:00" },
        { day: "ЧТ", time: "19:00" },
        { day: "СБ", time: "17:30" },
      ],
    },
  },

  {
    teacherId: "kasabutskaya-katarina",
    title: "Графика",
    subtitle: "Учимся уверенно строить форму и рисовать чётко",
    price: "1 000 ₽",
    icon: graphicsIcon,
    ageMin: 7,

    about: {
      title: "О занятии",
      text:
        "Занятия по графике направлены на формирование уверенной основы в рисовании\n\n" +
        "На уроках дети:\n" +
        "— Осваивают построение рисунка и работу с формой\n" +
        "— Учатся проводить чёткие, уверенные линии\n" +
        "— Развивают глазомер и пространственное мышление\n" +
        "— Рисуют быстрее и увереннее, без страха ошибки\n\n" +
        "Графика помогает заложить фундамент, который важен для любого направления в изобразительном искусстве",
    },

    teacher: {
      name: "Касабуцкая Катарина Сергеевна",
      role: "Преподаватель",
      bio:
        "Создаёт на занятиях тёплую и вдохновляющую атмосферу творчества.\n\n" +
        "С ней ребята отправляются в путешествие в мир линий и форм, развивают художественное мышление и уверенность в своих силах. В процессе занятий дети также мягко расширяют знания английского языка.",
      education: "",
      approach: "",
    },

    schedule: {
      sessions: [{ day: "ПН", time: "19:00" }],
    },
  },

  {
    teacherId: "nesterov-yuriy",
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
    teacherId: "dolzhenkova-darya",
    title: "Мультипликация",
    subtitle: "Создаём собственные мультфильмы — от идеи до озвучки",
    price: "1 000 ₽",
    icon: actorIcon,
    ageMin: 7,
  
    about: {
      title: "О занятии",
      text:
        "На занятиях дети учатся создавать настоящие мультфильмы разных форматов\n\n" +
        "В процессе работы:\n" +
        "— Снимаем пластилиновые, рисованные и кукольные мультфильмы\n" +
        "— Придумываем сюжет и персонажей\n" +
        "— Учимся фиксировать движение и «оживлять» героев\n" +
        "— Полностью проходим путь от идеи до озвучки\n\n" +
        "Занятия развивают воображение, чувство ритма, командную работу и умение доводить проект до результата",
    },
  
    teacher: {
      name: "Долженкова Дарья Сергеевна",
      role: "Преподаватель",
      bio:
        "Имеет высшее образование по специальности «журналистика» (МГУКИ) и обучение в художественной школе.\n\n" +
        "Полученные знания успешно применила в сфере дошкольного воспитания, пройдя профильную переподготовку.\n\n" +
        "Более семи лет работает воспитателем, развивая творческие способности детей: вела школу юного художника в школе №878, а в настоящее время руководит студией анимации в дошкольном корпусе школы №2083.",
      education: "",
      approach: "",
    },
  
    schedule: {
      sessions: [
        { day: "ПТ", time: "19:00" },
        { day: "ВС", time: "18:00" },
      ],
    },
  },

  {
    teacherId: "nesterov-yuriy",
    title: "Оч. Умелые ручки",
    subtitle: "Создаём красивые вещи своими руками и учимся работать с материалами",
    price: "1 000 ₽",
    icon: handsIcon,
    ageMin: 4,

    about: {
      title: "О занятии",
      text:
        "На занятиях дети создают красивые и полезные вещи из самых обычных материалов\n\n" +
        "В процессе работы мы:\n" +
        "— Осваиваем навыки работы с инструментами\n" +
        "— Учимся шить, клеить и конструировать\n" +
        "— Развиваем воображение, мелкую моторику и чувство вкуса\n\n" +
        "Занятия проходят в спокойной творческой атмосфере и помогают детям раскрывать себя через ручной труд и фантазию",
    },

    teacher: {
      name: "Нестеров Юрий Иванович",
      role: "Преподаватель",
      bio:
        "Прекрасный педагог, который находит подход к каждому ребёнку и создаёт на занятиях особую творческую атмосферу.\n\n" +
        "Через искусство и живой диалог он развивает таланты детей и приобщает их к вечным ценностям",
      education: "",
      approach: "",
    },

    schedule: {
      sessions: [
        { day: "ПН", time: "18:00" },
        { day: "ЧТ", time: "17:00" },
        { day: "СБ", time: "12:00" },
      ],
    },
  },

  {
    teacherId: "nesterov-yuriy",
    title: "Рисование для малышей",
    subtitle: "Свободное творчество без правил — для уверенности и радости",
    price: "1 000 ₽",
    icon: drawingIcon,
    ageRange: "3–6 лет",

    about: {
      title: "О занятии",
      text:
        "Рисование для малышей — это пространство свободы, эксперимента и радости\n\n" +
        "На занятиях мы учимся рисовать, нарушая все правила и законы, потому что главное — получать удовольствие от творчества и чувствовать уверенность в себе\n\n" +
        "Дети осваивают разные техники, материалы и способы рисования:\n" +
        "— Акварель, гуашь, пастель, акрил, эбру, мелки\n" +
        "— Кисти, карандаши, пальцы, ватные палочки, зубные щётки и всё, чем «нельзя рисовать»\n\n" +
        "Занятия помогают развивать воображение, моторику и смелость самовыражения",
    },

    teacher: {
      name: "Нестеров Юрий Иванович",
      role: "Преподаватель",
      bio:
        "Прекрасный педагог, который находит подход к каждому ребёнку и создаёт на занятиях особую творческую атмосферу.\n\n" +
        "Через искусство и живой диалог он развивает таланты детей и приобщает их к вечным ценностям",
      education: "",
      approach: "",
    },

    schedule: {
      sessions: [
        { day: "СБ", time: "11:00" },
        { day: "ВС", time: "12:00" },
      ],
    },
  },

  {
    teacherId: "priveden-polina",
    title: "Музыкально-игровые занятия",
    subtitle: "Музыка, ритм и движение — легко, весело и в игре",
    price: "1 000 ₽",
    icon: musicGamesIcon,
    ageRange: "3–6 лет",

    about: {
      title: "О занятии",
      text:
        "Музыкально-игровые занятия — это первое знакомство ребёнка с миром музыки через движение, игру и радость\n\n" +
        "На занятиях дети:\n" +
        "— Учатся слушать и слышать музыку\n" +
        "— Развивают чувство ритма и такта\n" +
        "— Знакомятся с музыкальными инструментами\n" +
        "— Поют, танцуют и свободно выражают себя через движение\n\n" +
        "Все занятия проходят легко и весело, в игровой форме, без давления — с акцентом на удовольствие и эмоциональное развитие",
    },

    teacher: {
      name: "Приведён Полина Ивановна",
      role: "Преподаватель",
      bio:
        "Педагог с многолетним опытом и невероятной чуткостью, которая находит подход к каждому малышу, начиная с годовалого возраста.\n\n" +
        "Её занятия — это увлекательное путешествие в страну музыки, где дети в лёгкой игровой форме знакомятся с ритмом и мелодией, развиваются и делают свои первые важные открытия",
      education: "",
      approach: "",
    },

    schedule: {
      sessions: [{ day: "ВС", time: "13:00" }],
    },
  },
];

export default function VysheListPage({ onOpenLesson }) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const rootRef = useRef(null);
  const scrollerRef = useRef(null);

  // ✅ restore scroll on mount
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scroller = findScrollParent(root);
    scrollerRef.current = scroller;

    const saved = sessionStorage.getItem(SCROLL_KEY);
    const top = saved ? Number(saved) : 0;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          scroller.scrollTo({ top, left: 0, behavior: "auto" });
        } catch (_) {
          scroller.scrollTop = top;
        }
      });
    });
  }, []);

  // ✅ save scroll on unmount
  useEffect(() => {
    return () => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      sessionStorage.setItem(SCROLL_KEY, String(scroller.scrollTop || 0));
    };
  }, []);

  const openLessonWithFeedback = async (lesson, ageText) => {
    // ✅ save before navigate
    const scroller = scrollerRef.current;
    if (scroller) sessionStorage.setItem(SCROLL_KEY, String(scroller.scrollTop || 0));

    await delay(140);
    onOpenLesson?.({ ...lesson, age: ageText });
  };

  return (
    <div ref={rootRef} className="page vyshePage stack20">
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