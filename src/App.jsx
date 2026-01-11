import { useEffect, useMemo, useState } from "react";
import "./App.css";

import ScreenStack from "./components/ScreenStack";
import "./styles/transitions.css";

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
  const [navDir, setNavDir] = useState("forward"); // "forward" | "back"

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

  // =========================================
  // iOS/Telegram keyboard fix (robust)
  // - uses visualViewport when available (best signal in iOS WebView)
  // - sets CSS var --kb and class kbOpen on <html>
  // =========================================
  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;

    // fallback: if no visualViewport, do nothing (Android/desktop ok)
    if (!vv) return;

    let raf = 0;

    const update = () => {
      // window.innerHeight ~= layout viewport
      // vv.height/offsetTop ~= visual viewport (shrinks when keyboard opens)
      const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);

      // threshold to avoid tiny bounces
      const kbPx = kb > 80 ? kb : 0;

      root.style.setProperty("--kb", `${kbPx}px`);
      root.classList.toggle("kbOpen", kbPx > 0);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    // initial
    update();

    vv.addEventListener("resize", schedule);
    vv.addEventListener("scroll", schedule);

    // iOS sometimes updates after focus
    const onFocusIn = () => setTimeout(update, 0);
    const onFocusOut = () => setTimeout(update, 0);

    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);

    return () => {
      cancelAnimationFrame(raf);
      vv.removeEventListener("resize", schedule);
      vv.removeEventListener("scroll", schedule);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);

      root.style.removeProperty("--kb");
      root.classList.remove("kbOpen");
    };
  }, []);

  useEffect(() => {
    if (!isLocalDev()) return;

    const onKeyDown = (e) => {
      if (e.key === "9") {
        setLastBooking(devBookingPayload);
        setNavDir("forward");
        setScreen("success");
      }
      if (e.key === "8") {
        setNavDir("forward");
        setScreen("booking");
      }
      if (e.key === "7") {
        setNavDir("forward");
        setScreen("details");
      }
      if (e.key === "0") {
        setNavDir("back");
        setScreen("home");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [devBookingPayload]);

  const goBack = () => {
    setNavDir("back");

    if (screen === "success") return setScreen("booking");
    if (screen === "booking") return setScreen("details");
    if (isDetails) return setScreen("vyshe");
    if (screen === "vyshe") return setScreen("home");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const renderScreen = () => {
    if (screen === "home") {
      return (
        <HomePage
          onOpenVyshe={() => {
            setNavDir("forward");
            setScreen("vyshe");
          }}
        />
      );
    }

    if (screen === "vyshe") {
      return (
        <VysheListPage
          onHelp={() => alert("Здесь потом будет штора: что такое «Выше»")}
          onOpenLesson={(lesson) => {
            setSelectedLesson(lesson);
            setNavDir("forward");
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
          onBook={() => {
            setNavDir("forward");
            setScreen("booking");
          }}
        />
      );
    }

    if (screen === "booking") {
      return (
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

            if (isLocalDev()) {
              setLastBooking(payload);
              setNavDir("forward");
              setScreen("success");
              return;
            }

            setIsSubmittingBooking(true);
            try {
              await submitBookingToServer(payload);
              setLastBooking(payload);
              setNavDir("forward");
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
      );
    }

    if (screen === "success") {
      return (
        <SuccessPage
          title="Вы записались на занятие"
          subtitle="Детали записи придут вам в бота. Также там можно отменить запись."
          onHome={() => {
            setNavDir("back");
            setScreen("home");
          }}
          lastBooking={lastBooking || (isLocalDev() ? devBookingPayload : null)}
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
            <ScreenStack screenKey={screen} direction={navDir} durationMs={340}>
              {renderScreen()}
            </ScreenStack>

            {/* BUILD бейдж: чтобы 100% видеть, что Telegram открыл новый билд */}
            <div
              style={{
                position: "fixed",
                right: 8,
                top: 8,
                zIndex: 999999,
                fontSize: 12,
                padding: "6px 8px",
                borderRadius: 10,
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                pointerEvents: "none",
              }}
            >
              BUILD: kbfix-vv-1
            </div>

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