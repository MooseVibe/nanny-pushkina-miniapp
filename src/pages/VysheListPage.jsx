import hintIcon from "../assets/icons/hint.svg";
import LessonCard from "../components/LessonCard";
import iconAny from "../assets/illustrations/vyshe.svg"; // временно, потом заменим на реальные иконки

const lessons = [
  { title: "ИЗО", price: "700 ₽", age: "от 6 лет" },
  { title: "Вокал", price: "700 ₽", age: "от 6 лет" },
  { title: "Очумелые ручки", price: "700 ₽", age: "от 6 лет" },
  { title: "Актерское мастерство", price: "700 ₽", age: "от 6 лет" },
  { title: "Театр кукол", price: "700 ₽", age: "от 6 лет" },
  { title: "Английский язык", price: "700 ₽", age: "от 6 лет" },
  { title: "Песочная анимация", price: "700 ₽", age: "от 6 лет" },
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
  <img
    src={hintIcon}
    alt=""
    className="hintIcon"
  />
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