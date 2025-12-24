import { useEffect, useMemo, useState } from "react";

const WEEKDAY_ORDER = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];
const JS_DAY_TO_RU = { 1: "ПН", 2: "ВТ", 3: "СР", 4: "ЧТ", 5: "ПТ", 6: "СБ", 0: "ВС" };
const RU_TO_JS_DAY = { ПН: 1, ВТ: 2, СР: 3, ЧТ: 4, ПТ: 5, СБ: 6, ВС: 0 };

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateRu(d) {
  const day = JS_DAY_TO_RU[d.getDay()];
  return `${day}, ${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`;
}

function nextDatesForWeekday(ruDay, count = 4) {
  const target = RU_TO_JS_DAY[ruDay];
  if (target === undefined) return [];

  const res = [];
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // без времени

  const diff = (target - start.getDay() + 7) % 7;
  let cur = new Date(start);
  cur.setDate(cur.getDate() + diff);

  for (let i = 0; i < count; i++) {
    res.push(new Date(cur));
    cur = new Date(cur);
    cur.setDate(cur.getDate() + 7);
  }

  return res;
}

export default function BookingPage({ lesson, onSubmit }) {
  // 1) Данные занятия + дефолтные группы (3 штуки)
  const data = useMemo(() => {
    if (lesson?.schedule?.groups?.length) {
      return {
        title: lesson?.title || "Занятие",
        groups: lesson.schedule.groups,
      };
    }

    return {
      title: lesson?.title || "Занятие",
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
            { day: "ВТ", time: "13:00" },
            { day: "ЧТ", time: "13:00" },
          ],
        },
        {
          label: "10–11 лет",
          sessions: [
            { day: "ПН", time: "14:00" },
            { day: "СР", time: "14:00" },
          ],
        },
      ],
    };
  }, [lesson]);

  // --- form state ---
  const [name, setName] = useState("");
  const [selectedGroupLabel, setSelectedGroupLabel] = useState(data.groups[0]?.label || "");

  // если поменялось занятие/группы (data) — гарантированно ставим первую группу
  useEffect(() => {
    setSelectedGroupLabel(data.groups[0]?.label || "");
  }, [data]);

  const selectedGroup = useMemo(() => {
    return data.groups.find((g) => g.label === selectedGroupLabel) || data.groups[0];
  }, [data.groups, selectedGroupLabel]);

  // 2) Даты зависят от выбранной группы (дни недели -> ближайшие даты)
  const dateOptions = useMemo(() => {
    const sessions = selectedGroup?.sessions || [];
    const uniqueDays = Array.from(new Set(sessions.map((s) => s.day))).filter(Boolean);

    uniqueDays.sort((a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b));

    const dates = uniqueDays.flatMap((day) =>
      nextDatesForWeekday(day, 4).map((d) => ({
        key: `${day}-${d.toISOString().slice(0, 10)}`,
        day,
        date: d,
        label: formatDateRu(d), // "ПН, 12.01"
      }))
    );

    dates.sort((a, b) => a.date - b.date);
    return dates;
  }, [selectedGroup]);

  const [selectedDateKey, setSelectedDateKey] = useState("");

  // 3) Время — уникальные времена из sessions
  const timeOptions = useMemo(() => {
    const sessions = selectedGroup?.sessions || [];
    const uniqueTimes = Array.from(new Set(sessions.map((s) => s.time))).filter(Boolean);
    uniqueTimes.sort();
    return uniqueTimes.length ? uniqueTimes : ["12:00"];
  }, [selectedGroup]);

  const [selectedTime, setSelectedTime] = useState("");

  // reset дата/время при смене группы ИЛИ при пересборке опций
  useEffect(() => {
    setSelectedDateKey(dateOptions[0]?.key || "");
  }, [dateOptions]);

  useEffect(() => {
    setSelectedTime(timeOptions[0] || "");
  }, [timeOptions]);

  const canSubmit =
    name.trim().length >= 2 &&
    !!selectedGroupLabel &&
    !!selectedDateKey &&
    !!selectedTime;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const pickedDateObj = dateOptions.find((d) => d.key === selectedDateKey);

    onSubmit?.({
      lessonTitle: data.title,
      name: name.trim(),
      group: selectedGroupLabel,
      date: pickedDateObj ? pickedDateObj.label : "",
      time: selectedTime,
    });
  };

  return (
    <div className="page bookingPage">
      <div className="bookingLayout">
        {/* 1) Контент */}
        <div className="bookingContent">
          <div className="bookingHead">
            <h1 className="pageTitle">Запись на {data.title}</h1>
          </div>

          <div className="bookingForm">
            {/* Имя */}
            <div className="formBlock">
              <div className="formLabel">Кого записываем</div>
              <input
                className="textInput"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Имя и фамилия"
                inputMode="text"
                autoComplete="name"
              />
            </div>

            {/* Возраст */}
            <div className="formBlock">
              <div className="formLabel">Возраст</div>
              <div className="chipRow">
                {data.groups.map((g) => {
                  const active = g.label === selectedGroupLabel;
                  return (
                    <button
                      key={g.label}
                      type="button"
                      className={`chip ${active ? "chipActive" : ""}`}
                      onClick={() => setSelectedGroupLabel(g.label)}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Дата */}
            <div className="formBlock">
              <div className="formLabel">Дата посещения</div>

              {/* ВОТ ЭТО ФИКС: full-bleed скролл (уходит в край экрана, а не в padding 16) */}
              <div className="fullBleed">
                <div className="chipRow chipRowScroll">
                  {dateOptions.map((d) => {
                    const active = d.key === selectedDateKey;

                    // "ПН, 12.01" -> "12.01"
                    const dateOnly = d.label.replace(`${d.day}, `, "");

                    return (
                      <button
                        key={d.key}
                        type="button"
                        className={`chip chipDate ${active ? "chipActive" : ""}`}
                        onClick={() => setSelectedDateKey(d.key)}
                      >
                        <div className="chipDateInner">
                          <div className="chipDateCaption">{d.day}</div>
                          <div className="chipDateValue">{dateOnly}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Время */}
            <div className="formBlock">
              <div className="formLabel">Время</div>
              <div className="chipRow">
                {timeOptions.map((t) => {
                  const active = t === selectedTime;
                  return (
                    <button
                      key={t}
                      type="button"
                      className={`chip ${active ? "chipActive" : ""}`}
                      onClick={() => setSelectedTime(t)}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 2) Кнопка снизу */}
        <div className="bookingFooter">
          <button
            type="button"
            className="primaryCta"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Записаться
          </button>
        </div>
      </div>
    </div>
  );
}