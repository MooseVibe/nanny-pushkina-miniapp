import { useState } from "react";
import "./App.css";

import HomePage from "./Pages/HomePage.jsx";
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

  return (
    <div className="app">
      <div className="phone">
        <div className="appRoot">
          <div className={`headerBg ${isDetails ? "headerBg--details" : ""}`} />
  
          {isSubpage && (
            <button
              type="button"
              className="debugBackBtn"
              onClick={goBack}
              aria-label="Назад"
            >
              ←
            </button>
          )}
  
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