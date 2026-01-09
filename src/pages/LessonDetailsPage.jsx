import { useMemo, useState } from "react";
import teacherPlaceholder from "../assets/avatars/teacher-placeholder.png";
import BottomSheet from "../components/BottomSheet";

function calcAgeFallback(lesson) {
  if (lesson?.age) return lesson.age;
  if (typeof lesson?.ageMin === "number") return `от ${lesson.ageMin} лет`;
  if (lesson?.ageRange) return String(lesson.ageRange).replace(/-/g, "–");
  return "от 6 лет";
}

export default function LessonDetailsPage({ lesson, onBook }) {
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);

  const data = useMemo(() => {
    return {
      title: lesson?.title || "Занятие",
      subtitle:
        lesson?.subtitle || "Занятия, направленные на развитие навыков и интересов.",
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
    <div className="page lessonDetailsPage">
      <div className="lessonHead">
        <h1 className="lessonTitle">{data.title}</h1>
        <div className="lessonSubtitle">{data.subtitle}</div>
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

      {/* ✅ Пресс-эффект на карточке преподавателя */}
      <button
        type="button"
        className="teacherCard pressable"
        onClick={() => setIsTeacherOpen(true)}
        aria-label="Открыть информацию о преподавателе"
      >
        <img
          className="teacherAvatar"
          src={teacherObj.avatar || teacherPlaceholder}
          alt=""
        />

        <div className="teacherText">
          <div className="teacherLabel">{teacherObj.role || "Преподаватель"}</div>
          <div className="teacherName">{teacherObj.name}</div>
        </div>
      </button>

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
                      <div className="chipDay">{s.day}</div>
                      <div className="chipTime">{s.time}</div>
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
                <div className="chipDay">{s.day}</div>
                <div className="chipTime">{s.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>

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

      <div className="stickyCta">
        {/* ✅ Тоже добавил pressable, потому что это кнопка (если не хочешь — убери слово pressable) */}
        <button
          type="button"
          className="primaryCta pressable"
          onClick={() => onBook?.(lesson)}
        >
          Записаться
        </button>
      </div>
    </div>
  );
}