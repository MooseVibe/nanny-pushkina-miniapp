import Pressable from "./Pressable";

export default function LessonCard({ iconSrc, title, price, age, onClick }) {
  return (
    <Pressable as="button" className="lessonCard" onPress={onClick} delayMs={140}>
      <div className="lessonCard__iconBox">
        <img className="lessonCard__icon" src={iconSrc} alt="" />
      </div>

      <div className="lessonCard__mid">
        <div className="lessonCard__title">{title}</div>
        <div className="lessonCard__price">{price}</div>
      </div>

      <div className="lessonCard__badge">{age}</div>
    </Pressable>
  );
}