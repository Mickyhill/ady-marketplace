import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  LockKeyhole,
  CircleCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import PasswordInput from "../components/PasswordInput";

const stories = [
  {
    heading: "Meet Mr. Vix.",
    icon: Search,
    accent: "from-orange-500 to-amber-400",
    body: (
      <>
        <p className="text-slate-600">
          He needed a fairly used laptop before the semester started.
        </p>

        <p className="mt-1.5 text-slate-600 sm:mt-3">
          He asked friends. Checked WhatsApp statuses. Searched through
          different groups. He found a few options, but one question kept
          coming back:
        </p>

        <p className="mt-1.5 font-semibold italic text-slate-900 sm:mt-3">
          "Can I trust this seller?"
        </p>

        <p className="mt-1.5 text-slate-600 sm:mt-3">So he kept searching.</p>
      </>
    ),

    visual: (
      <div className="motion-scene scene-search relative h-[330px] w-full overflow-hidden">
        <span className="particle particle-one" />
        <span className="particle particle-two" />
        <span className="particle particle-three" />
        <span className="particle particle-four" />

        <div className="motion-ring ring-one" />
        <div className="motion-ring ring-two" />

        <div className="search-window absolute left-1/2 top-1/2 w-[78%] max-w-[390px] -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_25px_70px_rgba(15,23,42,0.13)] backdrop-blur-xl">
            <div className="mb-5 flex items-center gap-3">
              <div className="search-icon flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-100">
                <Search className="h-5 w-5 text-orange-600" />
              </div>

              <div className="flex-1">
                <div className="search-line h-2.5 w-28 rounded-full bg-slate-200" />
                <div className="search-line-two mt-2 h-2 w-20 rounded-full bg-slate-100" />
              </div>

              <div className="flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-200" />
                <span className="h-2 w-2 rounded-full bg-slate-200" />
                <span className="h-2 w-2 rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="search-result result-one mb-3 flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <Laptop className="h-6 w-6 text-slate-600" />
              </div>

              <div className="flex-1">
                <div className="h-2.5 w-32 rounded-full bg-slate-200" />
                <div className="mt-2 h-2 w-20 rounded-full bg-slate-100" />
              </div>

              <div className="h-6 w-6 rounded-full border-2 border-slate-200" />
            </div>

            <div className="search-result result-two flex items-center gap-3 rounded-2xl bg-slate-50 p-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                <Users className="h-6 w-6 text-slate-500" />
              </div>

              <div className="flex-1">
                <div className="h-2.5 w-28 rounded-full bg-slate-200" />
                <div className="mt-2 h-2 w-24 rounded-full bg-slate-100" />
              </div>

              <div className="h-6 w-6 rounded-full border-2 border-slate-200" />
            </div>

            <div className="scan-line" />
          </div>
        </div>

        <div className="clock-float absolute right-[6%] top-[12%] flex h-16 w-16 items-center justify-center rounded-[20px] bg-orange-500 text-white shadow-[0_15px_35px_rgba(249,115,22,0.3)]">
          <Clock3 className="h-7 w-7" />
          <span className="absolute inset-0 rounded-[20px] border border-orange-300 clock-pulse" />
        </div>

        <div className="question-bubble absolute bottom-[13%] left-[5%] flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-xl">
          <span className="text-xl font-bold">?</span>
        </div>

        <div className="orbit-dot orbit-dot-one" />
        <div className="orbit-dot orbit-dot-two" />
      </div>
    ),
  },

  {
    heading: "With ADY Marketplace, he wouldn't have to.",
    icon: ShieldCheck,
    accent: "from-emerald-500 to-teal-400",

    body: (
      <>
        <p className="text-slate-600">
          ADY Marketplace brings AKSU buyers and sellers together in one
          trusted marketplace.
        </p>

        <ul className="mt-1.5 space-y-0.5 text-slate-600 sm:mt-3 sm:space-y-1">
          <li>Find what you need.</li>
          <li>Shop from verified sellers.</li>
          <li>Compare your options.</li>
          <li>Pay securely.</li>
          <li>Confirm your item before the transaction is completed.</li>
        </ul>
      </>
    ),

    visual: (
      <div className="motion-scene scene-secure relative h-[330px] w-full overflow-hidden">
        <div className="security-ring security-ring-one" />
        <div className="security-ring security-ring-two" />

        <span className="particle secure-particle-one" />
        <span className="particle secure-particle-two" />
        <span className="particle secure-particle-three" />

        <div className="secure-card absolute left-1/2 top-1/2 w-[78%] max-w-[390px] -translate-x-1/2 -translate-y-1/2">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_25px_70px_rgba(15,23,42,0.13)] backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="secure-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <div className="h-2.5 w-28 rounded-full bg-slate-200" />
                  <div className="mt-2 h-2 w-16 rounded-full bg-slate-100" />
                </div>
              </div>

              <div className="verification-badge flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>

            <div className="product-card rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <div className="product-icon flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                  <Laptop className="h-6 w-6 text-slate-600" />
                </div>

                <div className="flex-1">
                  <div className="h-2.5 w-28 rounded-full bg-slate-200" />
                  <div className="mt-2 h-2 w-16 rounded-full bg-slate-100" />
                </div>

                <div className="verified-pill rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                  VERIFIED
                </div>
              </div>
            </div>

            <div className="secure-payment mt-3 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3">
              <LockKeyhole className="h-4 w-4 text-emerald-600" />

              <div className="flex-1">
                <div className="h-2 w-24 rounded-full bg-emerald-200" />
                <div className="mt-1.5 h-1.5 w-16 rounded-full bg-emerald-100" />
              </div>

              <CircleCheck className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bag-float absolute bottom-[9%] left-[5%] flex h-16 w-16 items-center justify-center rounded-[20px] bg-emerald-500 text-white shadow-[0_15px_35px_rgba(16,185,129,0.3)]">
          <ShoppingBag className="h-7 w-7" />
        </div>

        <div className="verification-beam" />

        <span className="success-dot success-one" />
        <span className="success-dot success-two" />
        <span className="success-dot success-three" />
        <span className="success-dot success-four" />
      </div>
    ),
  },

  {
    heading: "Whatever you're looking for, there's a better way to find it.",
    icon: Store,
    accent: "from-orange-500 to-rose-400",

    body: (
      <>
        <p className="text-slate-600">
          Books. Electronics. Furniture. Fashion. Services. And more.
        </p>

        <p className="mt-1.5 text-sm font-semibold text-slate-900 sm:mt-3 sm:text-lg">
          ADY Marketplace
          <br />
          Buy. Sell. CONNECT.
        </p>
      </>
    ),

    visual: (
      <div className="motion-scene scene-categories relative h-[330px] w-full overflow-hidden">
        <div className="category-orbit category-orbit-one" />
        <div className="category-orbit category-orbit-two" />

        <div className="marketplace-center absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[26px] bg-slate-900 text-white shadow-[0_20px_50px_rgba(15,23,42,0.22)]">
          <Store className="h-8 w-8" />
          <span className="center-pulse absolute inset-0 rounded-[26px]" />
        </div>

        {[
          { icon: BookOpen, label: "Books", className: "category-one" },
          { icon: Laptop, label: "Electronics", className: "category-two" },
          { icon: Store, label: "Furniture", className: "category-three" },
          { icon: ShoppingBag, label: "Fashion", className: "category-four" },
          { icon: MapPin, label: "Services", className: "category-five" },
          { icon: Sparkles, label: "More", className: "category-six" },
        ].map(({ icon: Icon, label, className }) => (
          <div
            key={label}
            className={`category-card ${className} absolute flex items-center gap-2 rounded-2xl border border-white/80 bg-white/90 px-3 py-2.5 shadow-lg backdrop-blur-xl`}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50">
              <Icon className="h-4 w-4 text-orange-500" />
            </div>

            <span className="whitespace-nowrap text-[11px] font-semibold text-slate-600">
              {label}
            </span>
          </div>
        ))}

        <span className="connection-line connection-one" />
        <span className="connection-line connection-two" />
        <span className="connection-line connection-three" />
        <span className="connection-line connection-four" />
        <span className="connection-line connection-five" />
        <span className="connection-line connection-six" />
      </div>
    ),
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeStory, setActiveStory] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Login form stays hidden until the intro has played through once (or
  // the user skips it) — the pitch finishes, then the actual action shows.
  const [introDone, setIntroDone] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isPaused || introDone) return;

    const timer = setTimeout(() => {
      if (activeStory === stories.length - 1) {
        setIntroDone(true);
        return;
      }
      setActiveStory((current) => current + 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeStory, isPaused, introDone]);

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

    if (activeStory === stories.length - 1) {
      setIntroDone(true);
      return;
    }
    setActiveStory((current) => current + 1);
  }

  function skipIntro(e) {
    e.stopPropagation();
    setIntroDone(true);
  }

  function selectStory(index) {
    setIsPaused(false);
    setActiveStory(index);
  }

  function update(field) {
    return (e) =>
      setForm((current) => ({
        ...current,
        [field]: e.target.value,
      }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const story = stories[activeStory];
  const StoryIcon = story.icon;

  return (
    // While the intro hasn't finished, this becomes a fixed, full-viewport
    // overlay — it sits on top of the site's navbar/ticker/footer (which
    // render outside this component, in App.jsx) rather than appearing
    // alongside them. Once introDone flips true, it drops back into normal
    // page flow and the rest of the site's chrome becomes visible again.
    <div className={introDone ? "min-h-screen bg-slate-50" : "fixed inset-0 z-50 overflow-y-auto bg-slate-50"}>
      <div className={`grid min-h-screen ${introDone ? "lg:grid-cols-2" : ""}`}>
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-amber-50">
          <div className="ambient-orb ambient-orb-one pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />

          <div className="ambient-orb ambient-orb-two pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />

          <div className="ambient-orb ambient-orb-three pointer-events-none absolute left-[45%] top-[30%] h-40 w-40 rounded-full bg-orange-100/40 blur-3xl" />

          <div className="relative flex flex-col justify-between p-6 py-10 lg:min-h-screen lg:p-10 xl:p-14">
            <div className="motion-logo flex items-center gap-2 lg:gap-3">
              <img
                src="/ady-logo.svg"
                alt="ADY Marketplace"
                className="h-8 w-8 object-contain lg:h-11 lg:w-11"
              />

              <div>
                <p className="text-sm font-bold tracking-tight text-slate-900 lg:text-lg">
                  ADY Marketplace
                </p>

                <p className="text-[10px] text-slate-500 lg:text-xs">AKSU Campus</p>
              </div>
            </div>

            <div
              className={`story-interaction relative flex flex-1 cursor-pointer items-center py-3 lg:py-10 ${
                isPaused ? "story-paused" : ""
              }`}
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
                <div
                  key={`visual-${activeStory}`}
                  className="story-visual-enter"
                >
                  {story.visual}
                </div>

                <div
                  key={`text-${activeStory}`}
                  className="story-text-enter mx-auto max-w-xl"
                >
                  <div className="mb-2 flex items-center gap-3 lg:mb-5">
                    <div
                      className={`story-icon flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br ${story.accent} text-white shadow-lg lg:h-11 lg:w-11 lg:rounded-2xl`}
                    >
                      <StoryIcon className="h-4 w-4 lg:h-5 lg:w-5" />
                    </div>

                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-orange-600 lg:text-sm lg:tracking-[0.18em]">
                      ADY Marketplace
                    </span>
                  </div>

                  <h2 className="max-w-xl text-xl font-bold leading-tight tracking-tight text-slate-900 sm:text-2xl lg:text-4xl xl:text-5xl">
                    {story.heading}
                  </h2>

                  <div className="mt-2 max-w-lg text-xs leading-5 sm:mt-3 sm:text-sm sm:leading-6 lg:mt-5 lg:text-base lg:leading-7">
                    {story.body}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <div
                    className={`pause-hint inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-sm backdrop-blur transition-all duration-300 ${
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

                  {!introDone && (
                    <button
                      type="button"
                      onClick={skipIntro}
                      className="rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-medium text-slate-500 shadow-sm backdrop-blur transition hover:border-orange-200 hover:text-orange-600"
                    >
                      Skip to login
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={previousStory}
                  className="motion-button flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600"
                  aria-label="Previous story"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={nextStory}
                  className="motion-button flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:text-orange-600"
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
                    className={`story-dot relative h-2 overflow-hidden rounded-full transition-all duration-300 ${
                      activeStory === index
                        ? "w-10 bg-orange-100"
                        : "w-2 bg-slate-300 hover:bg-slate-400"
                    }`}
                  >
                    {activeStory === index && !isPaused && (
                      <span className="story-progress absolute inset-y-0 left-0 rounded-full bg-orange-500" />
                    )}

                    {activeStory === index && isPaused && (
                      <span className="absolute inset-0 rounded-full bg-orange-500" />
                    )}
                  </button>
                ))}
              </div>

              <div className="text-xs font-medium text-slate-400">
                {activeStory + 1} / {stories.length}
              </div>
            </div>
          </div>
        </section>

        {introDone && (
        <section className="flex min-h-screen items-center justify-center bg-white px-6 py-10">
          <div className="w-full max-w-md">
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

            <div className="login-heading mb-8">
              <div className="login-icon mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50">
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
              <div className="error-message mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="form-field">
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

              <div className="form-field">
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

                <PasswordInput
                  value={form.password}
                  onChange={update("password")}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-button group flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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
        )}
      </div>

      <style>{`
        .story-interaction {
          --motion-speed: 1;
        }

        .story-interaction.story-paused *,
        .story-interaction.story-paused *::before,
        .story-interaction.story-paused *::after {
          animation-play-state: paused !important;
        }

        .story-visual-enter {
          animation: storyVisualIn 850ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .story-text-enter {
          animation: storyTextIn 700ms cubic-bezier(0.16, 1, 0.3, 1) 120ms both;
        }

        .story-icon {
          animation:
            storyIconIn 650ms cubic-bezier(0.16, 1, 0.3, 1) 180ms both,
            iconFloat 3.8s ease-in-out 1s infinite;
        }

        @keyframes storyVisualIn {
          0% { opacity: 0; transform: translateY(18px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes storyTextIn {
          0% { opacity: 0; transform: translateY(18px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes storyIconIn {
          0% { opacity: 0; transform: scale(0.65) rotate(-8deg); }
          70% { transform: scale(1.08) rotate(2deg); }
          100% { opacity: 1; transform: scale(1) rotate(0); }
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .ambient-orb-one { animation: ambientOne 9s ease-in-out infinite; }
        .ambient-orb-two { animation: ambientTwo 11s ease-in-out infinite; }
        .ambient-orb-three { animation: ambientThree 7s ease-in-out infinite; }

        @keyframes ambientOne {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(35px, 25px) scale(1.08); }
        }

        @keyframes ambientTwo {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-30px, -20px) scale(1.1); }
        }

        @keyframes ambientThree {
          0%, 100% { opacity: 0.25; transform: scale(0.9); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }

        .search-window { animation: searchWindowIn 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .search-icon { animation: searchIconPulse 2.8s ease-in-out 900ms infinite; }
        .search-line { animation: lineReveal 1.2s ease-out 500ms both; }
        .search-line-two { animation: lineReveal 1.2s ease-out 650ms both; }

        .search-result {
          opacity: 0;
          transform: translateX(-18px);
          animation: resultSlide 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .result-one { animation-delay: 650ms; }
        .result-two { animation-delay: 820ms; }

        .clock-float {
          animation:
            clockEnter 750ms cubic-bezier(0.16, 1, 0.3, 1) 700ms both,
            clockFloat 3.4s ease-in-out 1.4s infinite;
        }

        .question-bubble {
          animation:
            questionEnter 650ms cubic-bezier(0.16, 1, 0.3, 1) 1s both,
            questionFloat 3.2s ease-in-out 1.7s infinite;
        }

        .clock-pulse { animation: clockPulse 2s ease-out 1.5s infinite; }

        .scan-line {
          position: absolute;
          left: 12%;
          right: 12%;
          top: 72px;
          height: 2px;
          border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.55), transparent);
          animation: scanSearch 2.8s ease-in-out 1.2s infinite;
        }

        .motion-ring {
          position: absolute;
          border: 1px solid rgba(249, 115, 22, 0.1);
          border-radius: 999px;
          pointer-events: none;
        }

        .ring-one {
          width: 210px; height: 210px; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          animation: ringRotate 12s linear infinite;
        }

        .ring-two {
          width: 300px; height: 300px; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          border-style: dashed;
          animation: ringRotateReverse 18s linear infinite;
        }

        @keyframes searchWindowIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.88) translateY(15px); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1) translateY(0); }
        }

        @keyframes searchIconPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08) rotate(-3deg); }
        }

        @keyframes lineReveal {
          0% { opacity: 0; transform: scaleX(0); transform-origin: left; }
          100% { opacity: 1; transform: scaleX(1); }
        }

        @keyframes resultSlide {
          0% { opacity: 0; transform: translateX(-18px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        @keyframes clockEnter {
          0% { opacity: 0; transform: translateY(-20px) scale(0.7) rotate(-12deg); }
          100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
        }

        @keyframes clockFloat {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -10px; }
        }

        @keyframes questionEnter {
          0% { opacity: 0; transform: translateX(-15px) scale(0.7); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }

        @keyframes questionFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        @keyframes clockPulse {
          0% { opacity: 0.8; transform: scale(1); }
          70%, 100% { opacity: 0; transform: scale(1.55); }
        }

        @keyframes scanSearch {
          0%, 100% { opacity: 0; transform: translateY(0); }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(135px); opacity: 0; }
        }

        @keyframes ringRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes ringRotateReverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }

        .security-ring {
          position: absolute; left: 50%; top: 50%;
          border: 1px solid rgba(16, 185, 129, 0.12);
          border-radius: 999px;
          transform: translate(-50%, -50%);
        }

        .security-ring-one { width: 210px; height: 210px; animation: secureRing 8s linear infinite; }
        .security-ring-two { width: 300px; height: 300px; border-style: dashed; animation: secureRingReverse 13s linear infinite; }

        .secure-card { animation: secureCardIn 900ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .secure-icon { animation: secureIcon 2.8s ease-in-out 1s infinite; }

        .verification-badge {
          animation:
            badgeIn 700ms cubic-bezier(0.16, 1, 0.3, 1) 900ms both,
            badgePulse 2.5s ease-in-out 1.8s infinite;
        }

        .product-card { animation: productReveal 700ms cubic-bezier(0.16, 1, 0.3, 1) 550ms both; }
        .product-icon { animation: productIcon 3s ease-in-out 1.5s infinite; }

        .verified-pill {
          animation:
            verifiedIn 600ms ease-out 1.1s both,
            verifiedPulse 2.4s ease-in-out 2s infinite;
        }

        .secure-payment { animation: paymentIn 700ms cubic-bezier(0.16, 1, 0.3, 1) 850ms both; }

        .bag-float {
          animation:
            bagIn 700ms cubic-bezier(0.16, 1, 0.3, 1) 1s both,
            bagFloat 3.6s ease-in-out 1.6s infinite;
        }

        .verification-beam {
          position: absolute; left: 22%; right: 22%; top: 8%;
          height: 2px; border-radius: 999px;
          background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.65), transparent);
          animation: verificationScan 3s ease-in-out 1.2s infinite;
        }

        .success-dot { position: absolute; width: 7px; height: 7px; border-radius: 999px; background: rgba(16, 185, 129, 0.7); }
        .success-one { left: 19%; top: 24%; animation: successFloat 3s ease-in-out 1s infinite; }
        .success-two { right: 17%; top: 31%; animation: successFloat 3.5s ease-in-out 1.4s infinite reverse; }
        .success-three { left: 25%; bottom: 21%; animation: successFloat 3.2s ease-in-out 1.8s infinite; }
        .success-four { right: 24%; bottom: 20%; animation: successFloat 3.8s ease-in-out 1.2s infinite reverse; }

        @keyframes secureCardIn {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.82) rotateX(8deg); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1) rotateX(0); }
        }

        @keyframes secureIcon {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1) rotate(3deg); }
        }

        @keyframes badgeIn {
          0% { opacity: 0; transform: scale(0); }
          75% { transform: scale(1.15); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.15); }
          50% { box-shadow: 0 0 0 9px rgba(16, 185, 129, 0); }
        }

        @keyframes productReveal {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes productIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes verifiedIn {
          0% { opacity: 0; transform: translateX(8px) scale(0.8); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }

        @keyframes verifiedPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }

        @keyframes paymentIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes bagIn {
          0% { opacity: 0; transform: translateX(-18px) scale(0.75); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }

        @keyframes bagFloat {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -9px; }
        }

        @keyframes verificationScan {
          0% { opacity: 0; transform: translateY(0); }
          20% { opacity: 1; }
          75% { opacity: 1; }
          100% { opacity: 0; transform: translateY(245px); }
        }

        @keyframes secureRing {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes secureRingReverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }

        @keyframes successFloat {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.55; }
          50% { transform: translateY(-12px) scale(1.3); opacity: 1; }
        }

        .category-orbit {
          position: absolute; left: 50%; top: 50%;
          border: 1px solid rgba(249, 115, 22, 0.1);
          border-radius: 999px;
          transform: translate(-50%, -50%);
        }

        .category-orbit-one { width: 190px; height: 190px; animation: orbitRotate 15s linear infinite; }
        .category-orbit-two { width: 285px; height: 285px; border-style: dashed; animation: orbitRotateReverse 22s linear infinite; }

        .marketplace-center {
          animation:
            centerEnter 800ms cubic-bezier(0.16, 1, 0.3, 1) both,
            centerFloat 4s ease-in-out 1s infinite;
        }

        .center-pulse { border: 1px solid rgba(15, 23, 42, 0.12); animation: centerPulse 2.5s ease-out 1.2s infinite; }

        .category-card { opacity: 0; animation: categoryEnter 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards; }

        .category-one { left: 4%; top: 17%; animation-delay: 350ms; }
        .category-two { right: 4%; top: 15%; animation-delay: 500ms; }
        .category-three { right: 1%; top: 48%; animation-delay: 650ms; }
        .category-four { right: 7%; bottom: 11%; animation-delay: 800ms; }
        .category-five { left: 5%; bottom: 11%; animation-delay: 950ms; }
        .category-six { left: 0; top: 48%; animation-delay: 1100ms; }

        .connection-line {
          position: absolute; left: 50%; top: 50%;
          height: 1px; width: 95px;
          transform-origin: left center;
          background: linear-gradient(90deg, rgba(249, 115, 22, 0.18), transparent);
          animation: connectionReveal 900ms ease-out forwards;
          opacity: 0;
        }

        .connection-one { transform: rotate(-140deg); animation-delay: 500ms; }
        .connection-two { transform: rotate(-40deg); animation-delay: 650ms; }
        .connection-three { transform: rotate(0deg); animation-delay: 800ms; }
        .connection-four { transform: rotate(38deg); animation-delay: 950ms; }
        .connection-five { transform: rotate(140deg); animation-delay: 1100ms; }
        .connection-six { transform: rotate(180deg); animation-delay: 1250ms; }

        @keyframes centerEnter {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.55); }
          70% { transform: translate(-50%, -50%) scale(1.08); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        @keyframes centerFloat {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -6px; }
        }

        @keyframes centerPulse {
          0% { opacity: 0.8; transform: scale(1); }
          75%, 100% { opacity: 0; transform: scale(1.5); }
        }

        @keyframes categoryEnter {
          0% { opacity: 0; transform: translateY(15px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes connectionReveal {
          0% { opacity: 0; transform-origin: left; scale: 0 1; }
          100% { opacity: 1; scale: 1 1; }
        }

        @keyframes orbitRotate {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes orbitRotateReverse {
          from { transform: translate(-50%, -50%) rotate(360deg); }
          to { transform: translate(-50%, -50%) rotate(0deg); }
        }

        .particle, .orbit-dot { position: absolute; border-radius: 999px; pointer-events: none; }
        .particle { width: 6px; height: 6px; background: rgba(249, 115, 22, 0.28); }

        .particle-one { left: 12%; top: 20%; animation: particleFloat 4s ease-in-out infinite; }
        .particle-two { right: 15%; top: 30%; width: 4px; height: 4px; animation: particleFloat 5s ease-in-out 1s infinite reverse; }
        .particle-three { left: 18%; bottom: 20%; width: 5px; height: 5px; animation: particleFloat 4.5s ease-in-out 1.5s infinite; }
        .particle-four { right: 20%; bottom: 17%; width: 7px; height: 7px; animation: particleFloat 5.5s ease-in-out 0.5s infinite reverse; }

        .orbit-dot { width: 5px; height: 5px; background: rgba(249, 115, 22, 0.4); }
        .orbit-dot-one { left: 20%; top: 35%; animation: orbitDot 5s linear infinite; }
        .orbit-dot-two { right: 22%; bottom: 31%; animation: orbitDot 7s linear infinite reverse; }

        .secure-particle-one { left: 12%; top: 28%; background: rgba(16, 185, 129, 0.35); animation: particleFloat 4s ease-in-out infinite; }
        .secure-particle-two { right: 14%; top: 22%; background: rgba(16, 185, 129, 0.35); animation: particleFloat 5s ease-in-out 1s infinite reverse; }
        .secure-particle-three { right: 19%; bottom: 19%; background: rgba(16, 185, 129, 0.35); animation: particleFloat 4.5s ease-in-out 0.8s infinite; }

        @keyframes particleFloat {
          0%, 100% { transform: translate(0, 0); opacity: 0.35; }
          50% { transform: translate(8px, -14px); opacity: 0.9; }
        }

        @keyframes orbitDot {
          from { transform: rotate(0deg) translateX(20px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
        }

        .pause-hint { animation: hintAppear 600ms ease-out 900ms both; }

        @keyframes hintAppear {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .story-progress { animation: storyProgress 5s linear forwards; transform-origin: left; }

        @keyframes storyProgress {
          from { width: 0%; }
          to { width: 100%; }
        }

        .login-heading { animation: loginHeadingIn 700ms cubic-bezier(0.16, 1, 0.3, 1) both; }

        .login-icon {
          animation:
            loginIconIn 700ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both,
            loginIconFloat 4s ease-in-out 1s infinite;
        }

        .form-field { animation: formFieldIn 650ms cubic-bezier(0.16, 1, 0.3, 1) both; }
        .form-field:nth-child(1) { animation-delay: 150ms; }
        .form-field:nth-child(2) { animation-delay: 230ms; }

        .login-button { animation: formFieldIn 650ms cubic-bezier(0.16, 1, 0.3, 1) 320ms both; }
        .error-message { animation: errorIn 400ms ease-out both; }

        @keyframes loginHeadingIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes loginIconIn {
          from { opacity: 0; transform: scale(0.7) rotate(-8deg); }
          to { opacity: 1; transform: scale(1) rotate(0); }
        }

        @keyframes loginIconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes formFieldIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes errorIn {
          0% { opacity: 0; transform: translateY(-5px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        @media (max-width: 1023px) {
          .motion-scene { height: 190px; }
          .search-window, .secure-card { width: 82%; }
          .category-card { transform: scale(0.9); }
          .category-one { left: 1%; }
          .category-two { right: 1%; }
          .category-three { right: -1%; }
          .category-four { right: 2%; }
          .category-five { left: 2%; }
          .category-six { left: -2%; }
        }
      `}</style>
    </div>
  );
}
