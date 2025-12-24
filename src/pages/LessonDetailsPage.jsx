import teacherPlaceholder from "../assets/avatars/teacher-placeholder.png";
export default function LessonDetailsPage({ lesson, onBook }) {
  // дефолты, чтобы не падало, даже если lesson пока “бедный”
  const data = {
    title: lesson?.title || "Занятие",
    subtitle:
      lesson?.subtitle ||
      "Занятия, направленные на развитие навыков и интересов.",
    age: lesson?.age || "от 6 лет",
    price: lesson?.price || "700 ₽",
    duration: lesson?.duration || "1 час",
    teacher: lesson?.teacher || "Такой-то Такойтович",
    // schedules:
    // либо группы по возрастам (label + sessions),
    // либо один список sessions без label
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
      // если групп нет — используй sessions:
      // sessions: [{ day:"ПН", time:"12:00" }, { day:"СР", time:"12:00" }],
    },
  };

  const hasGroups =
    Array.isArray(data.schedule?.groups) && data.schedule.groups.length > 0;
  const flatSessions = Array.isArray(data.schedule?.sessions)
    ? data.schedule.sessions
    : [];

  return (
    <div className="page lessonDetailsPage">
      {/* Заголовок + подзаголовок */}
      <div className="lessonHead">
        <h1 className="lessonTitle">{data.title}</h1>
        <div className="lessonSubtitle">{data.subtitle}</div>
      </div>

      {/* Плашка “Возраст / Цена / Длительность” (КЛАССЫ ПОД НОВЫЕ СТИЛИ) */}
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

      {/* Преподаватель */}
      <div className="teacherCard">
  <img
    className="teacherAvatar"
    src={teacherPlaceholder}
    alt=""
  />

  <div className="teacherText">
    <div className="teacherLabel">Преподаватель</div>
    <div className="teacherName">{data.teacher}</div>
  </div>
</div>

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

      {/* Кнопка снизу (fixed) */}
      <div className="stickyCta">
        <button type="button" className="primaryCta" onClick={() => onBook?.(lesson)}>
          Записаться
        </button>
      </div>
    </div>
  );
}