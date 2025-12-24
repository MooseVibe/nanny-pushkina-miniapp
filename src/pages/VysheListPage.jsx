import iconSand from "../assets/icons/sand.svg";
import iconIzo from "../assets/icons/izo.svg";
import iconVocal from "../assets/icons/vocal.svg";
import iconHands from "../assets/icons/hands.svg";
import iconActor from "../assets/icons/actor.svg";
import iconPuppets from "../assets/icons/puppets.svg";
import iconEnglish from "../assets/icons/english.svg";
import hintIcon from "../assets/icons/hint.svg";
import LessonCard from "../components/LessonCard";
import iconAny from "../assets/illustrations/vyshe.svg"; // временно, потом заменим на реальные иконки

const lessons = [
  { title: "ИЗО", price: "700 ₽", age: "от 6 лет", icon: iconIzo },
  { title: "Вокал", price: "700 ₽", age: "от 6 лет", icon: iconVocal },
  { title: "Очумелые ручки", price: "700 ₽", age: "от 6 лет", icon: iconHands },
  { title: "Актерское мастерство", price: "700 ₽", age: "от 6 лет", icon: iconActor },
  { title: "Театр кукол", price: "700 ₽", age: "от 6 лет", icon: iconPuppets },
  { title: "Английский язык", price: "700 ₽", age: "от 8 лет", icon: iconEnglish },
  { title: "Песочная анимация", price: "700 ₽", age: "от 6 лет", icon: iconSand },
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
  <img className="hintIcon" src={hintIcon} alt="" />
</button>
      </div>

      <div className="vysheList">
        {lessons.map((l) => (
          <LessonCard
          key={l.title}
          iconSrc={l.icon || iconAny}
          title={l.title}
          price={l.price}
          age={l.age}
          onClick={() => onOpenLesson(l)}
        />
        ))}
      </div>
    </div>
  );
}