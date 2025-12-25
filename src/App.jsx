import { useEffect, useState } from "react";
import "./App.css";

import HomePage from "./pages/HomePage.jsx";
import VysheListPage from "./pages/VysheListPage.jsx";
import LessonDetailsPage from "./pages/LessonDetailsPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

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

  // Отправка записи на сервер (Vercel Function: /api/book)
  const submitBookingToServer = async (payload) => {
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData; // важно: initData (строка), не initDataUnsafe

    if (!initData) {
      throw new Error("Нет Telegram initData. Открой миниапп строго из бота.");
    }

    const res = await fetch("/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload, initData }),
    });

    let data = null;
    try {
      data = await res.json();
    } catch (e) {}

    if (!res.ok) {
      const msg =
        (data && (data.error || data.message)) || `Ошибка сервера (${res.status})`;
      throw new Error(msg);
    }

    if (data && data.ok === false) {
      throw new Error(data.error || "Ошибка сервера");
    }

    return data;
  };

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
                onSubmit={async (payload) => {
                  if (isSubmittingBooking) return; // защита от дабл-клика

                  console.log("BOOKING SUBMIT:", payload);

                  setIsSubmittingBooking(true);
                  try {
                    await submitBookingToServer(payload);

                    setLastBooking(payload);
                    setScreen("success");
                  } catch (err) {
                    console.error("BOOKING SUBMIT ERROR:", err);
                    alert(
                      `Не удалось отправить запись.\n${err?.message || "Попробуйте ещё раз."}`
                    );
                  } finally {
                    setIsSubmittingBooking(false);
                  }
                }}
              />
            )}

            {screen === "success" && (
              <SuccessPage
                title="Вы записались на занятие"
                subtitle="Детали записи придут вам в бота. Также там можно отменить запись."
                onHome={() => setScreen("home")}
                // lastBooking пока не используем, но он сохранён в стейте
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}