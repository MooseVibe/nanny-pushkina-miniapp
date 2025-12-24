import successCheck from "../assets/illustrations/success/success-check.svg";
import doodleTL from "../assets/illustrations/success/success-doodle-top-left.svg";
import doodleTR from "../assets/illustrations/success/success-doodle-top-right.svg";
import doodleML from "../assets/illustrations/success/success-doodle-middle-left.svg";
import doodleMR from "../assets/illustrations/success/success-doodle-middle-right.svg";

export default function SuccessPage({ title, subtitle, onHome }) {
  const h1 = title || "Вы записались на занятие";
  const p =
    subtitle ||
    "Детали записи придут вам в бота. Также там можно отменить запись.";

  return (
    <div className="page successPage">
      {/* Doodles */}
      <img className="successDoodle successDoodle--tl" src={doodleTL} alt="" aria-hidden="true" />
      <img className="successDoodle successDoodle--tr" src={doodleTR} alt="" aria-hidden="true" />
      <img className="successDoodle successDoodle--ml" src={doodleML} alt="" aria-hidden="true" />
      <img className="successDoodle successDoodle--mr" src={doodleMR} alt="" aria-hidden="true" />

      {/* 2 блока + auto spacing */}
      <div className="successLayout">
        {/* 1) контент */}
        <div className="successContent">
          <img className="successCheckImg" src={successCheck} alt="" aria-hidden="true" />

          <h1 className="successTitle">{h1}</h1>
          <div className="successSubtitle">{p}</div>
        </div>

        {/* 2) кнопка */}
        <div className="successFooter">
          <button type="button" className="primaryCta" onClick={onHome}>
            На главную
          </button>
        </div>
      </div>
    </div>
  );
}