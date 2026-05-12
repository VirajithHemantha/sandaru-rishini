import React, { useState, ReactNode, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useMotionValue,
  useTransform,
} from "motion/react";
import {
  HelpCircle,
  MapPin,
  Clock,
  Heart,
  CheckCircle2,
  Flower2,
  Volume2,
  VolumeX,
  Sparkles,
  MessageCircle,
} from "lucide-react";

// FlipCard Component with 3D Tilt Effect + Premium Mobile Tap Hint
function FlipCard({
  front,
  back,
  className,
  containerClassName,
  rounded = "rounded-[2rem]",
  ...motionProps
}: {
  front: ReactNode;
  back: ReactNode;
  className?: string;
  containerClassName?: string;
  rounded?: string;
  [key: string]: any;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const springConfig = { damping: 20, stiffness: 300 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  useEffect(() => {
    const mql = window.matchMedia("(hover: none) and (pointer: coarse)");

    const update = () => setIsTouchDevice(mql.matches);
    update();

    // Safari iOS compatibility
    if (typeof mql.addEventListener === "function") mql.addEventListener("change", update);
    else (mql as any).addListener?.(update);

    return () => {
      if (typeof mql.removeEventListener === "function") mql.removeEventListener("change", update);
      else (mql as any).removeListener?.(update);
    };
  }, []);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
    setIsFlipped(false);
  }

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement | null;
    if (target?.closest("[data-no-flip]")) return;

    setIsFlipped((prev) => !prev);
  }

  return (
    <motion.div
      {...motionProps}
      ref={cardRef}
      className={`perspective-1000 cursor-pointer relative ${containerClassName || ""}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        if (!isTouchDevice) setIsFlipped(true);
      }}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      style={{
        rotateX: isFlipped ? 0 : springRotateX,
        rotateY: isFlipped ? 0 : springRotateY,
      }}
    >
      <motion.div
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className={`w-full h-full transform-style-3d relative ${className || ""}`}
        style={{ WebkitTransformStyle: "preserve-3d" }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 backface-hidden flip-face w-full h-full ${rounded} overflow-hidden shadow-2xl border border-white/40 ring-1 ring-black/5`}
          style={{ transform: "rotateY(0deg) translateZ(1px)", WebkitTransform: "rotateY(0deg) translateZ(1px)" }}
        >
          {front}
          <div className="absolute top-3 left-3 w-6 h-6 border-t border-l border-white/30 rounded-tl-lg" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b border-r border-white/30 rounded-br-lg" />
        </div>

        {/* Back */}
        <div
          style={{ transform: "rotateY(180deg) translateZ(1px)", WebkitTransform: "rotateY(180deg) translateZ(1px)" }}
          className={`absolute inset-0 backface-hidden flip-face w-full h-full bg-paper border border-sage/20 ${rounded} flex flex-col justify-center items-center text-center p-3 md:p-8 shadow-2xl overflow-hidden`}
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />
          <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-sage/10 rounded-tl-xl" />
          <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-sage/10 rounded-br-xl" />
          <div className="relative z-10 w-full h-full flex flex-col py-4 overflow-y-auto overflow-x-hidden ios-scroll">{back}</div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isTouchDevice && !isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.4 } }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none z-50"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex items-center gap-2 bg-black/35 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/25 shadow-xl"
            >
              <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
                <motion.span
                  animate={{ scale: [1, 2.2], opacity: [0.7, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeOut" }}
                  className="absolute inset-0 rounded-full bg-white/70"
                />
                <span className="relative w-2 h-2 rounded-full bg-white shadow-sm" />
              </span>
              <span
                className="text-white text-[9px] uppercase tracking-[0.2em] font-bold whitespace-nowrap"
                style={{ fontFamily: "Inter, sans-serif", letterSpacing: "0.18em" }}
              >
                Tap to reveal
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function RealisticPetal({ size = 20, className = "" }: { size?: number; className?: string }) {
  const organicPetal = "M15 30C15 30 0 25 0 15C0 5 10 0 15 0C20 0 30 5 30 15C30 25 15 30 15 30Z";

  return (
    <motion.div
      animate={{
        rotateX: [0, 45, -45, 0],
        rotateY: [0, 180, 360],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ width: size, height: size }}
      className={className}
    >
      <svg width="100%" height="100%" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="petalGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9D7BB0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#7D5B90" stopOpacity="0.65" />
          </radialGradient>
        </defs>
        <path
          d={organicPetal}
          fill="url(#petalGrad)"
          style={{ filter: "drop-shadow(0px 2px 2px rgba(0,0,0,0.05))" }}
        />
      </svg>
    </motion.div>
  );
}

function Countdown() {
  const targetDate = new Date("2027-01-02T19:00:00").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const items = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  return (
    <div className="flex justify-center gap-2 sm:gap-6 md:gap-12 py-10 md:py-16 px-1">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.12, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          {/* Arch Container */}
          <div className="relative w-[82px] sm:w-[95px] md:w-[145px] aspect-[2/3] bg-white rounded-t-full rounded-b-[2rem] shadow-[0_15px_45px_-10px_rgba(0,0,0,0.08)] flex flex-col items-center justify-center border border-umber/5 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-umber/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <span className="serif text-4xl sm:text-5xl md:text-7xl font-bold text-umber/90 tabular-nums drop-shadow-sm mt-[-10px] md:mt-[-20px]">
              {String(item.value).padStart(2, "0")}
            </span>

            <div className="mt-4 md:mt-8 px-3 md:px-5 py-1.5 md:py-2.5 bg-paper/60 backdrop-blur-sm rounded-full border border-umber/10 shadow-sm">
              <span className="text-[8px] md:text-[10px] uppercase tracking-[0.25em] font-bold text-umber/50">
                {item.label}
              </span>
            </div>

            <div className="absolute bottom-4 text-umber/20 group-hover:text-umber/40 transition-colors">
              <Sparkles size={12} className="md:w-4 md:h-4" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

type Attendance = "yes" | "no";
type PartyType = "individual" | "family";
type MealPreference = "veg" | "non-veg";

type GuestEntry = {
  name: string;
  meal: MealPreference;
};

function RSVPForm() {
  const endpoint = "https://script.google.com/macros/s/AKfycbzNTEBAHz6dwBesgZN1ZMzbbtyo2pefiZEkj1BM770pUwUWlFxAPnusvRxzQB0z2J5xMQ/exec";

  const [attendance, setAttendance] = useState<Attendance>("yes");
  const [partyType, setPartyType] = useState<PartyType>("individual");
  const [guestCount, setGuestCount] = useState<number>(1);
  const [guests, setGuests] = useState<GuestEntry[]>([{ name: "", meal: "non-veg" }]);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isAttending = attendance === "yes";
  const effectiveGuestCount = partyType === "family" ? Math.max(2, guestCount) : 1;

  useEffect(() => {
    if (partyType === "individual") {
      setGuestCount(1);
      setGuests((prev) => [prev[0] ?? { name: "", meal: "non-veg" }]);
      return;
    }

    setGuestCount((c) => (c < 2 ? 2 : c));
  }, [partyType]);

  useEffect(() => {
    const desiredCount = partyType === "family" ? Math.max(2, guestCount) : 1;
    setGuests((prev) => {
      if (prev.length === desiredCount) return prev;
      const next = prev.slice(0, desiredCount);
      while (next.length < desiredCount) next.push({ name: "", meal: "non-veg" });
      return next;
    });
  }, [guestCount, partyType]);

  function updateGuest(index: number, patch: Partial<GuestEntry>) {
    setGuests((prev) => prev.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  }

  function validate(): string | null {
    const primaryName = guests[0]?.name?.trim();
    if (!primaryName) return "Please enter your name.";
    if (attendance === "no") return null;

    const missingName = guests.some((g) => !g.name.trim());
    if (missingName) return "Please enter all guest names.";

    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    if (!endpoint) {
      setErrorMessage("RSVP saving is not configured yet (missing VITE_RSVP_ENDPOINT).");
      return;
    }

    const payload = {
      attendance,
      partyType,
      guestCount: isAttending ? effectiveGuestCount : 0,
      guests: isAttending ? guests : [guests[0]],
      submittedAt: new Date().toISOString(),
    };

    setSubmitting(true);
    try {
      // Try JSON request first (works if endpoint supports CORS).
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSuccessMessage("RSVP saved. Thank you!");
    } catch {
      try {
        // Fallback for Apps Script deployments without CORS.
        const fd = new FormData();
        fd.append("payload", JSON.stringify(payload));
        await fetch(endpoint, { method: "POST", mode: "no-cors", body: fd });
        setSuccessMessage("RSVP submitted. Thank you!");
      } catch {
        setErrorMessage("Could not submit RSVP. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div data-no-flip className="w-full cursor-auto">
      <CheckCircle2 size={24} className="text-umber mb-2 md:mb-4 mx-auto opacity-80 md:w-8 md:h-8" />
      <h4 className="serif text-3xl md:text-4xl text-umber font-bold mb-2 md:mb-3 text-center">RSVP</h4>
      <p className="text-[12px] md:text-sm text-umber/80 font-bold uppercase tracking-widest mb-4 md:mb-6 text-center leading-relaxed">
        Please let us know by
        <br />
        25.12.2026
      </p>

      <form onSubmit={submit} className="space-y-4 md:space-y-4 px-1 md:px-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            data-no-flip
            onClick={() => setAttendance("yes")}
            className={`py-3 md:py-2.5 rounded-xl text-[11px] md:text-sm uppercase tracking-widest font-bold border transition-colors ${attendance === "yes" ? "bg-umber text-white border-umber" : "bg-white/40 text-umber/80 border-umber/30"
              }`}
          >
            Attending
          </button>
          <button
            type="button"
            data-no-flip
            onClick={() => setAttendance("no")}
            className={`py-3 md:py-2.5 rounded-xl text-[11px] md:text-sm uppercase tracking-widest font-bold border transition-colors ${attendance === "no" ? "bg-zinc-800 text-white border-zinc-800" : "bg-white/40 text-zinc-700 border-zinc-300/60"
              }`}
          >
            Not Attending
          </button>
        </div>

        <div className={`grid grid-cols-2 gap-2 ${!isAttending ? "opacity-60 pointer-events-none" : ""}`}>
          <button
            type="button"
            data-no-flip
            onClick={() => setPartyType("individual")}
            className={`py-3 md:py-2 rounded-xl text-[11px] md:text-sm uppercase tracking-widest font-bold border transition-colors ${partyType === "individual" ? "bg-umber/90 text-white border-umber" : "bg-white/40 text-umber/80 border-umber/30"
              }`}
          >
            Individual
          </button>
          <button
            type="button"
            data-no-flip
            onClick={() => setPartyType("family")}
            className={`py-3 md:py-2 rounded-xl text-[11px] md:text-sm uppercase tracking-widest font-bold border transition-colors ${partyType === "family" ? "bg-umber/90 text-white border-umber" : "bg-white/40 text-umber/80 border-umber/30"
              }`}
          >
            Family
          </button>
        </div>

        {isAttending && partyType === "family" && (
          <div className="flex items-center justify-between gap-3">
            <label className="text-[10px] md:text-xs uppercase tracking-widest font-bold text-zinc-600">Family Count</label>
            <input
              data-no-flip
              type="number"
              min={2}
              max={12}
              value={effectiveGuestCount}
              onChange={(ev) => setGuestCount(Number(ev.target.value || 2))}
              className="w-28 rounded-xl border border-sage/20 bg-white/60 px-3 py-2.5 text-xs text-zinc-700 outline-none"
            />
          </div>
        )}

        <div className="space-y-2">
          {(isAttending ? guests : [guests[0]]).map((guest, idx) => (
            <div key={idx} className="grid grid-cols-1 md:grid-cols-[1fr_140px] gap-2">
              <input
                data-no-flip
                value={guest?.name ?? ""}
                onChange={(ev) => updateGuest(idx, { name: ev.target.value })}
                placeholder={
                  isAttending
                    ? partyType === "family"
                      ? `Guest ${idx + 1} name`
                      : "Your name"
                    : "Your name"
                }
                className="w-full rounded-xl border border-sage/20 bg-white/60 px-3 py-2.5 text-xs text-zinc-700 outline-none"
              />

              <select
                data-no-flip
                disabled={!isAttending}
                value={guest?.meal ?? "non-veg"}
                onChange={(ev) => updateGuest(idx, { meal: ev.target.value as MealPreference })}
                className={`w-full rounded-xl border border-sage/20 bg-white/60 px-3 py-2.5 text-xs text-zinc-700 outline-none ${!isAttending ? "opacity-60" : ""
                  }`}
              >
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
              </select>
            </div>
          ))}
        </div>

        {errorMessage && <p className="text-[10px] md:text-xs text-red-700 font-semibold">{errorMessage}</p>}
        {successMessage && <p className="text-[10px] md:text-xs text-sage font-bold">{successMessage}</p>}

        <button
          type="submit"
          data-no-flip
          disabled={submitting}
          className="w-full bg-umber text-white py-3 md:py-3 rounded-xl text-[12px] md:text-sm uppercase tracking-widest font-bold disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit RSVP"}
        </button>


      </form>
    </div>
  );
}

function WishesForm() {
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const endpoint = import.meta.env.VITE_RSVP_ENDPOINT;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !wish.trim()) return;

    setSubmitting(true);
    const payload = {
      type: "wish",
      name: name.trim(),
      wish: wish.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      if (endpoint) {
        await fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(payload),
        });
      }
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 rounded-full bg-sage/10 flex items-center justify-center"
        >
          <Sparkles className="text-sage" size={32} />
        </motion.div>
        <h4 className="serif text-2xl text-umber font-bold">Thank You!</h4>
        <p className="text-sm text-umber/80 leading-relaxed">
          Your warm wishes have been received and mean the world to us.
        </p>
      </div>
    );
  }

  return (
    <div data-no-flip className="w-full h-full flex flex-col p-4 md:p-6 cursor-auto">
      <h4 className="serif text-3xl text-umber font-bold mb-4 text-center">Send a Wish</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          data-no-flip
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-sage/20 bg-white/60 px-4 py-3 text-xs md:text-sm outline-none focus:border-sage/40 transition-colors"
          required
        />
        <textarea
          data-no-flip
          placeholder="Your beautiful message..."
          value={wish}
          onChange={(e) => setWish(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-sage/20 bg-white/60 px-4 py-3 text-xs md:text-sm outline-none focus:border-sage/40 transition-colors resize-none"
          required
        />
        <button
          type="submit"
          data-no-flip
          disabled={submitting || !name || !wish}
          className="w-full bg-umber text-white py-3 rounded-xl text-[12px] md:text-sm uppercase tracking-widest font-bold disabled:opacity-50 transition-all hover:bg-umber/90 shadow-lg"
        >
          {submitting ? "Sending..." : "Send Wish"}
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [isFlapOpen, setIsFlapOpen] = useState(false);
  const [isOpened, setIsOpened] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const updateSize = () => setIsSmallScreen(mediaQuery.matches);
    updateSize();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateSize);
      return () => mediaQuery.removeEventListener("change", updateSize);
    }

    // iOS Safari < 14
    mediaQuery.addListener(updateSize);
    return () => mediaQuery.removeListener(updateSize);
  }, []);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setPrefersReducedMotion(motionQuery.matches);
    updateMotion();
    if (typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", updateMotion);
      return () => motionQuery.removeEventListener("change", updateMotion);
    }
    motionQuery.addListener(updateMotion);
    return () => motionQuery.removeListener(updateMotion);
  }, []);

  const isIOS =
    typeof navigator !== "undefined" &&
    (/iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1));

  const reduceEffects = prefersReducedMotion || isIOS;

  const handleOpen = () => {
    setIsFlapOpen(true);
    if (audioRef.current) {
      audioRef.current.muted = false;
      audioRef.current.play().catch(() => {
        // Fallback for extremely strict browsers
      });
    }
    setTimeout(() => {
      setIsOpened(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 1200);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = isMuted;

    if (isMuted) {
      audio.pause();
      return;
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        // iOS/Safari may block playback until a user gesture; the button tap will retry.
      });
    }
  }, [isMuted]);

  return (
    <div
      className="min-h-screen bg-paper text-zinc-800 selection:bg-sage/20 overflow-x-hidden relative"
    >
      <audio ref={audioRef} src="/Alex warren - Ordinary.mp3" loop preload="auto" autoPlay />

      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-sage origin-left z-[1000]" style={{ scaleX }} />

      <motion.button
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsMuted((m) => !m)}
        className="fixed bottom-6 right-6 z-[500] w-12 h-12 rounded-full bg-sage text-white shadow-2xl flex items-center justify-center backdrop-blur-md border border-white/20"
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="animate-pulse" />}
      </motion.button>

      <AnimatePresence>
        {!isOpened && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, delay: 0.5 } }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden"
          >
            <div className="absolute inset-0 z-0 pointer-events-none">
              <img src="/1.webp" alt="First Page Background" className="w-full h-full object-cover" fetchpriority="high" decoding="sync" />
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              className="absolute top-12 md:top-24 left-0 right-0 text-center z-10 pointer-events-none"
            >
              <h1 className="serif text-4xl md:text-6xl text-umber font-bold md:font-light tracking-[0.2em] drop-shadow-md">
                Sandaru & Rishini
              </h1>
              <p className="mt-3 text-xs md:text-sm uppercase tracking-[0.6em] text-umber/80 font-bold drop-shadow-sm">
                02 January 2027
              </p>
            </motion.div>

            {!reduceEffects && (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] md:w-[90vw] md:h-[90vw] rounded-full border-2 border-sage/10 border-dashed pointer-events-none z-0 opacity-50"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[70vw] md:h-[70vw] rounded-full border border-sage/10 pointer-events-none z-0 opacity-40 flex items-center justify-center p-8"
                >
                  <div className="w-full h-full rounded-full border-[0.5px] border-sage/5" />
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute w-[80vw] md:w-[600px] h-[80vw] md:h-[600px] bg-sage/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none z-0"
                />
              </>
            )}

            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
              <motion.div
                animate={{
                  x: ["-10%", "10%", "-10%"],
                  y: ["-5%", "5%", "-5%"],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-[30%] -left-[20%] w-[140%] h-[140%] rounded-full bg-[radial-gradient(circle,rgba(196,113,74,0.45)_0%,transparent_60%)] blur-3xl"
              />
              <motion.div
                animate={{
                  x: ["10%", "-10%", "10%"],
                  y: ["5%", "-5%", "5%"],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-[30%] -right-[20%] w-[140%] h-[140%] rounded-full bg-[radial-gradient(circle,rgba(156,132,112,0.4)_0%,transparent_60%)] blur-3xl"
              />

              {!reduceEffects &&
                [...Array(40)].map((_, i) => (
                  <motion.div
                    key={`dust-${i}`}
                    className="absolute pointer-events-none"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -Math.random() * 500 - 300],
                      x: [0, (Math.random() - 0.5) * 200],
                      rotate: [0, Math.random() * 360],
                      opacity: [0, Math.random() * 0.5 + 0.2, 0],
                      scale: [0.5, Math.random() * 1 + 0.5, 0.5],
                    }}
                    transition={{
                      duration: 10 + Math.random() * 20,
                      repeat: Infinity,
                      delay: Math.random() * 10,
                      ease: "easeInOut",
                    }}
                  >
                    {i % 4 === 0 ? (
                      <Flower2 className="text-sage/20 w-4 h-4 md:w-6 md:h-6" />
                    ) : (
                      <div
                        className="rounded-full shadow-[0_0_15px_rgba(196,113,74,0.4)]"
                        style={{
                          backgroundColor: i % 2 === 0 ? "#C4714A" : "#A84C2C",
                          width: Math.random() * 6 + 2 + "px",
                          height: Math.random() * 6 + 2 + "px",
                          filter: `blur(${Math.random() * 1}px)`,
                        }}
                      />
                    )}
                  </motion.div>
                ))}

              {!reduceEffects &&
                [...Array(20)].map((_, i) => {
                  const isHeart = i % 2 === 0;
                  const size = isHeart ? Math.random() * 20 + 10 : Math.random() * 25 + 15;
                  return (
                    <motion.div
                      key={`loading-falling-${i}`}
                      className="absolute pointer-events-none z-10"
                      initial={{ top: "-10%", left: `${Math.random() * 100}%`, rotate: 0, opacity: 0 }}
                      animate={{
                        top: "110%",
                        left: [
                          `${Math.random() * 100}%`,
                          `${Math.random() * 100 + (Math.random() - 0.5) * 20}%`,
                          `${Math.random() * 100}%`,
                        ],
                        rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
                        opacity: [0, 0.6, 0],
                      }}
                      transition={{
                        duration: 15 + Math.random() * 15,
                        repeat: Infinity,
                        delay: Math.random() * 10,
                        ease: "linear",
                      }}
                    >
                      {isHeart ? (
                        <Heart className="text-sage" fill="currentColor" size={size} />
                      ) : (
                        <RealisticPetal size={size} />
                      )}
                    </motion.div>
                  );
                })}

              {!reduceEffects &&
                [...Array(12)].map((_, i) => (
                  <motion.div
                    key={`bokeh-${i}`}
                    className="absolute rounded-full mix-blend-soft-light"
                    style={{
                      backgroundColor: i % 2 === 0 ? "#9C8470" : "#F5EFE0",
                      opacity: 0.3,
                      width: Math.random() * 150 + 100 + "px",
                      height: Math.random() * 150 + 100 + "px",
                      left: `${Math.random() * 100}%`,
                      bottom: `-20%`,
                      filter: `blur(${Math.random() * 20 + 30}px)`,
                    }}
                    animate={{
                      y: [0, -1200],
                      x: [(Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400],
                      opacity: [0, 0.4, 0],
                    }}
                    transition={{
                      duration: 25 + Math.random() * 35,
                      repeat: Infinity,
                      delay: Math.random() * 20,
                      ease: "linear",
                    }}
                  />
                ))}
            </div>

            <motion.div
              layoutId="envelope-box"
              style={{ perspective: 1500 }}
              animate={!reduceEffects && !isFlapOpen ? { y: [0, -10, 0] } : {}}
              transition={!reduceEffects ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
              className="relative w-full max-w-2xl h-80 md:h-[450px] rounded-[2.25rem] shadow-[0_34px_80px_-22px_rgba(0,0,0,0.55)] flex flex-col items-center justify-center z-10 overflow-hidden"
            >
              {/* premium white envelope material */}
              <div className="absolute inset-0 bg-gradient-to-br from-sage/30 via-white/80 to-sage/40" />
              <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />

              <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply">
                <img src="/2.webp" className="w-full h-full object-cover" alt="Watermark" loading="lazy" />
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-umber/5 pointer-events-none" />
              <div className="absolute inset-[10px] rounded-[1.8rem] border border-sage/10 pointer-events-none" />
              <div className="absolute inset-[16px] rounded-[1.55rem] border border-sage/5 pointer-events-none" />
              {!reduceEffects && (
                <motion.div
                  animate={{ opacity: [0.18, 0.32, 0.18], scale: [1, 1.04, 1] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-20 left-1/2 -translate-x-1/2 w-[520px] h-[260px] bg-sage/25 blur-3xl rounded-full pointer-events-none"
                />
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center -mt-28 md:-mt-20 space-y-4 md:space-y-6">
                <span className="serif text-umber/80 text-lg md:text-3xl tracking-[0.4em] md:tracking-[0.6em] uppercase text-center px-4 font-medium">
                  The Invitation
                </span>
                <div className="w-10 md:w-16 h-px bg-sage/20" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-white/5 clip-path-envelope-bottom pointer-events-none rounded-b-[2rem]" />
              <div className="absolute bottom-0 left-0 right-0 h-[65%] bg-gradient-to-t from-umber/35 via-umber/10 to-transparent clip-path-envelope-bottom pointer-events-none rounded-b-[2rem]" />

              <motion.div
                initial={{ rotateX: 0 }}
                animate={{ rotateX: isFlapOpen ? 180 : 0, opacity: isFlapOpen ? 0 : 1 }}
                transition={{ duration: 1, ease: [0.3, 0.1, 0.2, 1] }}
                style={{ transformOrigin: "top", backfaceVisibility: "hidden" }}
                className="absolute top-0 left-0 right-0 h-[55%] drop-shadow-2xl z-20 rounded-t-[2.25rem] clip-path-envelope flex flex-col items-center justify-start overflow-hidden pt-8 pointer-events-none"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-sage/20 to-sage/30" />
                <div className="absolute inset-0 opacity-15 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] pointer-events-none" />

                <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-multiply">
                  <img src="/2.webp" className="w-full h-full object-cover" style={{ objectPosition: "top" }} alt="Watermark" loading="lazy" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-sage/5" />
                <div className="absolute top-0 left-0 right-0 h-px bg-sage/10" />
              </motion.div>

              {!isFlapOpen && (
                <motion.div
                  initial={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 z-30 flex flex-col items-center justify-center cursor-pointer"
                  onClick={handleOpen}
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={!reduceEffects ? { repeat: Infinity, duration: 3, ease: "easeInOut" } : { duration: 0 }}
                    className="flex flex-col items-center gap-4 mt-8 md:mt-12 group"
                  >
                    <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center relative group-hover:scale-105 transition-transform duration-500">
                      <img
                        src="/seal.png"
                        alt="Wax Seal"
                        className="w-full h-full object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.4)]"
                      />
                    </div>

                    <motion.div
                      animate={!reduceEffects ? { y: [0, 5, 0] } : { y: 0 }}
                      transition={!reduceEffects ? { repeat: Infinity, duration: 2, ease: "easeInOut" } : { duration: 0 }}
                    >
                      <p className="serif text-umber/90 tracking-[0.32em] uppercase text-[10px] md:text-xs whitespace-nowrap font-medium drop-shadow-sm">
                        Tap to break seal
                      </p>
                    </motion.div>
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src="/lavender_bg.png" alt="Background" className="w-full h-full object-cover opacity-[0.25] md:opacity-[0.35]" />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/40 via-transparent to-paper/40" />
      </div>

      <motion.main
        initial={false}
        animate={isOpened ? { opacity: 1, y: 0 } : { opacity: 0, y: 100 }}
        transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
        className="max-w-[1600px] mx-auto px-4 pt-2 md:pt-4 pb-10 md:pb-24 flex flex-col gap-6 md:gap-16 relative z-10 min-h-screen"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isOpened ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
          className="text-center space-y-4 md:space-y-8 mt-12 md:mt-24"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isOpened ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 1, duration: 1 }}
            className="flex items-center justify-center gap-4 text-umber/80"
          >
            <div className="h-px w-8 md:w-16 bg-current opacity-30" />
            <p className="text-[9px] md:text-xs uppercase tracking-[0.6em] font-bold">With joy in our hearts</p>
            <div className="h-px w-8 md:w-16 bg-current opacity-30" />
          </motion.div>

          <h1 className="flex flex-col items-center px-2">
            <span className="serif italic text-3xl sm:text-5xl md:text-[8rem] text-umber font-bold leading-tight drop-shadow-sm mb-1 md:mb-6">
              You're Invited!
            </span>
            <span className="serif text-sm sm:text-base md:text-4xl text-umber tracking-[0.15em] md:tracking-[0.3em] uppercase font-bold">
              to the wedding of
            </span>
          </h1>

          <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 md:gap-16 mt-4 md:mt-8 relative w-full px-2">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-32 bg-umber/5 blur-3xl rounded-full" />

            <motion.h2 whileHover={{ scale: 1.05 }} className="script text-[13vw] sm:text-6xl md:text-9xl text-umber font-bold drop-shadow-lg relative z-10 leading-none">
              Sandaru
            </motion.h2>

            <div className="relative flex items-center justify-center shrink-0">
              <div className="h-px w-6 md:w-24 bg-umber/20 hidden md:block" />
              <div className="relative mx-1 md:mx-4">
                <Heart className="text-umber/60 w-5 h-5 sm:w-7 sm:h-7 md:w-10 md:h-10 animate-pulse" fill="currentColor" />
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-umber/20 blur-xl rounded-full"
                />
              </div>
              <div className="h-px w-6 md:w-24 bg-umber/20 hidden md:block" />
            </div>

            <motion.h2 whileHover={{ scale: 1.05 }} className="script text-[13vw] sm:text-6xl md:text-9xl text-umber font-bold drop-shadow-lg relative z-10 leading-none">
              Rishini
            </motion.h2>
          </div>

          <div className="w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-sage/40 to-transparent mx-auto mt-8" />
        </motion.div>

        {/* Updated premium envelope section */}
        <div className="flex justify-center w-full mb-8 mt-24 md:mt-32">
          {!isOpened ? (
            <div className="w-full max-w-3xl relative h-[340px] sm:h-[380px] md:h-[460px]" />
          ) : (
            <motion.div
              layoutId="envelope-box"
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-4xl relative cursor-default"
              style={{
                height: isSmallScreen ? "520px" : "clamp(420px, 52vw, 620px)",
              }}
            >
              {/* ambient depth */}
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.28, 0.45, 0.28] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-6 sm:inset-x-10 top-[24%] h-44 sm:h-52 bg-sage/25 blur-[70px] rounded-full pointer-events-none z-0"
              />
              <div className="absolute inset-x-10 top-[18%] h-20 bg-sage/12 blur-[50px] rounded-full pointer-events-none z-0" />

              {/* floating dust glow */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={`envelope-speck-${i}`}
                    className={`absolute rounded-full ${i % 2 === 0 ? "bg-sand" : "bg-sage"}`}
                    style={{
                      width: `${Math.random() * 6 + 3}px`,
                      height: `${Math.random() * 6 + 3}px`,
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 60 + 8}%`,
                      opacity: 0.12,
                      filter: "blur(1px)",
                    }}
                    animate={{
                      y: [0, -18, 0],
                      x: [0, (Math.random() - 0.5) * 14, 0],
                      opacity: [0.08, 0.2, 0.08],
                    }}
                    transition={{
                      duration: 4 + Math.random() * 4,
                      repeat: Infinity,
                      delay: Math.random() * 3,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              {/* envelope body back */}
              <div className="absolute bottom-0 left-0 right-0 h-[64%] sm:h-[66%] md:h-[68%] rounded-b-[2.5rem] overflow-hidden z-10 shadow-[0_24px_70px_-12px_rgba(61,34,21,0.55)]">
                <div className="absolute inset-0 bg-gradient-to-b from-umber via-rust/35 to-sienna/55" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <img src="/2.webp" className="w-full h-full object-cover object-bottom" alt="Watermark" loading="lazy" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-umber/25" />
                <div className="absolute inset-x-0 top-0 h-[2px] bg-white/8" />
                <div className="absolute inset-x-10 top-3 h-px bg-sand/15" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
                <div className="absolute top-0 bottom-0 left-0 w-px bg-white/8" />
                <div className="absolute top-0 bottom-0 right-0 w-px bg-white/8" />
                <div className="absolute bottom-5 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
                  <div className="w-16 h-px bg-sand/45" />
                  <p className="serif italic text-sand/55 text-[10px] tracking-[0.4em] uppercase">Official Invite · 2026</p>
                  <div className="w-16 h-px bg-sand/45" />
                </div>
              </div>

              {/* opened flap */}
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none overflow-hidden"
                style={{
                  bottom: isSmallScreen ? "62.5%" : "66.2%",
                  height: isSmallScreen ? "33%" : "40%",
                }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-br from-umber/95 via-rust/70 to-sienna/75"
                  style={{
                    clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                  }}
                >
                  <div className="absolute inset-0 opacity-25 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

                  <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <img src="/2.webp" className="w-full h-full object-cover" style={{ objectPosition: "top" }} alt="Watermark" loading="lazy" />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/0 to-transparent" />
                </div>

                <div
                  className="absolute inset-0 bg-gradient-to-b from-sage to-rust"
                  style={{
                    clipPath: "polygon(3% 100%, 50% 10%, 97% 100%)",
                  }}
                >
                  <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/0 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-umber/35 to-transparent" />
              </div>

              {/* invitation card */}
              <motion.div
                initial={{ y: 120, opacity: 0 }}
                animate={{
                  y: isSmallScreen ? -46 : -58,
                  opacity: 1,
                }}
                transition={{ duration: 1.4, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-3 right-3 sm:left-6 sm:right-6 md:left-16 md:right-16 z-20"
                style={{
                  bottom: isSmallScreen ? "30%" : "33%",
                  top: "auto",
                }}
              >
                <div className="absolute -bottom-4 left-6 right-6 h-10 bg-umber/20 blur-xl rounded-full" />

                <div className="relative bg-paper rounded-[1.6rem] md:rounded-[2rem] shadow-[0_-20px_60px_rgba(0,0,0,0.16),0_10px_30px_rgba(0,0,0,0.08)] border border-sand/35 overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-sage/12 blur-3xl rounded-full" />
                    <div className="absolute inset-[10px] border border-taupe/25 rounded-[1.1rem] md:rounded-xl" />
                    <div className="absolute inset-[16px] border border-sage/15 rounded-[0.9rem] md:rounded-lg" />

                    {[
                      ["top-3 left-3", "rotate-0"],
                      ["top-3 right-3", "rotate-90"],
                      ["bottom-3 left-3", "-rotate-90"],
                      ["bottom-3 right-3", "rotate-180"],
                    ].map(([pos, rot], i) => (
                      <div key={i} className={`absolute ${pos} w-7 h-7`}>
                        <svg viewBox="0 0 28 28" fill="none" className={`w-full h-full ${rot} opacity-40`}>
                          <path d="M2 2 C2 2, 14 2, 14 14" stroke="rgb(156 132 112)" strokeWidth="0.8" fill="none" />
                          <path d="M2 2 C8 2, 2 8, 2 14" stroke="rgb(156 132 112)" strokeWidth="0.8" fill="none" />
                          <circle cx="4" cy="4" r="1.2" fill="rgb(196 113 74)" opacity="0.5" />
                          <path d="M6 2 C6 2, 6 6, 10 6" stroke="rgb(196 113 74)" strokeWidth="0.6" fill="none" opacity="0.5" />
                        </svg>
                      </div>
                    ))}

                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ repeat: Infinity, duration: 4.6, delay: 2, ease: "easeInOut" }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/12 to-transparent skew-x-12"
                    />
                  </div>

                  {/* content */}
                  <div className="relative z-10 px-4 pt-4 pb-3 sm:px-6 sm:pt-7 sm:pb-7 md:px-10 md:py-8 flex flex-col items-center text-center gap-0 sm:gap-2 md:gap-3">
                    {/* top ornament */}
                    <div className="flex items-center gap-3 w-full max-w-[240px]">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-taupe/55" />
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                      >
                        <svg viewBox="0 0 16 16" className="w-3 h-3 opacity-50 text-sage" fill="currentColor">
                          <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
                        </svg>
                      </motion.div>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-taupe/55" />
                    </div>





                    <p className="serif mb-2.5 sm:mb-0 text-[11px] sm:text-[12px] md:text-[14px] uppercase tracking-[0.2em] text-taupe/80 font-bold md:font-normal leading-relaxed max-w-[220px] md:max-w-xs">
                      WE INVITE YOU TO CELEBRATE OUR WEDDING
                    </p>

                    {/* couple names */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-4 max-w-full px-2">
                      <span className="script text-[32px] sm:text-[38px] md:text-[48px] font-bold md:font-normal text-sage drop-shadow-sm leading-[1.1]">
                        Sandaru
                      </span>
                      <span className="text-taupe/50 text-sm md:text-xl font-serif">&amp;</span>
                      <span className="script text-[32px] sm:text-[38px] md:text-[48px] font-bold md:font-normal text-sage drop-shadow-sm leading-[1.1]">
                        Rishini
                      </span>
                    </div>

                    {/* date / time / venue */}
                    <div className="flex items-center gap-2 sm:gap-3 text-umber/70 w-full mt-1">
                      <div className="h-px flex-1 bg-sand/45" />
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="serif text-[28px] sm:text-[32px] md:text-4xl text-umber font-bold md:font-medium leading-none">
                          02
                        </span>
                        <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.3em] text-taupe font-bold">
                          JANUARY · SATURDAY
                        </span>
                        <span className="text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-taupe font-bold">
                          7:00 PM · 2027
                        </span>
                        <span className="serif mt-1 block max-w-[220px] px-2 text-[11px] sm:text-[12px] md:text-[13px] uppercase tracking-[0.12em] text-umber/75 text-center leading-snug break-words font-bold md:font-medium">
                          THE MAZE GLASS HOUSE
                        </span>
                      </div>
                      <div className="h-px flex-1 bg-sand/45" />
                    </div>

                    {/* bottom ornament */}
                    <div className="flex items-center gap-3 w-full max-w-[240px]">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent to-taupe/55" />
                      <svg viewBox="0 0 16 16" className="w-3 h-3 opacity-40 text-sage" fill="currentColor">
                        <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" />
                      </svg>
                      <div className="flex-1 h-px bg-gradient-to-l from-transparent to-taupe/55" />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* front flaps */}
              <div className="absolute bottom-0 left-0 right-0 h-[64%] sm:h-[66%] md:h-[68%] z-30 rounded-b-[2.5rem] overflow-hidden pointer-events-none">
                <div
                  className="absolute inset-0 bg-gradient-to-br from-umber via-rust/85 to-sienna/80"
                  style={{
                    clipPath: "polygon(0 0, 50% 55%, 0 100%)",
                  }}
                >
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/6 to-transparent" />
                </div>

                <div
                  className="absolute inset-0 bg-gradient-to-bl from-umber via-rust/85 to-sienna/80"
                  style={{
                    clipPath: "polygon(100% 0, 50% 55%, 100% 100%)",
                  }}
                >
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
                  <div className="absolute inset-0 bg-gradient-to-bl from-white/6 to-transparent" />
                </div>

                <div
                  className="absolute inset-0 bg-umber/25"
                  style={{
                    clipPath: "polygon(45% 50%, 50% 55%, 55% 50%, 50% 48%)",
                  }}
                />

                <div className="absolute top-0 left-0 right-0 h-7 bg-gradient-to-b from-umber/25 to-transparent" />

                <div
                  className="absolute inset-0 opacity-20 pointer-events-none"
                  style={{ clipPath: "polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)" }}
                >
                  <img src="/2.webp" className="w-full h-full object-cover object-bottom" alt="Watermark" loading="lazy" />
                </div>
              </div>
            </motion.div>
          )}
        </div>


        {/* Bento Grid Layout - Flipped Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full h-full col-span-2 lg:col-span-2"
          >
            <div className="w-full h-[220px] md:h-[350px] lg:h-[350px] relative overflow-hidden rounded-[2rem] shadow-2xl border border-white ring-1 ring-black/5">
              <div className="w-full h-full bg-white p-2 md:p-8 flex flex-col items-center justify-center text-center space-y-2 md:space-y-4 relative group">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')] opacity-10 pointer-events-none" />
                <div className="absolute top-4 right-4 text-sage/20">
                  <Flower2 size={40} />
                </div>
                <div className="relative z-10 space-y-2 md:space-y-8 scale-[0.9] md:scale-100">
                  <div className="space-y-1">
                    <span className="serif italic text-[18px] md:text-3xl text-umber/90 font-bold">Our Wedding Date</span>
                    <div className="w-full h-px bg-umber/20" />
                  </div>

                  <div className="flex flex-col items-center">
                    <p className="text-[11px] md:text-sm uppercase tracking-[0.4em] text-umber/80 font-black mb-1 md:mb-2">Saturday</p>
                    <div className="relative inline-block px-6 md:px-8 py-1 md:py-2 border-y border-umber/30">
                      <p className="serif text-6xl md:text-9xl font-bold text-umber leading-none">02</p>
                      <motion.div
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute -top-1 -right-1 text-[#A84C2C]"
                      >
                        <Sparkles size={12} className="md:w-4 md:h-4" />
                      </motion.div>
                    </div>
                    <p className="serif text-lg md:text-3xl font-bold tracking-[0.2em] mt-2 md:mt-3 text-umber">JANUARY</p>
                  </div>

                  <div className="pt-1">
                    <p className="text-[10px] md:text-sm uppercase tracking-[0.4em] md:tracking-[0.5em] font-black text-umber/70">
                      Twenty Twenty Seven
                    </p>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-4 bg-paper clip-path-[polygon(0%_100%,_5%_80%,_10%_100%,_15%_80%,_20%_100%,_25%_80%,_30%_100%,_35%_80%,_40%_100%,_45%_80%,_50%_100%,_55%_80%,_60%_100%,_65%_80%,_70%_100%,_75%_80%,_80%_100%,_85%_80%,_90%_100%,_95%_80%,_100%_100%)] opacity-50" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full h-full col-span-2 lg:col-span-2"
          >
            <FlipCard
              containerClassName="w-full h-[380px] md:h-[350px] lg:h-[350px]"
              front={
                <div className="w-full h-full bg-white p-6 flex flex-col justify-center items-center text-center relative group overflow-hidden">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sage/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-6 -left-6 text-sage/10">
                    <Flower2 size={120} />
                  </div>
                  <div className="relative z-10 space-y-3 md:space-y-6">
                    <div className="flex flex-col items-center gap-1">
                      <p className="serif italic text-2xl md:text-3xl text-umber font-bold group-hover:scale-110 transition-transform">Kindly</p>
                      <h3 className="serif text-4xl md:text-5xl tracking-[0.3em] font-bold text-umber">RSVP</h3>
                    </div>

                    <p className="text-[12px] md:text-sm uppercase tracking-[0.4em] text-umber/80 font-bold mt-1">by 25.12.2026</p>
                  </div>
                </div>
              }
              back={
                <RSVPForm />
              }
            />
          </motion.div>



          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full h-full col-span-2 lg:col-span-2"
          >
            <FlipCard
              containerClassName="w-full h-[300px] md:h-[350px] lg:h-[350px]"
              front={
                <div className="w-full h-full relative group">
                  <img
                    src="/Ballroom-2-768x512.jpg"
                    alt="Earl's Regent Hotel"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500" />
                  <div className="absolute top-6 right-6 md:top-10 md:right-10 bg-white/60 backdrop-blur-md p-4 md:p-8 border border-white/60 rounded-2xl group-hover:bg-white/80 transition-all duration-700 shadow-xl">
                    <p className="serif text-[8px] md:text-xs uppercase tracking-[0.4em] text-sage/80 mb-2 flex items-center gap-2">
                      <span className="w-4 h-px bg-sage/30" />
                      The Location
                    </p>
                    <h3 className="serif text-2xl md:text-5xl text-sage leading-tight drop-shadow-sm font-medium">
                      The Maze
                      <br />
                      Glass House
                    </h3>

                    <motion.button
                      data-no-flip
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.open("https://maps.app.goo.gl/ZVkwHrQe8smsWQrD7", "_blank")}
                      className="mt-3 md:mt-5 px-5 py-2 md:px-7 md:py-3 bg-sage text-white rounded-full text-[9px] md:text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                    >
                      View Map
                    </motion.button>
                  </div>

                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-sage flex items-center gap-3 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/60 shadow-lg">
                    <MapPin className="text-sage animate-bounce" size={16} />
                    <p className="serif text-[10px] md:text-sm tracking-[0.2em] font-bold uppercase">The Maze Glass House</p>
                  </div>
                </div>
              }
              back={
                <>
                  <MapPin size={24} className="text-sage mb-4 md:mb-6 opacity-70 md:w-9 md:h-9" />
                  <h4 className="serif text-2xl md:text-4xl text-sage mb-2 md:mb-4">The Maze Glass House</h4>
                  <p className="text-[10px] md:text-sm text-zinc-500 uppercase tracking-widest leading-loose mb-4 md:mb-6">
                    The Maze Glass House
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open("https://maps.app.goo.gl/ZVkwHrQe8smsWQrD7", "_blank")}
                    className="px-6 py-2 md:px-8 md:py-3 bg-sage text-white rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-colors"
                  >
                    View Map
                  </motion.button>
                </>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="w-full h-full col-span-2 lg:col-span-2"
          >
            <FlipCard
              containerClassName="w-full h-[300px] md:h-[350px] lg:h-[350px]"
              front={
                <div className="w-full h-full relative group overflow-hidden">
                  <img
                    src="/time.png"
                    alt="Timeline"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-20">
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} whileHover={{ scale: 1, opacity: 1 }} className="bg-white/10 backdrop-blur-lg p-6 rounded-full border border-white/20">
                      <Clock size={32} className="text-white" />
                    </motion.div>
                    <p className="serif text-white text-3xl md:text-5xl italic tracking-widest mt-6 drop-shadow-lg">Event Timeline</p>
                    <div className="mt-4 flex gap-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-white/50" />
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-0 bottom-0 left-4 w-px bg-white/20" />
                  <div className="absolute top-0 bottom-0 left-6 w-px bg-white/10" />
                  <div className="absolute top-0 bottom-0 right-4 w-px bg-white/20" />
                  <div className="absolute top-0 bottom-0 right-6 w-px bg-white/10" />
                </div>
              }
              back={
                <div className="w-full h-full flex flex-col justify-center items-center px-4 md:px-8">
                  <Clock size={24} className="text-sage mb-4 md:mb-6 opacity-70 md:w-8 md:h-8" />
                  <h4 className="serif text-2xl md:text-3xl text-sage mb-4 md:mb-8">Timeline</h4>

                  <div className="w-full max-w-sm space-y-4 md:space-y-6 text-left">
                    <div className="flex items-start gap-2 md:gap-4">
                      <span className="serif text-sage font-bold text-[10px] md:text-base w-12 md:w-20 text-right shrink-0 pt-1">7:00 PM</span>
                      <div className="w-px h-full bg-sage/30 relative mt-2 -ml-[1px] md:-ml-2 shrink-0">
                        <div className="absolute top-0 -left-[3px] w-2 h-2 rounded-full bg-sage" />
                      </div>
                      <div>
                        <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Wedding Ceremony</p>
                        <p className="serif text-[10px] md:text-xs italic text-zinc-500">Followed by Reception</p>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
          </motion.div>
        </div>

        {/* Wishes Section */}
        <div className="w-full max-w-4xl mx-auto px-4 mt-10 md:mt-20 mb-4">


          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <FlipCard
              containerClassName="w-full h-[400px] md:h-[450px]"
              front={
                <div className="w-full h-full bg-white flex flex-col items-center justify-center text-center p-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-umber/5" />
                  <div className="relative z-10 space-y-6">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <MessageCircle size={48} className="text-sage mx-auto opacity-70" />
                    </motion.div>
                    <div className="space-y-2">
                      <h3 className="serif text-3xl md:text-4xl text-umber font-bold">Best Wishes</h3>
                      <p className="text-sm text-taupe font-medium tracking-wide uppercase">Share your love & blessings</p>
                    </div>
                    <div className="pt-4">
                      <span className="inline-block px-8 py-3 rounded-full border border-sage/20 text-sage text-xs font-black uppercase tracking-widest group-hover:bg-sage group-hover:text-white transition-all duration-500">
                        Tap to Write
                      </span>
                    </div>
                  </div>
                </div>
              }
              back={<WishesForm />}
            />
          </motion.div>
        </div>

        <div className="w-full max-w-5xl mx-auto px-4 mt-4 md:mt-8 mb-4">
          <div className="text-center mb-12 md:mb-16 space-y-6">
            <div className="flex items-center justify-center gap-4 text-umber/20">
              <div className="h-px w-8 md:w-16 bg-current" />
              <Sparkles size={16} />
              <div className="h-px w-8 md:w-16 bg-current" />
            </div>

            <div className="space-y-1">
              <h2 className="serif text-3xl md:text-5xl lg:text-6xl text-umber tracking-[0.2em] font-bold">WAIT FOR THE</h2>
              <h2 className="script text-5xl md:text-8xl lg:text-[7rem] text-umber/80 leading-none">magic</h2>
            </div>

            <div className="inline-flex items-center gap-4 px-8 py-3 rounded-full border border-umber/10 bg-white/40 backdrop-blur-md shadow-sm">
              <div className="w-1.5 h-1.5 rounded-full bg-umber/30" />
              <span className="text-[10px] md:text-xs uppercase tracking-[0.5em] font-black text-umber/70">Counting Down</span>
              <div className="w-1.5 h-1.5 rounded-full bg-umber/30" />
            </div>
          </div>
          <Countdown />
        </div>

        {/* Premium Moments Gallery */}
        <div className="w-full max-w-5xl mx-auto px-4 mt-4 md:mt-8 mb-4 md:mb-12">
          <div className="text-center mb-8 md:mb-16">
            <p className="text-[12px] md:text-sm uppercase tracking-[0.6em] text-umber/80 font-bold mb-2">Moments</p>
            <div className="h-px w-12 bg-umber/20 mx-auto" />
          </div>

          {/* Customized Moments Layout */}
          <div className="relative w-full flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-24 mt-4 mb-16">
            {/* Left Side: Images */}
            <div className="relative w-[280px] md:w-[400px] aspect-[3/4] flex-shrink-0 mb-12 md:mb-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="relative z-10 w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white group"
              >
                <img
                  alt="Sandaru & Rishini"
                  loading="lazy"
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
                  src="/images/3.jpeg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </motion.div>

              {/* Overlapping Smaller Image */}
              <motion.div
                initial={{ opacity: 0, rotate: 0 }}
                whileInView={{ opacity: 1, rotate: -8 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="absolute -bottom-12 -left-10 md:-bottom-10 md:-left-12 w-[60%] aspect-[4/5] bg-white p-2 rounded-xl shadow-2xl z-20 border border-umber/30"
              >
                <img
                  alt="The Couple"
                  loading="lazy"
                  className="w-full h-full object-cover rounded-lg"
                  src="/images/2.jpeg"
                />
                <div className="absolute -top-3 -right-3 text-umber animate-pulse">
                  <Sparkles size={20} />
                </div>
              </motion.div>
            </div>

            {/* Right Side: Text */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="flex flex-col items-center md:items-start text-center md:text-left space-y-2 md:space-y-6 z-20 w-full"
            >
              <div className="w-full flex justify-center md:justify-start">
                <h3 className="script text-[4.5rem] sm:text-7xl md:text-[8rem] lg:text-[10rem] text-umber leading-none drop-shadow-sm px-2 pt-8 pb-2">
                  Sandaru
                </h3>
              </div>

              <div className="flex items-center gap-4 w-full justify-center md:justify-start px-4 md:pl-6">
                <div className="h-[0.5px] flex-1 max-w-[40px] bg-umber/40"></div>
                <span className="serif text-2xl md:text-6xl text-taupe/60 italic font-light">&amp;</span>
                <div className="h-[0.5px] flex-1 max-w-[40px] bg-umber/40"></div>
              </div>

              <div className="w-full flex justify-center md:justify-start overflow-hidden">
                <h3 className="script text-[4.5rem] sm:text-7xl md:text-[8rem] lg:text-[10rem] text-umber leading-none drop-shadow-sm px-2 pt-2">
                  Rishini
                </h3>
              </div>


            </motion.div>
          </div>

        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={isOpened ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5, delay: 2 }}
          className="text-center pt-12 pb-12 space-y-6"
        >
          <div className="flex items-center justify-center gap-6 text-umber/60">
            <div className="h-px w-16 bg-current" />
            <span className="text-sm uppercase tracking-[0.6em] font-bold">Est. 2027</span>
            <div className="h-px w-16 bg-current" />
          </div>
          <p className="serif italic text-umber/90 text-2xl font-bold max-w-lg mx-auto leading-relaxed px-4">
            "Love brought us together, made more beautiful with your presence"
          </p>
          <p className="serif text-umber/80 text-lg font-bold italic">We can't wait to celebrate with you</p>

        </motion.footer>
      </motion.main>

      {/* Heavy background motion removed for iOS stability */}
    </div>
  );
}