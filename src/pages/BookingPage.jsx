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
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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

// Разрешаем: RU/EN буквы + пробел + дефис
function sanitizeName(value) {
  return value
    .replace(/[^A-Za-zА-Яа-яЁё\s-]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s+/g, "");
}

export default function BookingPage({ lesson, onSubmit, isSubmitting = false }) {
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
      ],
    };
  }, [lesson]);

  const [name, setName] = useState("");
  const [selectedGroupLabel, setSelectedGroupLabel] = useState(data.groups[0]?.label || "");

  // Ошибка для имени
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [nameHadInvalidChars, setNameHadInvalidChars] = useState(false);

  const nameClean = name.trim();
  const nameOk = nameClean.length >= 2;

  const nameFormatOk = /^[A-Za-zА-Яа-яЁё]+(?:[ -][A-Za-zА-Яа-яЁё]+)*$/.test(nameClean);

  const showNameError =
    submitAttempted && (!nameOk || !nameFormatOk || nameHadInvalidChars);

  const nameErrorText = !nameOk
    ? "Введите имя и фамилию"
    : !nameFormatOk || nameHadInvalidChars
    ? "Только буквы, пробел и дефис"
    : "";

  useEffect(() => {
    setSelectedGroupLabel(data.groups[0]?.label || "");
  }, [data.groups]);

  const selectedGroup = useMemo(() => {
    return data.groups.find((g) => g.label === selectedGroupLabel) || data.groups[0];
  }, [data.groups, selectedGroupLabel]);

  const dateOptions = useMemo(() => {
    const sessions = selectedGroup?.sessions || [];
    const uniqueDays = Array.from(new Set(sessions.map((s) => s.day))).filter(Boolean);

    uniqueDays.sort((a, b) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b));

    const dates = uniqueDays.flatMap((day) =>
      nextDatesForWeekday(day, 4).map((d) => ({
        key: `${day}-${d.toISOString().slice(0, 10)}`,
        day,
        date: d,
        label: formatDateRu(d),
      }))
    );

    dates.sort((a, b) => a.date - b.date);
    return dates;
  }, [selectedGroup]);

  const [selectedDateKey, setSelectedDateKey] = useState("");

  const timeOptions = useMemo(() => {
    const sessions = selectedGroup?.sessions || [];
    const uniqueTimes = Array.from(new Set(sessions.map((s) => s.time))).filter(Boolean);
    uniqueTimes.sort();
    return uniqueTimes.length ? uniqueTimes : ["12:00"];
  }, [selectedGroup]);

  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    setSelectedDateKey(dateOptions[0]?.key || "");
  }, [dateOptions]);

  useEffect(() => {
    setSelectedTime(timeOptions[0] || "");
  }, [timeOptions]);

  const canSubmit =
    nameOk &&
    nameFormatOk &&
    !nameHadInvalidChars &&
    !!selectedGroupLabel &&
    !!selectedDateKey &&
    !!selectedTime;

  const handleSubmit = () => {
    // ВАЖНО: всегда ставим попытку отправки, даже если форма невалидна
    setSubmitAttempted(true);

    // если идет загрузка — не даём кликать повторно
    if (isSubmitting) return;

    // если невалидно — просто показываем ошибку, но не отправляем
    if (!canSubmit) return;

    const pickedDateObj = dateOptions.find((d) => d.key === selectedDateKey);

    onSubmit?.({
      lessonTitle: data.title,
      name: nameClean,
      group: selectedGroupLabel,
      date: pickedDateObj ? pickedDateObj.label : "",
      time: selectedTime,
    });
  };

  return (
    <div className="page bookingPage">
      <div className="bookingLayout">
        <div className="bookingContent">
          <div className="bookingHead">
            <h1 className="pageTitle">Запись на {data.title}</h1>
          </div>

          <div className="bookingForm">
            <div className="formBlock">
              <div className="formLabel">Кого записываем</div>

              <input
                className={`textInput${showNameError ? " textInputError" : ""}`}
                type="text"
                value={name}
                onChange={(e) => {
                  const raw = e.target.value;
                  const cleaned = sanitizeName(raw);

                  if (raw !== cleaned) setNameHadInvalidChars(true);

                  setName(cleaned);

                  // начал ввод — убрали ошибку
                  if (submitAttempted) setSubmitAttempted(false);

                  // если всё чисто — снимаем флаг
                  if (nameHadInvalidChars && raw === cleaned) {
                    setNameHadInvalidChars(false);
                  }
                }}
                placeholder="Имя и фамилия"
                inputMode="text"
                autoComplete="name"
              />

              {showNameError && (
                <div className="textInputErrorText">{nameErrorText}</div>
              )}
            </div>

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

            <div className="formBlock">
              <div className="formLabel">Дата посещения</div>

              <div className="fullBleed">
                <div className="chipRow chipRowScroll">
                  {dateOptions.map((d) => {
                    const active = d.key === selectedDateKey;
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

        <div className="stickyCta">
          <button
            type="button"
            // кнопка выглядит disabled, но кликается — чтобы показать ошибку
            className={`primaryCta${canSubmit && !isSubmitting ? "" : " primaryCta--disabled"}`}
            onClick={handleSubmit}
            disabled={isSubmitting} // disabled ТОЛЬКО на время загрузки
          >
            {isSubmitting ? <span className="btnSpinner" aria-hidden="true" /> : "Записаться"}
          </button>
        </div>
      </div>
    </div>
  );
}