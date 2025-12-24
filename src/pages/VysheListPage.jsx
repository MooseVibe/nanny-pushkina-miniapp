
import LessonCard from "../components/LessonCard";
import iconAny from "../assets/illustrations/vyshe.svg"; // временно, потом заменим на реальные иконки

const lessons = [
  { title: "ИЗО", price: "700 ₽", age: "от 6 лет" },
  { title: "Вокал", price: "700 ₽", age: "от 6 лет" },
  { title: "Очумелые ручки", price: "700 ₽", age: "от 6 лет" },
  { title: "Актерское мастерство", price: "700 ₽", age: "от 6 лет" },
  { title: "Театр кукол", price: "700 ₽", age: "от 6 лет" },
  { title: "Английский язык", price: "700 ₽", age: "от 8 лет" },
  { title: "Песочная анимация", price: "700 ₽", age: "от 6 лет" },
  { title: "Лепка", price: "650 ₽", age: "от 5 лет" },
  { title: "Музыкальный кружок", price: "700 ₽", age: "от 4 лет" },
  { title: "Шахматы", price: "800 ₽", age: "от 7 лет" },
  { title: "Скорочтение", price: "900 ₽", age: "от 8 лет" },
  { title: "Каллиграфия", price: "750 ₽", age: "от 9 лет" },
  { title: "Публичные выступления", price: "950 ₽", age: "от 10 лет" },
  { title: "Керамика", price: "850 ₽", age: "от 8 лет" },
  { title: "Рисунок тушью", price: "800 ₽", age: "от 9 лет" },
  { title: "Комиксы", price: "750 ₽", age: "от 8 лет" },
  { title: "Фотокружок", price: "900 ₽", age: "от 10 лет" },
  { title: "Танцы", price: "700 ₽", age: "от 6 лет" },
  { title: "Йога для детей", price: "650 ₽", age: "от 6 лет" },
  { title: "Подготовка к школе", price: "900 ₽", age: "от 5 лет" },
];

export default function VysheListPage({ onHelp, onOpenLesson }) {
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
  onClick={onHelp}
  aria-label="Что такое «Выше»"
>
  <svg
    className="hintIcon"
    width="22"
    height="22"
    viewBox="0 0 22 22"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0013 12.1386L12 12.1388V13.0256H10V12.2967C10 10.9755 10.5136 10.7277 11.0841 10.4524C11.1289 10.4308 11.174 10.41 11.2193 10.3891C11.4703 10.2731 11.7253 10.1553 11.9467 9.89673C12.7762 9.08314 12.15 7.79673 11.1002 7.80457C10.8712 7.7861 10.6415 7.83129 10.4366 7.93516C10.2317 8.03902 10.0594 8.19751 9.93895 8.39312C9.8917 8.46982 9.85313 8.55106 9.82366 8.63534C9.77801 8.76586 9.75419 8.90406 9.75379 9.04359L7.75 9.03853C7.75305 7.829 8.45184 6.69463 9.53072 6.14782C10.0652 5.87695 10.6641 5.75909 11.2613 5.80726C12.923 5.94129 14.2866 7.36342 14.3 9.04673C14.3109 10.417 13.2663 11.729 12.0013 12.1386ZM10 16H11.3C11.6866 16 12 15.6866 12 15.3V14H10.7C10.3134 14 10 14.3134 10 14.7V16Z"
      fill="currentColor"
    />
  </svg>
</button>
      </div>

      <div className="vysheList">
        {lessons.map((l) => (
          <LessonCard
            key={l.title}
            iconSrc={iconAny}
            title={l.title}
            price={l.price}
            age={l.age}
            onClick={() => onOpenLesson(l)} // важно: передаём lesson в App.jsx
          />
        ))}
      </div>
    </div>
  );
}