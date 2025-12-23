export default function LessonDetailsPage({ lesson, onBack }) {
  const title = lesson?.detailsTitle ?? lesson?.title ?? "Занятие";
  const description =
    lesson?.detailsDescription ??
    "Занятия, направленные на развитие визуального мышления и творческих навыков";

  const age = lesson?.age ?? "от 6 лет";
  const price = lesson?.price ?? "700 ₽";
  const duration = lesson?.duration ?? "1 час";

  const teacherName = lesson?.teacherName ?? "Такой-то Такойтович";
  const teacherRole = lesson?.teacherRole ?? "Преподаватель";

  const schedule =
    lesson?.schedule ?? [
      { day: "ПН", time: "12:00" },
      { day: "СР", time: "12:00" },
    ];

  return (
    <div className="lessonDetails">
      {/* ЕДИНЫЙ ЭЛЕМЕНТ: бежевый контейнер + иконка внутри */}
      <div className="lessonDetails__hero">
        <div className="lessonDetails__heroBox">
          {lesson?.icon ? (
            <img className="lessonDetails__heroIcon" src={lesson.icon} alt="" />
          ) : null}
        </div>
      </div>

      {/* ВЕСЬ КОНТЕНТ НИЖЕ ИКОНКИ */}
      <div className="lessonDetails__content">
        {/* 1) Заголовок + подзаголовок */}
        <div className="lessonDetails__head">
          <h1 className="lessonDetails__title">{title}</h1>
          <div className="lessonDetails__desc">{description}</div>
        </div>

        {/* 2) Возраст/Цена/Длительность */}
        <div className="lessonDetails__stats">
          <div className="lessonDetails__stat">
            <div className="lessonDetails__statInner">
              <div className="lessonDetails__statLabel">Возраст</div>
              <div className="lessonDetails__statValue">{age}</div>
            </div>
          </div>

          <div className="lessonDetails__stat">
            <div className="lessonDetails__statInner">
              <div className="lessonDetails__statLabel">Цена</div>
              <div className="lessonDetails__statValue">{price}</div>
            </div>
          </div>

          <div className="lessonDetails__stat">
            <div className="lessonDetails__statInner">
              <div className="lessonDetails__statLabel">Длительность</div>
              <div className="lessonDetails__statValue">{duration}</div>
            </div>
          </div>
        </div>

        {/* 3) Преподаватель */}
        <div className="lessonDetails__teacherCard">
        <div className="lessonDetails__teacherAvatar">
  <img
    src="/src/assets/avatars/teacher-placeholder.png"
    alt="Преподаватель"
    className="lessonDetails__teacherAvatarImg"
  />
</div>
          <div className="lessonDetails__teacherText">
            <div className="lessonDetails__teacherRole">{teacherRole}</div>
            <div className="lessonDetails__teacherName">{teacherName}</div>
          </div>
        </div>

        {/* 4) Когда проходят занятия */}
        <div className="lessonDetails__scheduleBlock">
          <div className="lessonDetails__sectionTitle">Когда проходят занятия</div>
          <div className="lessonDetails__schedule">
            {schedule.map((s, idx) => (
              <div className="lessonDetails__slot" key={idx}>
                <div className="lessonDetails__slotDay">{s.day}</div>
                <div className="lessonDetails__slotTime">{s.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA (прибита к низу, 46px от низа) */}
      <div className="lessonDetails__ctaDock">
        <button type="button" className="lessonDetails__cta">
          Записаться
        </button>
      </div>
    </div>
  );
}