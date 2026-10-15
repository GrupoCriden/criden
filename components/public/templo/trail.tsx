"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AppWindow,
  Bot,
  ChevronLeft,
  ChevronRight,
  Code,
  MessageCircle,
  Volume2,
  VolumeX,
  CloudLightning,
  CloudRain,
  Snowflake,
  Sparkles,
  Sun,
  Wind,
  X,
} from "lucide-react";
import { LogoReveal } from "@/components/public/logo-reveal";
import { StyleButton } from "@/components/public/site/style-provider";
import { PAINT, keyed } from "./engine";
import { buildHalls, HALL_IDS } from "./halls";
import { mountPetals } from "./petals";
import { WEATHER_ORDER, mountWeather, type Weather } from "./weather";
import { createWeatherAudio, type WeatherAudio } from "./weather-audio";
import { AboutRoom, ContactRoom, ProjectsRoom } from "./rooms";
import { STOP_MEDIA, STOP_MEDIA_MOBILE } from "./trail-scenes";
import type { HallId, TemploData } from "./types";
import "./templo.css";
import "./trail.css";
import "./trail-nav.css";
import "./rooms.css";
import "./weather.css";

// Icono de cada servicio, en el orden de `services` del contenido.
const SERVICE_ICONS = [AppWindow, Code, Bot];

// Icono del botón según el clima actual.
const WEATHER_ICON = {
  clear: Sun,
  wind: Wind,
  rain: CloudRain,
  storm: CloudLightning,
  snow: Snowflake,
  fireflies: Sparkles,
};

const HALL_VISITORS = [
  {
    left: "4%",
    bottom: "9%",
    size: "54px",
    travel: "14vw",
    duration: "31s",
    delay: "-8s",
    clothes: "#483143",
    hair: "#241c28",
  },
  {
    left: "23%",
    bottom: "18%",
    size: "44px",
    travel: "-11vw",
    duration: "27s",
    delay: "-17s",
    clothes: "#344052",
    hair: "#1e2028",
  },
  {
    left: "44%",
    bottom: "7%",
    size: "62px",
    travel: "17vw",
    duration: "35s",
    delay: "-5s",
    clothes: "#654735",
    hair: "#2a2020",
  },
  {
    left: "70%",
    bottom: "20%",
    size: "46px",
    travel: "-13vw",
    duration: "29s",
    delay: "-22s",
    clothes: "#394237",
    hair: "#201f1b",
  },
  {
    left: "88%",
    bottom: "8%",
    size: "58px",
    travel: "-15vw",
    duration: "33s",
    delay: "-12s",
    clothes: "#554050",
    hair: "#25202b",
  },
];

// Nubes en tres planos: las lejanas son pequeñas, tenues y lentas; las cercanas, grandes y rápidas.
// `delay` reparte las entradas para que el cielo no quede vacío entre ciclos.
const CLOUDS = [
  { plane: "far", top: "4%", width: "210px", delay: "-20s", cropX: "8%", cropY: "2%" },
  { plane: "far", top: "8%", width: "245px", delay: "-72s", cropX: "58%", cropY: "8%" },
  { plane: "far", top: "2%", width: "185px", delay: "-128s", cropX: "100%", cropY: "16%" },
  { plane: "middle", top: "12%", width: "330px", delay: "-42s", cropX: "12%", cropY: "34%" },
  { plane: "middle", top: "16%", width: "300px", delay: "-91s", cropX: "72%", cropY: "50%" },
  { plane: "middle", top: "10%", width: "285px", delay: "-139s", cropX: "46%", cropY: "62%" },
  { plane: "near", top: "18%", width: "420px", delay: "-17s", cropX: "0%", cropY: "80%" },
  { plane: "near", top: "21%", width: "475px", delay: "-58s", cropX: "100%", cropY: "100%" },
];

