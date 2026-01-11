import { useEffect, useMemo, useState } from "react";
import "./App.css";

import HomePage from "./pages/HomePage.jsx";
import VysheListPage from "./pages/VysheListPage.jsx";
import LessonDetailsPage from "./pages/LessonDetailsPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";

// --------------------
// DEV helpers (локально)
// --------------------
function isLocalDev() {
  if (typeof window === "undefined") return false;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

function getDevScreenFromUrl() {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  return sp.get("screen"); // например: success, booking, details, vyshe, home
}

export default function App() {
  // ✅ DEV: если в localhost есть ?screen=success — стартуем сразу туда
  const initialScreen = useMemo(() => {
    if (!isLocalDev()) return "home";
    const s = getDevScreenFromUrl();
    return s || "home";
  }, []);

  const [screen, setScreen] = useState(initialScreen);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lastBooking, setLastBooking] = useState(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const isDetails =
    screen === "details" ||
    screen === "lessonDetails" ||
    screen === "lesson_details";

  const isSubpage = screen !== "home";

  // ✅ DEV: фейковая запись, чтобы SuccessPage имел данные (если тебе надо)
  const devBookingPayload = useMemo(() => {
    return {
      lessonTitle: "Тестовое занятие (DEV)",
      name: "Илья Лось",
      group: "7–8 лет",
      date: "ПН, 01.01",
      time: "12:00",
    };
  }, []);

  // ✅ DEV: хоткей (в localhost)
  useEffect(() => {
    if (!isLocalDev()) return;

    const onKeyDown = (e) => {
      // 9 -> success
      if (e.key === "9") {
        setLastBooking(devBookingPayload);
        setScreen("success");
      }
      // 8 -> booking
      if (e.key === "8") setScreen("booking");
      // 7 -> details
      if (e.key === "7") setScreen("details");
      // 0 -> home
      if (e.key === "0") setScreen("home");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [devBookingPayload]);

  const goBack = () => {
    if (screen === "success") {
      setScreen("booking");
      return;
    }
    if (screen === "booking") {
      setScreen("details");
      return;
    }
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

  const submitBookingToServer = async (payload) => {
    const tg = window.Telegram?.WebApp;
    const initData = tg?.initData;

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
                lesson={
                  selectedLesson ||
                  (isLocalDev()
                    ? {
                        title: "Тестовое занятие (DEV)",
                        subtitle: "Чтобы тебе не мешал пустой экран.",
                        ageRange: "7–9 лет",
                        price: "700 ₽",
                        duration: "1 час",
                        schedule: {
                          sessions: [
                            { day: "ПН", time: "12:00" },
                            { day: "СР", time: "12:00" },
                          ],
                        },
                      }
                    : null)
                }
                onBack={goBack}
                onBook={() => setScreen("booking")}
              />
            )}

            {screen === "booking" && (
              <BookingPage
                lesson={
                  selectedLesson ||
                  (isLocalDev()
                    ? {
                        title: "Тестовое занятие (DEV)",
                        ageRange: "7–9 лет",
                        schedule: {
                          sessions: [
                            { day: "ПН", time: "12:00" },
                            { day: "СР", time: "12:00" },
                          ],
                        },
                      }
                    : null)
                }
                isSubmitting={isSubmittingBooking}
                onSubmit={async (payload) => {
                  if (isSubmittingBooking) return;

                  // ✅ DEV: в localhost можно не дергать сервер — сразу успех
                  if (isLocalDev()) {
                    setLastBooking(payload);
                    setScreen("success");
                    return;
                  }

                  setIsSubmittingBooking(true);
                  try {
                    await submitBookingToServer(payload);
                    setLastBooking(payload);
                    setScreen("success");
                  } catch (err) {
                    console.error("BOOKING SUBMIT ERROR:", err);
                    alert(
                      `Не удалось отправить запись.\n${
                        err?.message || "Попробуйте ещё раз."
                      }`
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
                lastBooking={lastBooking || (isLocalDev() ? devBookingPayload : null)}
              />
            )}

            {/* ✅ DEV: маленькая подсказка (только localhost) */}
            {isLocalDev() && (
              <div
                style={{
                  position: "fixed",
                  left: 8,
                  bottom: 8,
                  zIndex: 9999,
                  fontSize: 12,
                  padding: "6px 8px",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  pointerEvents: "none",
                }}
              >
                DEV: 9=success · 8=booking · 7=details · 0=home · ?screen=success
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}