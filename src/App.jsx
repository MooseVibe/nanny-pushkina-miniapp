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
  return sp.get("screen"); // success, booking, details, vyshe, home
}

export default function App() {
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

  const devBookingPayload = useMemo(() => {
    return {
      lessonTitle: "Тестовое занятие (DEV)",
      name: "Илья Лось",
      group: "7–8 лет",
      date: "ПН, 01.01",
      time: "12:00",
    };
  }, []);

  const goBack = () => {
    if (screen === "success") return setScreen("booking");
    if (screen === "booking") return setScreen("details");
    if (isDetails) return setScreen("vyshe");
    if (screen === "vyshe") return setScreen("home");
  };

  // =========================================
  // 1) Freeze app height ONCE
  // =========================================
  useEffect(() => {
    const root = document.documentElement;

    const setAppH = () => {
      const h = Math.max(1, Math.round(window.innerHeight));
      root.style.setProperty("--appH", `${h}px`);
    };

    setAppH();

    const onOrientation = () => setTimeout(setAppH, 200);
    window.addEventListener("orientationchange", onOrientation);

    return () => {
      window.removeEventListener("orientationchange", onOrientation);
    };
  }, []);

  // =========================================
  // 2) Keyboard overlay mode
  // =========================================
  useEffect(() => {
    const root = document.documentElement;
    let kb = false;

    const setKb = (open) => {
      if (open === kb) return;
      kb = open;
      root.classList.toggle("keyboardOpen", open);
    };

    const isTextField = (el) => {
      if (!el) return false;
      const tag = el.tagName;
      return tag === "INPUT" || tag === "TEXTAREA";
    };

    const onFocusIn = (e) => {
      if (isTextField(e.target)) setKb(true);
    };

    const onFocusOut = (e) => {
      if (isTextField(e.target)) {
        setTimeout(() => setKb(false), 80);
      }
    };

    const onTouchMove = (e) => {
      if (!kb) return;
      e.preventDefault();
    };

    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    document.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("touchmove", onTouchMove);
      root.classList.remove("keyboardOpen");
    };
  }, []);

  // =========================================
  // DEV hotkeys
  // =========================================
  useEffect(() => {
    if (!isLocalDev()) return;

    const onKeyDown = (e) => {
      if (e.key === "9") {
        setLastBooking(devBookingPayload);
        setScreen("success");
      }
      if (e.key === "8") setScreen("booking");
      if (e.key === "7") setScreen("details");
      if (e.key === "0") setScreen("home");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [devBookingPayload]);

 // Telegram integration
useEffect(() => {
  const tg = window.Telegram?.WebApp;
  const onBack = () => goBack();

  if (tg) {
    tg.ready();

    const isSuccess = screen === "success";

    // ✅ на success скрываем BackButton (чтобы был "Close")
    if (isSubpage && !isSuccess) tg.BackButton.show();
    else tg.BackButton.hide();

    tg.BackButton.onClick(onBack);

    try {
      tg.expand();
      tg.disableVerticalSwipes();
    } catch {}
  }

  return () => {
    if (tg) tg.BackButton.offClick(onBack);
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [screen, isSubpage]);

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

    const data = await res.json().catch(() => null);

    if (!res.ok || data?.ok === false) {
      throw new Error(data?.error || "Ошибка сервера");
    }

    return data;
  };

  const renderScreen = () => {
    if (screen === "home") {
      return <HomePage onOpenVyshe={() => setScreen("vyshe")} />;
    }

    if (screen === "vyshe") {
      return (
        <VysheListPage
          onHelp={() => alert("Здесь потом будет штора")}
          onOpenLesson={(lesson) => {
            setSelectedLesson(lesson);
            setScreen("details");
          }}
        />
      );
    }

    if (isDetails) {
      return (
        <LessonDetailsPage
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
          onBook={() => setScreen("booking")}
        />
      );
    }

    if (screen === "booking") {
      return (
        <BookingPage
          lesson={selectedLesson}
          isSubmitting={isSubmittingBooking}
          onSubmit={async (payload) => {
            if (isSubmittingBooking) return;

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
              alert(err.message || "Ошибка");
            } finally {
              setIsSubmittingBooking(false);
            }
          }}
        />
      );
    }

    if (screen === "success") {
      return (
        <SuccessPage
          onHome={() => setScreen("home")}
          lastBooking={lastBooking || devBookingPayload}
        />
      );
    }

    return null;
  };

  return (
    <div className="app">
      <div className="phone">
        <div className="appRoot">
          <div className="headerBg" />

          <div className="contentShell">
            {renderScreen()}
          </div>
        </div>
      </div>
    </div>
  );
}