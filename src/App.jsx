import { useEffect, useState } from "react";
import "./App.css";

import HomePage from "./pages/HomePage.jsx";
import VysheListPage from "./pages/VysheListPage.jsx";
import LessonDetailsPage from "./pages/LessonDetailsPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedLesson, setSelectedLesson] = useState(null);

  const isDetails =
    screen === "details" ||
    screen === "lessonDetails" ||
    screen === "lesson_details";

  const isSubpage = screen !== "home";

  const goBack = () => {
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

      // BackButton по паттерну Telegram
      if (isSubpage) tg.BackButton.show();
      else tg.BackButton.hide();

      tg.BackButton.onClick(onBack);

      try {
        tg.expand();
        tg.disableVerticalSwipes();
      } catch (e) {}
    }

    // Anti-zoom (особенно iOS / Telegram WebView)
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
                  alert(
                    `Записали: ${payload.name}\n${payload.lessonTitle}\n${payload.group}\n${payload.date} • ${payload.time}`
                  );
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}