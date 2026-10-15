"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Building2,
  Calculator,
  Code,
  Compass,
  Database,
  ExternalLink,
  Eye,
  Flag,
  GitBranch,
  Globe,
  Layers,
  Lightbulb,
  LayoutGrid,
  MessageCircle,
  MapPin,
  Palette,
  Rocket,
  Send,
  Sparkles,
  Target,
  Trophy,
  User,
  type LucideIcon,
} from "lucide-react";
import { ProjectVisual } from "@/components/public";
import { QuoteForm } from "@/components/public/quote-form";
import type { TemploData } from "./types";

// Salas con contenido más visual que el pergamino de texto: Proyectos (galería filtrable) y
// Nosotros (pilares y proceso con iconos). Todo el texto sale de content/; aquí solo se presenta.

type Project = TemploData["projects"][number];

const KIND_ICON: Record<string, LucideIcon> = {
  platform: Layers,
  travel: Compass,
  portfolio: Building2,
  bot: Bot,
  system: Calculator,
  sports: Trophy,
  site: Globe,
};

// Icono discreto por tecnología (sin logos de marca: son categorías, no marcas).
function techIcon(name: string): LucideIcon {
  if (/supabase|mysql|sqlite|postgres|firebase/i.test(name)) return Database;
  if (/tailwind|css|figma/i.test(name)) return Palette;
  if (/telegram/i.test(name)) return Send;
  if (/haversine|map|geo/i.test(name)) return MapPin;
  return Code;
}

const FILTER_ICON: Record<string, LucideIcon> = {
  all: LayoutGrid,
  criden: Sparkles,
  independent: User,
  bots: Bot,
};
type Filter = "all" | "criden" | "independent" | "bots";
const FILTERS: Filter[] = ["all", "criden", "independent", "bots"];

// Los proyectos de Criden y los trabajos individuales de un miembro (type "independiente") se
// muestran por separado: no todo lo que hay en la galería lo hizo Criden como equipo.
const isCriden = (p: Project) => p.type === "criden";

function inFilter(p: Project, f: Filter) {
  if (f === "all") return true;
  if (f === "criden") return isCriden(p);
  if (f === "independent") return !isCriden(p);
  return p.kind === "bot";
}

function Head({ id, kicker, title, k }: { id: string; kicker: string; title: string; k: string }) {
  return (
    <>
      <p className="kicker">{kicker}</p>
      <h2 id={`templo-room-heading-${id}`} tabIndex={-1}>
        {title}
      </h2>
      <span className="stamp" aria-hidden="true">
        {k}
      </span>
    </>
  );
}

function Tech({ list }: { list: string[] }) {
  if (!list.length) return null;
  return (
    <ul className="pr-tech">
      {list.slice(0, 5).map((v) => {
        const Icon = techIcon(v);
        return (
          <li key={v}>
            <Icon size={13} aria-hidden="true" />
            {v}
          </li>
        );
      })}
    </ul>
  );
}

