import { useState } from "react";
import teacherPlaceholder from "../assets/avatars/teacher-placeholder.png";
import BottomSheet from "../components/BottomSheet";

export default function LessonDetailsPage({ lesson, onBook }) {
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);

  // дефолты, чтобы не падало, даже если lesson пока “бедный”
  const data = {
    title: lesson?.title || "Занятие",
    subtitle:
      lesson?.subtitle ||
      "Занятия, направленные на развитие навыков и интересов.",
    age: lesson?.age || "от 6 лет",
    price: lesson?.price || "700 ₽",
    duration: lesson?.duration || "1 час",

    // teacher object (чтобы потом легко подставить контент)
    teacher: lesson?.teacher || {
      name: "Такой-то Такойтович",
      role: "Преподаватель",
      bio:
        "Педагог с опытом 7+ лет. Помогает раскрыть творческое мышление и уверенность через практику и поддержку.",
      education: "Профильное педагогическое образование",
      approach: "Мягко, понятно, с результатом",
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
      // sessions: [{ day:"ПН", time:"12:00" }, { day:"СР", time:"12:00" }],
    },
  };

  const hasGroups =
    Array.isArray(data.schedule?.groups) && data.schedule.groups.length > 0;

  const flatSessions = Array.isArray(data.schedule?.sessions)
    ? data.schedule.sessions
    : [];

  // нормализуем teacher (вдруг у тебя где-то строкой пришло)
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
      {/* Заголовок + подзаголовок */}
      <div className="lessonHead">
        <h1 className="lessonTitle">{data.title}</h1>
        <div className="lessonSubtitle">{data.subtitle}</div>
      </div>

      {/* Плашка “Возраст / Цена / Длительность” */}
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

      {/* Преподаватель (кликабельно) */}
      <button
        type="button"
        className="teacherCard"
        onClick={() => setIsTeacherOpen(true)}
        aria-label="Открыть информацию о преподавателе"
      >
        <img className="teacherAvatar" src={teacherObj.avatar || teacherPlaceholder} alt="" />

        <div className="teacherText">
          <div className="teacherLabel">{teacherObj.role || "Преподаватель"}</div>
          <div className="teacherName">{teacherObj.name}</div>
        </div>
      </button>

      {/* Расписание */}
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

      {/* Bottom Sheet: преподаватель */}
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

      {/* Кнопка снизу */}
      <div className="stickyCta">
        <button
          type="button"
          className="primaryCta"
          onClick={() => onBook?.(lesson)}
        >
          Записаться
        </button>
      </div>
    </div>
  );
}