import { useEffect, useState } from "react";
import "./App.css";

import HomePage from "./pages/HomePage.jsx";
import VysheListPage from "./pages/VysheListPage.jsx";
import LessonDetailsPage from "./pages/LessonDetailsPage.jsx";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedLesson, setSelectedLesson] = useState(null);

  const isDetails =
    screen === "details" || screen === "lessonDetails" || screen === "lesson_details";

  const isSubpage = screen !== "home";

  const goBack = () => {
    if (isDetails) {
      setScreen("vyshe");
      return;
    }
    if (screen === "vyshe") {
      setScreen("home");
      return;
    }
  };

  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    // Хэндлеры — объявляем заранее, чтобы корректно отписываться
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

      // Поведение miniapp
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
      if (tg) {
        tg.BackButton.offClick(onBack);
      }
      try {
        document.removeEventListener("gesturestart", preventGesture);
        document.removeEventListener("gesturechange", preventGesture);
        document.removeEventListener("gestureend", preventGesture);
        document.removeEventListener("touchstart", preventPinch);
        document.removeEventListener("touchmove", preventPinch);
      } catch (e) {}
    };
  }, [isSubpage, isDetails, screen]); // важно: зависит от screen, чтобы back показывался/прятался

  console.log("APP HOT RELOAD CHECK 777");

  return (
    <div className="app">
      <div className="phone">
        <div className="appRoot">
          <div className={`headerBg ${isDetails ? "headerBg--details" : ""}`} />

          <div className={`contentShell ${isDetails ? "contentShell--details" : ""}`}>
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
              <LessonDetailsPage lesson={selectedLesson} onBack={goBack} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}