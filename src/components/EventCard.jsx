export default function EventCard({ date, title, price, age }) {
  return (
    <div className="eventCard">
      <div className="eventCard__left">
        <div className="eventCard__date">{date}</div>
        <div className="eventCard__title">{title}</div>
        <div className="eventCard__price">{price}</div>
      </div>

      <div className="eventCard__badge">{age}</div>
    </div>
  );
}