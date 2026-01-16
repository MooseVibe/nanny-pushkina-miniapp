import { useEffect, useMemo, useRef, useState } from "react";
import teacherPlaceholder from "../assets/avatars/teacher-placeholder.png";
import BottomSheet from "../components/BottomSheet";
import HintButton from "../components/HintButton";
import Pressable from "../components/Pressable";
import PrimaryButton from "../components/PrimaryButton";

function calcAgeFallback(lesson) {
  if (lesson?.age) return lesson.age;
  if (typeof lesson?.ageMin === "number") return `от ${lesson.ageMin} лет`;
  if (lesson?.ageRange) return String(lesson.ageRange).replace(/-/g, "–");
  return "от 6 лет";
}

function normalizeAbout(about) {
  if (!about) return null;

  if (typeof about === "string") {
    const trimmed = about.trim();
    return trimmed ? { title: "О занятии", text: trimmed } : null;
  }

  const title =
    typeof about?.title === "string" ? about.title.trim() : "О занятии";
  const text = typeof about?.text === "string" ? about.text.trim() : "";
  if (!text) return null;

  return { title, text };
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

export default function LessonDetailsPage({ lesson, onBook }) {
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const rootRef = useRef(null);

  // ✅ Всегда открываем/показываем страницу с верха
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const scroller = findScrollParent(root);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        try {
          scroller.scrollTo({ top: 0, left: 0, behavior: "auto" });
        } catch (_) {
          scroller.scrollTop = 0;
        }
      });
    });
  }, [lesson?.title]);

  const data = useMemo(() => {
    return {
      title: lesson?.title || "Занятие",
      subtitle:
        lesson?.subtitle ||
        "Занятия, направленные на развитие навыков и интересов.",
      about: normalizeAbout(lesson?.about),

      age: calcAgeFallback(lesson),
      price: lesson?.price || "700 ₽",
      duration: lesson?.duration || "1 час",

      teacher: lesson?.teacher || {
        name: "Такой-то Такойтович",
        role: "Преподаватель",
        bio:
          "Скоро здесь появится подробная информация о преподавателе: опыт, подход и достижения.",
        education: "",
        approach: "",
        avatar: teacherPlaceholder,
      },

      schedule: lesson?.schedule || {
        groups: [
          {
            label: "6–7 лет",
            sessions: [
              { day: "ПН", time: "12:00" },
              { day: "СР", time: "12:00" },
            ],
          },
          {
            label: "8–9 лет",
            sessions: [
              { day: "ПН", time: "13:00" },
              { day: "СР", time: "13:00" },
            ],
          },
        ],
      },
    };
  }, [lesson]);

  const hasGroups =
    Array.isArray(data.schedule?.groups) && data.schedule.groups.length > 0;

  const flatSessions = Array.isArray(data.schedule?.sessions)
    ? data.schedule.sessions
    : [];

  const teacherObj =
    typeof data.teacher === "string"
      ? {
          name: data.teacher,
          role: "Преподаватель",
          bio:
            "Скоро здесь появится подробная информация о преподавателе: опыт, подход и достижения.",
          education: "",
          approach: "",
          avatar: teacherPlaceholder,
        }
      : data.teacher;

  return (
    <div ref={rootRef} className="page lessonDetailsPage stack20">
      <div className="pageMain stack20">
        {/* Хедер как на "Выше": слева тексты, справа hint */}
        <div className="pageHeaderRow">
          <div className="pageHeaderTitle">
            <h1 className="pageTitle">{data.title}</h1>
            <div className="pageSubtitle">{data.subtitle}</div>
          </div>

          {data.about ? (
            <HintButton
              ariaLabel={`Подробнее о занятии «${data.title}»`}
              onPress={() => setIsAboutOpen(true)}
            />
          ) : null}
        </div>

        <div className="lessonMeta">
          <div className="lessonMetaItem">
            <div className="lessonMetaLabel">Возраст</div>
            <div className="lessonMetaValue">{data.age}</div>
          </div>

          <div className="lessonMetaItem">
            <div className="lessonMetaLabel">Цена</div>
            <div className="lessonMetaValue">{data.price}</div>
          </div>

          <div className="lessonMetaItem">
            <div className="lessonMetaLabel">Длительность</div>
            <div className="lessonMetaValue">{data.duration}</div>
          </div>
        </div>

        <Pressable
          as="button"
          className="teacherCard"
          aria-label="Открыть информацию о преподавателе"
          onPress={() => setIsTeacherOpen(true)}
          delayMs={140}
        >
          <img
            className="teacherAvatar"
            src={teacherObj.avatar || teacherPlaceholder}
            alt=""
          />
          <div className="teacherText">
            <div className="teacherLabel">
              {teacherObj.role || "Преподаватель"}
            </div>
            <div className="teacherName">{teacherObj.name}</div>
          </div>
        </Pressable>

        <div className="scheduleBlock">
          <div className="sectionTitleLarge">Когда проходят занятия</div>

          {hasGroups ? (
            <div className="scheduleGroups">
              {data.schedule.groups.map((g) => (
                <div className="scheduleGroup" key={g.label}>
                  <div className="scheduleGroupLabel">{g.label}</div>
                  <div className="scheduleGrid">
                    {g.sessions.map((s, idx) => (
                      <div className="scheduleChip" key={`${g.label}-${idx}`}>
                        <div className="scheduleDay">{s.day}</div>
                        <div className="scheduleTime">{s.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="scheduleGrid">
              {flatSessions.map((s, idx) => (
                <div className="scheduleChip" key={`flat-${idx}`}>
                  <div className="scheduleDay">{s.day}</div>
                  <div className="scheduleTime">{s.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Шторка преподавателя */}
        <BottomSheet
          open={isTeacherOpen}
          onClose={() => setIsTeacherOpen(false)}
          title={teacherObj.name || "Преподаватель"}
        >
          <div>
            {teacherObj.bio ? <div>{teacherObj.bio}</div> : null}

            {teacherObj.education ? (
              <div style={{ marginTop: 12 }}>
                <b>Образование:</b> {teacherObj.education}
              </div>
            ) : null}

            {teacherObj.approach ? (
              <div style={{ marginTop: 6 }}>
                <b>Подход:</b> {teacherObj.approach}
              </div>
            ) : null}
          </div>
        </BottomSheet>

        {/* Шторка "О занятии" */}
        <BottomSheet
          open={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
          title={data.about?.title || "О занятии"}
        >
          <div style={{ whiteSpace: "pre-line" }}>{data.about?.text || ""}</div>
        </BottomSheet>
      </div>

      <div className="pageCta">
        <PrimaryButton onPress={() => onBook?.(lesson)}>Записаться</PrimaryButton>
      </div>
    </div>
  );
}