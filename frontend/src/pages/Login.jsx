import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Laptop,
  MapPin,
  Pause,
  Play,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { api } from "../api/client";

const stories = [
  {
    title: "Meet Mr. Vix.",
    description:
      "He needs a fairly used laptop before semester. He searches WhatsApp groups, asks around, and keeps wondering: “Can I trust this seller?”",
    icon: Search,
    accent: "from-orange-500 to-amber-400",
    visual: (
      <div className="relative h-64 w-full">
        <div className="absolute left-1/2 top-1/2 w-[82%] -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Search className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="h-2.5 w-24 rounded-full bg-slate-200" />
                <div className="mt-2 h-2 w-16 rounded-full bg-slate-100" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <Laptop className="h-7 w-7 text-slate-600" />
                <div className="flex-1">
                  <div className="h-2.5 w-32 rounded-full bg-slate-200" />
                  <div className="mt-2 h-2 w-20 rounded-full bg-slate-100" />
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <Users className="h-7 w-7 text-slate-500" />
                <div className="flex-1">
                  <div className="h-2.5 w-28 rounded-full bg-slate-200" />
                  <div className="mt-2 h-2 w-24 rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -right-4 -top-5 flex h-14 w-14 animate-bounce items-center justify-center rounded-2xl bg-orange-500 text-white shadow-xl">
            <Clock3 className="h-6 w-6" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "With ADY Marketplace, he wouldn't have to.",
    description:
      "ADY brings AKSU buyers and sellers together. Find verified sellers, compare options, pay securely, and confirm your item.",
    icon: ShieldCheck,
    accent: "from-emerald-500 to-teal-400",
    visual: (
      <div className="relative h-64 w-full">
        <div className="absolute left-1/2 top-1/2 w-[82%] -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-2xl backdrop-blur">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <div className="h-2.5 w-24 rounded-full bg-slate-200" />
                  <div className="mt-2 h-2 w-16 rounded-full bg-slate-100" />
                </div>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Laptop className="h-6 w-6 text-slate-600" />
                </div>

                <div className="flex-1">
                  <div className="h-2.5 w-28 rounded-full bg-slate-200" />
                  <div className="mt-2 h-2 w-16 rounded-full bg-slate-100" />
                </div>

                <div className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  VERIFIED
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-4 -left-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-xl">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Whatever you're looking for, there's a better way to find it.",
    description:
      "Books, electronics, furniture, fashion, services, and more. One campus marketplace built around buying, selling, and connecting.",
    icon: Store,
    accent: "from-orange-500 to-rose-400",
    visual: (
      <div className="relative h-64 w-full">
        <div className="absolute left-1/2 top-1/2 grid w-[82%] -translate-x-1/2 -translate-y-1/2 grid-cols-3 gap-3">
          {[
            { icon: BookOpen, label: "Books" },
            { icon: Laptop, label: "Electronics" },
            { icon: Store, label: "Furniture" },
            { icon: ShoppingBag, label: "Fashion" },
            { icon: MapPin, label: "Services" },
            { icon: Sparkles, label: "More" },
          ].map(({ icon: Icon, label }, index) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center rounded-2xl border border-white/80 bg-white/90 p-4 shadow-lg backdrop-blur transition-transform duration-300 hover:-translate-y-1"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              <Icon className="mb-2 h-6 w-6 text-orange-500" />
              <span className="text-[11px] font-medium text-slate-600">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export default function Login() {
  const navigate = useNavigate();

  const [activeStory, setActiveStory] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /*
   * Auto-advance every 5 seconds.
   *
   * The timer completely stops while the user has paused
   * the story so they can read comfortably.
   */
  useEffect(() => {
    if (isPaused) return;

    const timer = setTimeout(() => {
      setActiveStory((current) => (current + 1) % stories.length);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeStory, isPaused]);

  function togglePause() {
    setIsPaused((current) => !current);
  }

  function previousStory(e) {
    e.stopPropagation();

    setIsPaused(false);

    setActiveStory(
      (current) => (current - 1 + stories.length) % stories.length
    );
  }

  function nextStory(e) {
    e.stopPropagation();

    setIsPaused(false);

    setActiveStory((current) => (current + 1) % stories.length);
  }

  function selectStory(index) {
    setIsPaused(false);
    setActiveStory(index);
  }

  function update(field) {
    return (e) => {
      setForm((current) => ({
        ...current,
        [field]: e.target.value,
      }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await api.login(form);

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      navigate("/");
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const story = stories[activeStory];
  const StoryIcon = story.icon;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* STORY PANEL */}
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50 lg:block">
          {/* Decorative background elements */}
          <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />

          <div className="relative flex min-h-screen flex-col justify-between p-10 xl:p-14">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/ady-logo.svg"
                alt="ADY Marketplace"
                className="h-11 w-11 object-contain"
              />

              <div>
                <p className="text-lg font-bold tracking-tight text-slate-900">
                  ADY Marketplace
                </p>
                <p className="text-xs text-slate-500">AKSU Campus</p>
              </div>
            </div>

            {/* Story */}
            <div
              className="relative flex cursor-pointer flex-1 items-center py-10"
              onClick={togglePause}
              onTouchStart={togglePause}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePause();
                }
              }}
              aria-label={
                isPaused
                  ? "Story paused. Tap to continue."
                  : "Story playing. Tap to pause."
              }
            >
              <div className="w-full">
                {/* Story illustration */}
                <div
                  key={`visual-${activeStory}`}
                  className="animate-[fadeUp_500ms_ease-out]"
                >
                  {story.visual}
                </div>

                {/* Text */}
                <div
                  key={`text-${activeStory}`}
                  className="mx-auto max-w-xl animate-[fadeUp_500ms_ease-out]"
                >
                  <div className="mb-5 flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${story.accent} text-white shadow-lg`}
                    >
                      <StoryIcon className="h-5 w-5" />
                    </div>

                    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
                      ADY Marketplace
                    </span>
                  </div>

                  <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-slate-900 xl:text-5xl">
                    {story.title}
                  </h2>

                  <p className="mt-5 max-w-lg text-base leading-7 text-slate-600">
                    {story.description}
                  </p>
                </div>

                {/* Pause hint */}
                <div className="mt-7 flex justify-center">
                  <div
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-sm backdrop-blur transition-all duration-300 ${
                      isPaused
                        ? "border-orange-200 bg-orange-50 text-orange-700"
                        : "border-slate-200 bg-white/80 text-slate-500"
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Paused · Tap to continue
                      </>
                    ) : (
                      <>
                        <Pause className="h-3.5 w-3.5" />
                        Tap to pause
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Story controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previousStory}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600"
                  aria-label="Previous story"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={nextStory}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600"
                  aria-label="Next story"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {stories.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      selectStory(index);
                    }}
                    aria-label={`Go to story ${index + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeStory === index
                        ? "w-8 bg-orange-500"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>

              <div className="text-xs font-medium text-slate-400">
                {activeStory + 1} / {stories.length}
              </div>
            </div>
          </div>
        </section>

        {/* LOGIN PANEL */}
        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <img
                src="/ady-logo.svg"
                alt="ADY Marketplace"
                className="h-11 w-11 object-contain"
              />

              <div>
                <p className="text-lg font-bold tracking-tight text-slate-900">
                  ADY Marketplace
                </p>
                <p className="text-xs text-slate-500">AKSU Campus</p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
                <Store className="h-6 w-6 text-orange-600" />
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Log in to continue buying, selling, and connecting on campus.
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-orange-600 transition hover:text-orange-700"
                  >
                    Forgot password?
                  </Link>
                </div>

                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={update("password")}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Log in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">OR</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-orange-600 transition hover:text-orange-700"
              >
                Create one
              </Link>
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              Built for safer campus buying and selling
            </div>
          </div>
        </section>
      </div>

      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
}