import { useEffect, useState } from "react";
import "./App.css";

import HomePage from "./pages/HomePage.jsx";
import VysheListPage from "./pages/VysheListPage.jsx";
import LessonDetailsPage from "./pages/LessonDetailsPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";

// ✅ doodles для Success (поправь пути под свою структуру)
import doodleTL from "./assets/illustrations/success-doodle-tl.svg";
import doodleTR from "./assets/illustrations/success-doodle-tr.svg";
import doodleML from "./assets/illustrations/success-doodle-ml.svg";
import doodleMR from "./assets/illustrations/success-doodle-mr.svg";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);

  const isDetails =
    screen === "details" ||
    screen === "lessonDetails" ||
    screen === "lesson_details";

  const isSubpage = screen !== "home";

  const goBack = () => {
    // 0) Из success назад на booking
    if (screen === "success") {
      setScreen("booking");
      return;
    }
    // 1) Из booking назад на details
    if (screen === "booking") {
      setScreen("details");
      return;
    }
    // 2) Из details назад на vyshe
    if (isDetails) {
      setScreen("vyshe");
      return;
    }
    // 3) Из vyshe назад на home
    if (screen === "vyshe") {
      setScreen("home");
      return;
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    const onBack = () => goBack();
    const preventGesture = (e) => e.preventDefault();
    const preventPinch = (e) => {
      if (e.touches && e.touches.length > 1) e.preventDefault();
    };

    if (tg) {
      tg.ready();

      if (isSubpage) tg.BackButton.show();
      else tg.BackButton.hide();

      tg.BackButton.onClick(onBack);

      try {
        tg.expand();
        tg.disableVerticalSwipes();
      } catch (e) {}
    }

    try {
      document.addEventListener("gesturestart", preventGesture, { passive: false });
      document.addEventListener("gesturechange", preventGesture, { passive: false });
      document.addEventListener("gestureend", preventGesture, { passive: false });

      document.addEventListener("touchstart", preventPinch, { passive: false });
      document.addEventListener("touchmove", preventPinch, { passive: false });
    } catch (e) {}

    return () => {
      if (tg) tg.BackButton.offClick(onBack);

      try {
        document.removeEventListener("gesturestart", preventGesture);
        document.removeEventListener("gesturechange", preventGesture);
        document.removeEventListener("gestureend", preventGesture);

        document.removeEventListener("touchstart", preventPinch);
        document.removeEventListener("touchmove", preventPinch);
      } catch (e) {}
    };
  }, [isSubpage, isDetails, screen]);

  return (
    <div className="app">
      <div className="phone">
        <div className="appRoot">
          <div className="headerBg" />

          {/* ✅ SUCCESS DOODLES — ВНЕ contentShell (чтобы не резались padding:16) */}
          {screen === "success" && (
            <>
              <img className="successDoodle successDoodle--tl" src={doodleTL} alt="" />
              <img className="successDoodle successDoodle--tr" src={doodleTR} alt="" />
              <img className="successDoodle successDoodle--ml" src={doodleML} alt="" />
              <img className="successDoodle successDoodle--mr" src={doodleMR} alt="" />
            </>
          )}

          <div className="contentShell">
            {screen === "home" && (
              <HomePage onOpenVyshe={() => setScreen("vyshe")} />
            )}

            {screen === "vyshe" && (
              <VysheListPage
                onHelp={() => alert("Здесь потом будет штора: что такое «Выше»")}
                onOpenLesson={(lesson) => {
                  setSelectedLesson(lesson);
                  setScreen("details");
                }}
              />
            )}

            {isDetails && (
              <LessonDetailsPage
                lesson={selectedLesson}
                onBack={goBack}
                onBook={() => setScreen("booking")}
              />
            )}

            {screen === "booking" && (
              <BookingPage
                lesson={selectedLesson}
                onBack={goBack}
                onSubmit={(payload) => {
                  console.log("BOOKING SUBMIT:", payload);
                  setLastBooking(payload);
                  setScreen("success");
                }}
              />
            )}

            {screen === "success" && (
              <SuccessPage
                title="Вы записались на занятие"
                subtitle="Детали записи придут вам в бота. Также там можно отменить запись."
                booking={lastBooking}
                onHome={() => setScreen("home")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}