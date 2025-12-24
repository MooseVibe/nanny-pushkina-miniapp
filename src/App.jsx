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
    if (!tg) return;

    tg.ready();
    
    try {
      tg.expand();
      tg.disableVerticalSwipes();
    } catch (e) {}

    // 1) На главной — не показываем back. На внутренних — показываем.
    if (isSubpage) tg.BackButton.show();
    else tg.BackButton.hide();

    // 2) Клик по back в шапке Telegram = наш goBack()
    const onBack = () => goBack();
    tg.BackButton.onClick(onBack);

    // 3) Просим Telegram не сворачивать свайпом вниз (если поддерживается)
    try {
      tg.expand();
      tg.disableVerticalSwipes();
    } catch (e) {}

    // (опционально) если хочешь подтверждение закрытия:
    // try { tg.enableClosingConfirmation(); } catch (e) {}

    return () => {
      tg.BackButton.offClick(onBack);
    };
  }, [isSubpage, isDetails, screen]);

  console.log("APP HOT RELOAD CHECK 777");

  return (
    <div className="app">
      <div className="phone">
        <div className="appRoot">
          <div className={`headerBg ${isDetails ? "headerBg--details" : ""}`} />

          {/* УБРАЛИ debugBackBtn — теперь back в шапке Telegram */}

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