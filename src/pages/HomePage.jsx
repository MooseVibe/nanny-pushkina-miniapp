import vysheImg from "../assets/illustrations/vyshe.svg";
import holidaysImg from "../assets/illustrations/holidays.svg";
import pushkinImg from "../assets/illustrations/pushkin.svg";
import kommunalkaImg from "../assets/illustrations/kommunalka.svg";
import ServiceCard from "../components/Card";

function LockBadge() {
  return (
    <div className="lockBadge" aria-hidden="true">
      <img className="lockIconImg" src="/icons/lock.svg" alt="" />
    </div>
  );
}

function LockedCard({ children, onClick }) {
  return (
    <button
      type="button"
      className="lockedWrap"
      onClick={onClick}
      aria-label="Раздел пока недоступен"
    >
      <div className="lockedContent">{children}</div>
      <LockBadge />
    </button>
  );
}

export default function HomePage({ onOpenVyshe }) {
  const lockedAlert = () =>
    alert("Этот раздел пока в разработке. Скоро откроем 🙂");

  return (
    <div className="page homePage stack20">
      <h1 className="pageTitle">Добро пожаловать к Няне Пушкина!</h1>

      {/* Ближайшие события скрыты */}

      <div className="servicesGrid">
        <ServiceCard
          title="Выше"
          subtitle="Занятия для детей и взрослых"
          imageSrc={vysheImg}
          imageAlt="Выше"
          imageWidth={182}
          imageHeight={182}
          imageX={7}
          imageY={40}
          onClick={onOpenVyshe}
        />

        <LockedCard onClick={lockedAlert}>
          <ServiceCard
            title="Праздники у Няни"
            subtitle="Организуем событие любой сложности"
            imageSrc={holidaysImg}
            imageAlt="Праздники"
            imageWidth={146}
            imageHeight={115}
            imageX={0}
            imageY={55}
          />
        </LockedCard>

        <LockedCard onClick={lockedAlert}>
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
        </LockedCard>

        <LockedCard onClick={lockedAlert}>
          <ServiceCard
            title="Коммуналка"
            subtitle="Комьюнити, общение, жизнь"
            imageSrc={kommunalkaImg}
            imageAlt="Коммуналка"
            imageWidth={124}
            imageHeight={124}
            imageX={0}
            imageY={52}
          />
        </LockedCard>
      </div>
    </div>
  );
}