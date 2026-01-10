import Pressable from "./Pressable";

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
  return (
    <Pressable
      as="div"
      className="serviceCard"
      role="button"
      tabIndex={0}
      onPress={onClick}
      delayMs={140}
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
    </Pressable>
  );
}