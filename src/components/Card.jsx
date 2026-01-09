export default function ServiceCard({
  title,
  subtitle,
  imageSrc,
  imageAlt = "",
  imageWidth = 124,
  imageHeight = 124,
  imageX = 0,
  imageY = 0,
  onClick,
}) {
  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="serviceCard pressable"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onTouchStart={() => {}}   
      role="button"
      tabIndex={0}
    >
      <div className="serviceCard__text">
        <div className="serviceCard__title">{title}</div>
        <div className="serviceCard__subtitle">{subtitle}</div>
      </div>

      <div className="serviceCard__imageWrap">
        <img
          className="serviceCard__image"
          src={imageSrc}
          alt={imageAlt}
          style={{
            width: imageWidth,
            height: imageHeight,
            transform: `translate(${imageX}px, ${imageY}px)`,
          }}
        />
      </div>
    </div>
  );
}