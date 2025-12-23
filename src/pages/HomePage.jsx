import vysheImg from "../assets/illustrations/vyshe.svg";
import holidaysImg from "../assets/illustrations/holidays.svg";
import pushkinImg from "../assets/illustrations/pushkin.svg";
import kommunalkaImg from "../assets/illustrations/kommunalka.svg";
import EventCard from "../components/EventCard";
import ServiceCard from "../components/Card";

export default function HomePage({ onOpenVyshe }) {
  return (
    <div className="page">
      <h1>Добро пожаловать к Няне Пушкина!</h1>

      <div className="eventsBlock">
        <div className="sectionTitle">Ближайшие события</div>
        <EventCard
          date="24–26 декабря"
          title="Новогодний утренник"
          price="3000 ₽"
          age="от 6 лет"
        />
      </div>

      <div className="servicesGrid">
        <ServiceCard
          title="Выше"
          subtitle="Занятия для детей и взрослых"
          imageSrc={vysheImg}
          imageAlt="Выше"
          imageWidth={182}
          imageHeight={182}
          imageX={-5}
          imageY={40}
          onClick={onOpenVyshe}
        />
        <ServiceCard
          title="Праздники у Няни"
          subtitle="Организуем событие любой сложности"
          imageSrc={holidaysImg}
          imageAlt="Праздники"
          imageWidth={146}
          imageHeight={115}
          imageX={20}
          imageY={55}
        />
        <ServiceCard
          title="Пушкинская среда"
          subtitle="Лекции и обсуждения"
          imageSrc={pushkinImg}
          imageAlt="Пушкинская среда"
          imageWidth={166}
          imageHeight={118}
          imageX={0}
          imageY={40}
        />
        <ServiceCard
          title="Коммуналка"
          subtitle="Комьюнити, общение, жизнь"
          imageSrc={kommunalkaImg}
          imageAlt="Коммуналка"
          imageWidth={124}
          imageHeight={124}
          imageX={42}
          imageY={52}
        />
      </div>
    </div>
  );
}