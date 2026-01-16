import hintIcon from "../assets/icons/hint.svg";
import Pressable from "./Pressable";

export default function HintButton({
  onPress,
  ariaLabel = "Подробнее",
  delayMs = 140,
  className = "",
}) {
  return (
    <Pressable
      as="button"
      className={`hintBtn ${className}`.trim()}
      aria-label={ariaLabel}
      delayMs={delayMs}
      onPress={onPress}
    >
      <img className="hintIcon" src={hintIcon} alt="" />
    </Pressable>
  );
}