// Templo como recorrido vertical: la marca y el mensaje arriba, y al bajar con el scroll aparecen
// la puerta, las salas y el puente, mientras el cielo pasa del amanecer a la noche.
export default function Trail({ data }: { data: TemploData }) {
  const ref = useRef<HTMLDivElement>(null);
  const { t, lang } = data;
  const hero = t.templo.hero;
  const media = data.media;
  const halls = useMemo(() => buildHalls(data), [data]);
  const [activeHall, setActiveHall] = useState<HallId | null>(null);
  // Sala que ocupa la pantalla mientras se recorre (null en la portada); alimenta la barra de salas.
  const [currentStop, setCurrentStop] = useState<HallId | null>(null);
  const st = t.templo.stations;
  const wx = t.templo.weather;
  const activeRoom = activeHall ? halls.find((hall) => hall.id === activeHall) : null;
  const roomDialogRef = useRef<HTMLDialogElement>(null);
  const roomTriggerRef = useRef<HTMLButtonElement | null>(null);
  const hallAudioRef = useRef<HTMLAudioElement>(null);
  const hallVolumeRef = useRef(0.12);
  const [hallAmbienceOn, setHallAmbienceOn] = useState(false);
  const [hallAmbienceVolume, setHallAmbienceVolume] = useState(0.12);

  // Clima: cada toque del botón pasa al siguiente (despejado, viento, lluvia, tormenta, nieve, luciérnagas).
  const [weather, setWeather] = useState<Weather>("clear");
  const WeatherIcon = WEATHER_ICON[weather];
  const weatherCanvasRef = useRef<HTMLCanvasElement>(null);
  const weatherRef = useRef<ReturnType<typeof mountWeather> | null>(null);
  // Sonido del clima: apagado por defecto; la elección y el volumen se recuerdan en el navegador.
  const audioRef = useRef<WeatherAudio | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [soundVolume, setSoundVolume] = useState(0.3);
  const [soundOpen, setSoundOpen] = useState(false);
  const soundPanelRef = useRef<HTMLDivElement>(null);

  // Lleva a cualquier sala: baja hasta ella y, si `open`, muestra su contenido sin pedir otro clic.
  // Si el cuadro ya está abierto, solo cambia de sala (sin cerrarlo ni volver a tocar botones).
  const goToHall = (id: HallId, open = true) => {
    const root = ref.current;
    const stop = root?.querySelector<HTMLElement>(`#templo-${id}`);
    if (!root || !stop) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (window.location.hash !== `#${stop.id}`) window.history.pushState(null, "", `#${stop.id}`);
    stop.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    const trigger = stop.querySelector<HTMLButtonElement>(".tr-scene-target");
    if (trigger) roomTriggerRef.current = trigger;
    if (roomDialogRef.current?.open) {
      if (id === "nosotros") startHallAmbience();
      else stopHallAmbience();
      setActiveHall(id);
    } else if (open) {
      window.setTimeout(() => activateHall(id), reduced ? 0 : 650);
    } else {
      stop.focus({ preventScroll: true });
    }
  };
  const stepHall = (dir: 1 | -1) => {
    const from = activeHall ?? currentStop;
    const i = from ? HALL_IDS.indexOf(from) : dir === 1 ? -1 : HALL_IDS.length;
    goToHall(HALL_IDS[Math.min(Math.max(i + dir, 0), HALL_IDS.length - 1)], true);
  };
  const startHallAmbience = () => {
    const audio = hallAudioRef.current;
    if (!audio) return;
    audio.volume = hallVolumeRef.current;
    audio.currentTime = 0;
    void audio
      .play()
      .then(() => setHallAmbienceOn(!audio.paused))
      .catch(() => setHallAmbienceOn(false));
  };
  const stopHallAmbience = () => {
    const audio = hallAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setHallAmbienceOn(false);
  };
  const toggleHallAmbience = () => {
    if (hallAmbienceOn) stopHallAmbience();
    else startHallAmbience();
  };
  const changeHallVolume = (volume: number) => {
    hallVolumeRef.current = volume;
    setHallAmbienceVolume(volume);
    if (hallAudioRef.current) hallAudioRef.current.volume = volume;
  };
  const activateHall = (id: HallId) => {
    if (id === "nosotros") startHallAmbience();
    else stopHallAmbience();
    const hash = `#templo-${id}`;
    if (window.location.hash !== hash) window.history.pushState(null, "", hash);
    setActiveHall(id);
  };
  const openHall = (id: HallId, trigger: HTMLButtonElement) => {
    roomTriggerRef.current = trigger;
    activateHall(id);
  };
  const closeHall = () => {
    const dialog = roomDialogRef.current;
    if (dialog?.open) dialog.close();
    else {
      setActiveHall(null);
      roomTriggerRef.current?.focus();
      roomTriggerRef.current = null;
    }
  };
  const onRoomDialogClose = () => {
    stopHallAmbience();
    setActiveHall(null);
    roomTriggerRef.current?.focus({ preventScroll: true });
    roomTriggerRef.current = null;
  };
  const nextWeather = () => {
    const i = WEATHER_ORDER.indexOf(weather);
    setWeather(WEATHER_ORDER[(i + 1) % WEATHER_ORDER.length]);
  };

  // Monta la capa de partículas una vez y le pasa cada cambio de clima.
  useEffect(() => {
    const canvas = weatherCanvasRef.current;
    if (!canvas) return;
    const audio = createWeatherAudio();
    audioRef.current = audio;
    const controller = mountWeather(canvas, { onBolt: () => audio.thunder() });
    weatherRef.current = controller;
    try {
      const saved = JSON.parse(localStorage.getItem("criden-clima-sonido") ?? "null");
      if (saved && typeof saved.volume === "number") {
        setSoundVolume(Math.min(1, Math.max(0, saved.volume)));
        audio.setVolume(saved.volume);
      }
    } catch {}
    return () => {
      controller.destroy();
      audio.destroy();
      weatherRef.current = null;
      audioRef.current = null;
    };
  }, []);
  useEffect(() => {
    weatherRef.current?.set(weather);
    audioRef.current?.setMode(weather);
  }, [weather]);
  const saveSound = (on: boolean, volume: number) => {
    try {
      localStorage.setItem("criden-clima-sonido", JSON.stringify({ on, volume }));
    } catch {}
  };
  // Activar el sonido debe ocurrir dentro del clic: los navegadores no dejan sonar antes.
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) {
      audioRef.current?.setVolume(soundVolume);
      audioRef.current?.enable();
      audioRef.current?.setMode(weather);
    } else audioRef.current?.disable();
    saveSound(next, soundVolume);
  };
  const changeSoundVolume = (v: number) => {
    setSoundVolume(v);
    audioRef.current?.setVolume(v);
    saveSound(soundOn, v);
  };
  // El panel del sonido se cierra con Esc o al tocar fuera.
  useEffect(() => {
    if (!soundOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSoundOpen(false);
    const onDown = (e: PointerEvent) => {
      if (!soundPanelRef.current?.contains(e.target as Node)) setSoundOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [soundOpen]);

  useEffect(() => {
    const dialog = roomDialogRef.current;
    if (!dialog) return;
    if (activeHall) {
      if (!dialog.open) dialog.showModal();
      dialog
        .querySelector<HTMLElement>(`#templo-room-heading-${activeHall}`)
        ?.focus({ preventScroll: true });
    } else if (dialog.open) {
      dialog.close();
    }
  }, [activeHall]);

  useEffect(() => {
    return () => {
      const audio = hallAudioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const landscape = root.querySelector<HTMLImageElement>(".tr-landscape img");
    const petals = root.querySelector<HTMLElement>(".petals");
    if (!petals) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(pointer: fine)");
    let raf = 0;
    let parallaxRaf = 0;
    let pointerX = 0;
    let pointerY = 0;

    // La paleta del recorrido cambia en las terrazas; el cielo y el sol ya forman parte del fondo.
    const paint = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - innerHeight;
      const v = max > 0 ? Math.min(Math.max(scrollY / max, 0), 1) : 0;
      for (const id of Object.keys(PAINT)) root.style.setProperty("--c-" + id, keyed(PAINT[id], v));
      root.classList.toggle("night", v > 0.74);
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const applyParallax = () => {
      parallaxRaf = 0;
      const clouds = root.querySelectorAll<HTMLElement>(".tr-cloud");
      for (const cloud of clouds) {
        const depth = cloud.classList.contains("tr-cloud--far")
          ? 0.28
          : cloud.classList.contains("tr-cloud--middle")
            ? 0.58
            : 0.9;
        cloud.style.setProperty("--parallax-x", `${-pointerX * depth * 8}px`);
        cloud.style.setProperty("--parallax-y", `${-pointerY * depth * 4}px`);
      }
      if (landscape) {
        landscape.style.setProperty("--parallax-x", `${pointerX * 3}px`);
        landscape.style.setProperty("--parallax-y", `${pointerY * 2}px`);
      }
    };
    const queueParallax = () => {
      if (!parallaxRaf) parallaxRaf = requestAnimationFrame(applyParallax);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || motion.matches) return;
      pointerX = Math.max(-1, Math.min(1, (event.clientX / innerWidth - 0.5) * 2));
      pointerY = Math.max(-1, Math.min(1, (event.clientY / innerHeight - 0.5) * 2));
      queueParallax();
    };
    const onPointerLeave = () => {
      pointerX = 0;
      pointerY = 0;
      queueParallax();
    };
    const onMotionChange = () => {
      if (motion.matches) onPointerLeave();
    };
    const onAdvanceRoom = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest<HTMLButtonElement>(
        ".tr-room-content button.go[data-next]",
      );
      const id = button?.dataset.next;
      if (!button || !id || !HALL_IDS.includes(id as (typeof HALL_IDS)[number])) return;
      event.preventDefault();
      goToHall(id as HallId, true);
    };
    // Sala que ocupa la pantalla: la resalta en la barra de salas.
    const seen = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.intersectionRatio);
        let best: string | null = null;
        let bestRatio = 0.35;
        for (const [id, ratio] of seen) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        setCurrentStop(best ? (best.replace("templo-", "") as HallId) : null);
      },
      { threshold: [0, 0.2, 0.35, 0.5, 0.65, 0.8, 1] },
    );
    root.querySelectorAll<HTMLElement>(".tr-stop").forEach((el) => observer.observe(el));

    paint();
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    root.addEventListener("click", onAdvanceRoom);
    motion.addEventListener("change", onMotionChange);
    if (finePointer.matches) {
      root.addEventListener("pointermove", onPointerMove, { passive: true });
      root.addEventListener("pointerleave", onPointerLeave, { passive: true });
    }

    const removePetals = mountPetals(petals);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(parallaxRaf);
      window.removeEventListener("scroll", queue);
      window.removeEventListener("resize", queue);
      root.removeEventListener("click", onAdvanceRoom);
      motion.removeEventListener("change", onMotionChange);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
      observer.disconnect();
      removePetals();
    };
  }, []);

  return (
    <div className="tp tp-trail" data-weather={weather} ref={ref} lang={lang}>
      <div className="sky" aria-hidden="true">
        {media.wide && (
          <picture className="tr-landscape">
            {media.tablet && (
              <source
                media="(min-aspect-ratio: 5/4) and (max-aspect-ratio: 8/5)"
                srcSet={media.tablet}
                type="image/webp"
              />
            )}
            {media.tall && (
              <source media="(max-aspect-ratio: 1/1)" srcSet={media.tall} type="image/webp" />
            )}
            <img src={media.wide} alt="" fetchPriority="high" decoding="async" />
          </picture>
        )}
      </div>
      <div className="tr-cloud-layer" aria-hidden="true">
        {CLOUDS.map((c, i) => (
          <i
            key={i}
            className={`tr-cloud tr-cloud--${c.plane}`}
            style={
              {
                top: c.top,
                "--w": c.width,
                "--delay": c.delay,
                "--crop-x": c.cropX,
                "--crop-y": c.cropY,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="petals" aria-hidden="true" />
      <div className="tr-weather-tint" aria-hidden="true" />
      <canvas className="tr-weather-canvas" ref={weatherCanvasRef} aria-hidden="true" />

      <header className="hud">
        <Link className="tr-brand" href={`/${lang}`} aria-label={data.brand}>
          <LogoReveal />
        </Link>
        <div className="tools">
          <button
            type="button"
            className="tr-wind-btn tr-weather-btn"
            aria-label={`${wx.change}: ${wx.modes[weather]}`}
            onClick={nextWeather}
          >
            <WeatherIcon size={18} aria-hidden="true" />
            <span className="tr-weather-name">{wx.modes[weather]}</span>
          </button>
          <div className="tr-sound" ref={soundPanelRef}>
            <button
              type="button"
              className="tr-wind-btn tr-sound-btn"
              aria-label={wx.sound.button}
              aria-expanded={soundOpen}
              aria-controls="templo-sound-panel"
              onClick={() => setSoundOpen((v) => !v)}
            >
              {soundOn ? (
                <Volume2 size={18} aria-hidden="true" />
              ) : (
                <VolumeX size={18} aria-hidden="true" />
              )}
            </button>
            {soundOpen && (
              <div
                className="tr-sound-panel"
                id="templo-sound-panel"
                role="group"
                aria-label={wx.sound.button}
              >
                <label className="tr-sound-switch">
                  <input type="checkbox" checked={soundOn} onChange={toggleSound} />
                  <span>{soundOn ? wx.sound.on : wx.sound.off}</span>
                </label>
                <label className="tr-sound-volume">
                  <span>{wx.sound.volume}</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={soundVolume}
                    onChange={(e) => changeSoundVolume(Number(e.currentTarget.value))}
                  />
                  <b>{Math.round(soundVolume * 100)}%</b>
                </label>
                <p>{wx.sound.hint}</p>
              </div>
            )}
          </div>
          <span className="sr-only" role="status">
            {wx.label}: {wx.modes[weather]}
          </span>
          <StyleButton className="stylebtn" />
        </div>
      </header>

      <section className="tr-hero" aria-labelledby="tr-title">
        <div className="tr-card">
          <p className="k">{t.eyebrow}</p>
          <h1 id="tr-title">
            {hero.headline.pre}
            <em>{hero.headline.mark}</em>
            {hero.headline.post}
          </h1>
          <p className="tr-lead">
            {hero.intro.pre}
            <b>{hero.intro.mark}</b>
            {hero.intro.post}
          </p>
          <ul className="tr-services">
            {t.services.map((s, i) => {
              const Icon = SERVICE_ICONS[i % SERVICE_ICONS.length];
              return (
                <li key={s.title}>
                  <span className="tr-ico">
                    <Icon size={26} aria-hidden="true" />
                  </span>
                  <b>{s.title}</b>
                  <span>{hero.services[i]}</span>
                </li>
              );
            })}
          </ul>
          <div className="tr-cta">
            <a
              className="tr-btn"
              href="#templo-puerta"
              onClick={(e) => {
                e.preventDefault();
                goToHall("puerta", true);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 5c6 1.6 12 1.6 18 0M5 10h14M7.5 6.2V21M16.5 6.2V21" />
              </svg>
              <span>
                <b>{t.templo.explore}</b>
                {hero.exploreNote}
              </span>
            </a>
            <a
              className="tr-btn alt"
              href="#templo-contacto"
              onClick={(e) => {
                e.preventDefault();
                goToHall("contacto", true);
              }}
            >
              <MessageCircle size={26} aria-hidden="true" />
              <span>
                <b>{hero.contact}</b>
                {hero.contactNote}
              </span>
            </a>
          </div>
        </div>
      </section>

      {halls.map((h, i) => (
        <section
          key={h.id}
          id={`templo-${h.id}`}
          className={"tr-stop" + (currentStop === h.id ? " is-current" : "")}
          aria-labelledby={`templo-stop-${h.id}-title`}
          tabIndex={-1}
        >
          <figure className="tr-art tr-scene" aria-hidden="true">
            <picture>
              <source
                media="(max-width: 900px), (max-aspect-ratio: 1/1)"
                srcSet={STOP_MEDIA_MOBILE[h.id]}
                type="image/webp"
              />
              <img
                src={STOP_MEDIA[h.id]}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </picture>
          </figure>
          <div className="tr-scene-zone">
            <button
              className={`tr-scene-target tr-scene-target--${h.id}`}
              type="button"
              aria-label={lang === "es" ? `Entrar a ${h.name}` : `Enter ${h.name}`}
              aria-haspopup="dialog"
              aria-controls="templo-room-dialog"
              onClick={(event) => openHall(h.id, event.currentTarget)}
            />
          </div>
          <h2 className="tr-scene-heading" id={`templo-stop-${h.id}-title`}>
            <button
              type="button"
              className="tr-scene-label"
              aria-haspopup="dialog"
              aria-controls="templo-room-dialog"
              onClick={(event) => {
                roomTriggerRef.current = event.currentTarget;
                activateHall(h.id);
              }}
            >
              <span aria-hidden="true">{h.k}</span>
              <strong>{h.name}</strong>
              <em>{st.enter} →</em>
            </button>
          </h2>
        </section>
      ))}

      <nav className="tr-stations" data-hidden={currentStop === null} aria-label={st.label}>
        <button
          type="button"
          aria-label={st.prev}
          onClick={() => stepHall(-1)}
          disabled={currentStop === HALL_IDS[0]}
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        {halls.map((h) => (
          <button
            key={h.id}
            type="button"
            aria-current={currentStop === h.id ? "true" : undefined}
            onClick={() => goToHall(h.id, true)}
          >
            <i aria-hidden="true">{h.k}</i>
            <span>{h.nav}</span>
          </button>
        ))}
        <button
          type="button"
          aria-label={st.next}
          onClick={() => stepHall(1)}
          disabled={currentStop === HALL_IDS[HALL_IDS.length - 1]}
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </nav>

      <dialog
        ref={roomDialogRef}
        id="templo-room-dialog"
        className="tr-room-dialog"
        aria-labelledby={activeHall ? `templo-room-heading-${activeHall}` : undefined}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeHall();
        }}
        onClose={onRoomDialogClose}
        onKeyDown={(event) => {
          if (event.target instanceof HTMLInputElement) return;
          if (event.key === "ArrowRight") stepHall(1);
          else if (event.key === "ArrowLeft") stepHall(-1);
        }}
      >
        {activeHall === "nosotros" && (
          <div className="tr-hall-guests" aria-hidden="true">
            {HALL_VISITORS.map((guest, guestIndex) => (
              <span
                key={guestIndex}
                className="tr-hall-guest"
                style={
                  {
                    left: guest.left,
                    bottom: guest.bottom,
                    "--guest-size": guest.size,
                    "--guest-travel": guest.travel,
                    "--guest-duration": guest.duration,
                    "--guest-delay": guest.delay,
                    "--guest-clothes": guest.clothes,
                    "--guest-hair": guest.hair,
                  } as React.CSSProperties
                }
              >
                <svg viewBox="0 0 48 112" focusable="false">
                  <ellipse cx="24" cy="108" rx="16" ry="3" fill="#171622" opacity=".52" />
                  <path
                    d="M15 34 8 45l6 5 5-7-2 35h14l-2-35 5 7 6-5-7-11-6-3H19z"
                    fill="var(--guest-clothes)"
                  />
                  <path d="M18 78h6v18l-3 7h-6l3-7zM26 78h6v18l3 7h-6l-3-7z" fill="#302431" />
                  <circle cx="24" cy="19" r="8" fill="#d1a183" />
                  <path
                    d="M16 18c0-10 4-15 10-15 7 0 11 5 9 16l-4-4c-4 2-10 2-14 0z"
                    fill="var(--guest-hair)"
                  />
                  <path
                    d="M14 38 8 49M34 38l6 11"
                    fill="none"
                    stroke="var(--guest-clothes)"
                    strokeLinecap="round"
                    strokeWidth="5"
                  />
                </svg>
              </span>
            ))}
          </div>
        )}
        <div className="tr-room-dialog-inner">
          <nav className="tr-room-tabs" aria-label={st.rooms}>
            <button
              type="button"
              aria-label={st.prev}
              onClick={() => stepHall(-1)}
              disabled={activeHall === HALL_IDS[0]}
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            {halls.map((h) => (
              <button
                key={h.id}
                type="button"
                aria-current={activeHall === h.id ? "true" : undefined}
                onClick={() => goToHall(h.id, true)}
              >
                <i aria-hidden="true">{h.k}</i>
                <span>{h.nav}</span>
              </button>
            ))}
            <button
              type="button"
              aria-label={st.next}
              onClick={() => stepHall(1)}
              disabled={activeHall === HALL_IDS[HALL_IDS.length - 1]}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </nav>{" "}
          <button
            type="button"
            className="tr-room-close"
            aria-label={t.templo.closePaper}
            onClick={closeHall}
          >
            <X size={20} aria-hidden="true" />
          </button>
          {activeHall === "nosotros" && (
            <section
              className="tr-room-ambience"
              aria-label={lang === "es" ? "Ambiente del Gran Salón" : "Grand Hall ambience"}
            >
              <button
                type="button"
                className="tr-room-ambience-toggle"
                aria-pressed={hallAmbienceOn}
                onClick={toggleHallAmbience}
              >
                {hallAmbienceOn ? (
                  <VolumeX size={18} aria-hidden="true" />
                ) : (
                  <Volume2 size={18} aria-hidden="true" />
                )}
                <span>
                  {hallAmbienceOn
                    ? lang === "es"
                      ? "Silenciar ambiente"
                      : "Mute ambience"
                    : lang === "es"
                      ? "Activar ambiente"
                      : "Play ambience"}
                </span>
              </button>
              <label className="tr-room-ambience-volume" htmlFor="templo-grand-hall-volume">
                <span>{lang === "es" ? "Volumen" : "Volume"}</span>
                <input
                  id="templo-grand-hall-volume"
                  type="range"
                  min="0"
                  max="0.28"
                  step="0.01"
                  value={hallAmbienceVolume}
                  onChange={(event) => changeHallVolume(Number(event.currentTarget.value))}
                />
              </label>
            </section>
          )}
          {activeRoom &&
            (activeRoom.id === "proyectos" ||
            activeRoom.id === "nosotros" ||
            activeRoom.id === "contacto" ? (
              <article
                className="paper tr-room-content"
                aria-labelledby={`templo-room-heading-${activeRoom.id}`}
              >
                {/* Salas visuales (rooms.tsx): galería filtrable, proceso y formulario de contacto */}
                {activeRoom.id === "proyectos" ? (
                  <ProjectsRoom data={data} />
                ) : activeRoom.id === "nosotros" ? (
                  <AboutRoom data={data} />
                ) : (
                  <ContactRoom data={data} />
                )}
              </article>
            ) : (
              <article
                className="paper tr-room-content"
                aria-labelledby={`templo-room-heading-${activeRoom.id}`}
                dangerouslySetInnerHTML={{ __html: activeRoom.html }}
              />
            ))}
        </div>
      </dialog>
      <audio
        ref={hallAudioRef}
        src="/audio/gran-salon-ambience.mp3"
        preload="none"
        loop
        aria-hidden="true"
      />
    </div>
  );
}
