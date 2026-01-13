import Pressable from "./Pressable";

export default function PrimaryButton({
  children,
  onPress,
  disabled = false,
  className = "",
  type = "button",
}) {
  return (
    <Pressable
      as="button"
      type={type}
      className={`primaryButton ${className}`}
      onPress={onPress}
      disabled={disabled}
    >
      {children}
    </Pressable>
  );
}