export function ProjectsRoom({ data }: { data: TemploData }) {
  const { t, lang } = data;
  const rooms = t.templo.rooms.projects;
  const [filter, setFilter] = useState<Filter>("all");

  const all = data.projects;
  const list = all.filter((p) => inFilter(p, filter));

  // Nombre de quien hizo los trabajos individuales (primer miembro del primer proyecto suyo).
  const firstIndependent = all.find((p) => !isCriden(p));
  const ownerName = data.members.find((m) => m.slug === firstIndependent?.members?.[0])?.name ?? "";
  const withName = (s: string) => s.replace("{name}", ownerName);

  // Criden: el primer proyecto terminado va destacado; las ideas en definición, al final.
  const criden = list.filter(isCriden);
  const featured = criden.find((p) => !p.idea);
  const cridenRest = criden
    .filter((p) => p !== featured)
    .sort((a, b) => Number(Boolean(a.idea)) - Number(Boolean(b.idea)));
  const independent = list.filter((p) => !isCriden(p));

  const summary = (p: Project) => p[lang].summary || p.es.summary;
  const links = (p: Project) => (
    <div className="pr-links">
      <Link href={`/${lang}/proyectos/${p.slug}`}>{t.case} →</Link>
      {p.url && (
        <a href={p.url} target="_blank" rel="noopener noreferrer">
          {rooms.viewSite} <ExternalLink size={13} aria-hidden="true" />
        </a>
      )}
      {p.repo && (
        <a href={p.repo} target="_blank" rel="noopener noreferrer">
          <GitBranch size={13} aria-hidden="true" /> {rooms.viewCode}
        </a>
      )}
    </div>
  );

  let step = 0;
  const card = (p: Project) => {
    const Icon = KIND_ICON[p.kind] ?? Globe;
    return (
      <article
        className="pr-card"
        key={p.slug}
        style={{ "--pc": p.accent || "#2f5d8a", "--i": ++step } as React.CSSProperties}
      >
        <div className="pr-top">
          <span className="pr-ico">
            <Icon size={22} aria-hidden="true" />
          </span>
          <span className="pr-kind">{rooms.kinds[p.kind as keyof typeof rooms.kinds]}</span>
          {p.idea && <span className="pr-soon">{t.ideaStatus}</span>}
        </div>
        <h3>{p.name}</h3>
        <p>{summary(p)}</p>
        <Tech list={[...p.technologies, ...p.tags]} />
        {!p.idea && links(p)}
      </article>
    );
  };

  return (
    <>
      <Head id="proyectos" kicker={t.projectsLabel} title={t.projectsTitle} k="巻" />
      <div className="pr-filters" role="group" aria-label={rooms.filterLabel}>
        {FILTERS.map((f) => {
          const Icon = FILTER_ICON[f];
          const n = all.filter((p) => inFilter(p, f)).length;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              disabled={n === 0}
            >
              <Icon size={15} aria-hidden="true" />
              {withName(rooms.filters[f])}
              <b>{n}</b>
            </button>
          );
        })}
      </div>
      <p className="pr-count" aria-live="polite">
        {rooms.summary.replace("{n}", String(list.length))}
      </p>

      <div className="pr-grid" key={filter}>
        {criden.length > 0 && (
          <div className="pr-group">
            <h3>
              <Sparkles size={16} aria-hidden="true" />
              {rooms.groups.criden}
            </h3>
          </div>
        )}
        {featured && (
          <article
            className="pr-featured"
            style={{ "--pc": featured.accent || "#2f5d8a", "--i": 0 } as React.CSSProperties}
          >
            <ProjectVisual
              name={featured.name}
              visual={featured.visual}
              screenshot={featured.screenshot}
              accent={featured.accent}
            />
            <div className="pr-featured-body">
              <span className="pr-badge">
                <Sparkles size={13} aria-hidden="true" />
                {t.featured}
              </span>
              <h3>{featured.name}</h3>
              <p>{summary(featured)}</p>
              <Tech list={featured.technologies} />
              {links(featured)}
            </div>
          </article>
        )}
        {cridenRest.map(card)}

        {independent.length > 0 && (
          <div className="pr-group pr-group--indep">
            <h3>
              <User size={16} aria-hidden="true" />
              {withName(rooms.groups.independent)}
            </h3>
            <p>{withName(rooms.groups.independentNote)}</p>
          </div>
        )}
        {independent.map(card)}
        {list.length === 0 && <p className="pr-empty">{rooms.empty}</p>}
      </div>

      <div className="row">
        <button className="go" data-next="equipo">
          {t.templo.halls.proyectos.next}
        </button>
      </div>
    </>
  );
}

const PILLAR_ICONS = [Target, Eye, Flag];
const STEP_ICONS = [Lightbulb, Palette, Code, Rocket];

export function AboutRoom({ data }: { data: TemploData }) {
  const { t } = data;
  return (
    <>
      <Head id="nosotros" kicker={t.aboutLabel} title={t.about} k="殿" />
      <div className="pillars">
        {t.values.map((v, i) => {
          const Icon = PILLAR_ICONS[i % PILLAR_ICONS.length];
          return (
            <div key={v.title}>
              <b className="ab-title">
                <Icon size={20} aria-hidden="true" />
                {v.title}
              </b>
              {v.text}
            </div>
          );
        })}
      </div>
      <section className="ab-process" aria-label={t.processLabel}>
        <h3>{t.processLabel}</h3>
        <ol>
          {t.process.map((step, i) => {
            const Icon = STEP_ICONS[i % STEP_ICONS.length];
            return (
              <li key={step} style={{ "--i": i } as React.CSSProperties}>
                <span>
                  <Icon size={22} aria-hidden="true" />
                </span>
                <b>{step}</b>
              </li>
            );
          })}
        </ol>
      </section>
      <div className="row">
        <button className="go" data-next="proyectos">
          {t.templo.halls.nosotros.next}
        </button>
      </div>
    </>
  );
}

// El Puente: formulario para contarnos el proyecto (llega por correo) y contacto directo.
export function ContactRoom({ data }: { data: TemploData }) {
  const { t, lang, contact } = data;
  return (
    <>
      <Head id="contacto" kicker={t.contact} title={t.contactTitle} k="橋" />
      <p>
        {t.contactText} {t.templo.bridgeText}
      </p>
      <QuoteForm
        labels={t.quote}
        lang={lang}
        whatsapp={contact.whatsapp}
        email={contact.email}
        showTitle={false}
      />
      <div className="row">
        <a
          className="go"
          href={`https://wa.me/${contact.whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle size={18} aria-hidden="true" /> {t.whatsappCta}
        </a>
        <button className="go alt" data-next="puerta">
          {t.templo.halls.contacto.next}
        </button>
      </div>
    </>
  );
}
