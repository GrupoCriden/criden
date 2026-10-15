import Link from "next/link";
import {
  brand,
  content,
  members,
  cridenProjects,
  ideaProjects,
  contactInfo,
  type Lang,
} from "@/lib/content";
import { ProjectVisual } from "@/components/public";
import { Avatar } from "@/components/public/avatar";
import { LogoReveal } from "@/components/public/logo-reveal";
import { StyleButton } from "@/components/public/site/style-provider";

// Portada tradicional (estilos Ejecutivo y Noche). Es la versión que leen los buscadores y los
// lectores de pantalla en cualquier estilo; con el estilo Templo queda oculta bajo el mapa.
export function ExecView({ lang }: { lang: Lang }) {
  const t = content(lang);
  const featured = cridenProjects[0];
  const nav = ["inicio", "nosotros", "equipo", "proyectos"];
  const wa = `https://wa.me/${contactInfo.whatsapp}`;
  return (
    <div className="xv" lang={lang}>
      <header className="xv-h">
        <div className="xv-w">
          <Link className="xv-brand" href={`/${lang}`} aria-label={brand}>
            <LogoReveal />
          </Link>
          <nav className="xv-nav" aria-label={t.nav[0]}>
            {t.nav.map((n, i) => (
              <a key={n} href={`#${nav[i]}`}>
                {n}
              </a>
            ))}
          </nav>
          <Link
            className="xv-lang"
            href={`/${lang === "es" ? "en" : "es"}`}
            aria-label={lang === "es" ? "English" : "Español"}
          >
            {lang === "es" ? "EN" : "ES"}
          </Link>
          <StyleButton />
          <a className="xv-cta" href="#contacto">
            {t.contact}
          </a>
        </div>
      </header>
      <main>
        <section id="inicio" className="xv-hero">
          <div className="xv-w">
            <div>
              <p className="xv-eyebrow">{t.eyebrow}</p>
              <h1>
                {t.headline.pre}
                <em>{t.headline.mark}</em>
                {t.headline.post}
              </h1>
              <p className="xv-lead">{t.intro}</p>
              <ul className="xv-chips">
                {t.services.map((s) => (
                  <li key={s.title}>{s.title}</li>
                ))}
              </ul>
              <div className="xv-row">
                <a className="xv-btn" href="#proyectos">
                  {t.view}
                </a>
                <a className="xv-btn alt" href="#contacto">
                  {t.contact}
                </a>
              </div>
            </div>
            {featured && (
              <ProjectVisual
                name={featured.name}
                visual={featured.visual}
                screenshot={featured.screenshot}
                accent={featured.accent}
              />
            )}
          </div>
        </section>
        <section id="hacemos" className="xv-sec alt">
          <div className="xv-w">
            <p className="xv-k">{t.servicesLabel}</p>
            <h2>{t.servicesTitle}</h2>
            <div className="xv-grid">
              {t.services.map((s, i) => (
                <article className="xv-card" key={s.title}>
                  <div className="xv-num">{i + 1}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="proyectos" className="xv-sec">
          <div className="xv-w">
            <p className="xv-k">{t.projectsLabel}</p>
            <h2>{t.projectsTitle}</h2>
            <div className="xv-grid">
              {[...cridenProjects, ...ideaProjects].map((p) => (
                <article className="xv-card" key={p.slug}>
                  <ProjectVisual
                    name={p.name}
                    visual={p.visual}
                    screenshot={p.screenshot}
                    accent={p.accent}
                  />
                  <h3>{p.name}</h3>
                  <p>{p[lang].summary || p.es.summary}</p>
                  {(p.idea || p.technologies.length > 0 || p.tags.length > 0) && (
                    <ul className="xv-tags">
                      {p.idea && <li className="soon">{t.ideaStatus}</li>}
                      {[...p.technologies, ...p.tags].map((v) => (
                        <li key={v}>{v}</li>
                      ))}
                    </ul>
                  )}
                  {!p.idea && (
                    <Link className="xv-link" href={`/${lang}/proyectos/${p.slug}`}>
                      {t.case} →
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="nosotros" className="xv-sec alt">
          <div className="xv-w">
            <p className="xv-k">{t.aboutLabel}</p>
            <h2>{t.about}</h2>
            <div className="xv-grid">
              {t.values.map((v) => (
                <article className="xv-card" key={v.title}>
                  <h3>{v.title}</h3>
                  <p>{v.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="equipo" className="xv-sec">
          <div className="xv-w">
            <p className="xv-k">{t.teamLabel}</p>
            <h2>{t.teamTitle}</h2>
            <div className="xv-team">
              {members.map((m) => {
                const name = [m.name, m.surname].filter(Boolean).join(" ");
                return (
                  <article className="xv-card xv-person" key={m.slug}>
                    <Avatar traits={m.avatar} label={name} />
                    <div>
                      <h3>{name}</h3>
                      <p className="r">{m.role[lang] || m.role.es || t.role}</p>
                      <p>{m.bio[lang] || m.bio.es}</p>
                      <div className="xv-links">
                        <Link href={`/${lang}/equipo/${m.slug}`}>{t.profile} →</Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section id="contacto" className="xv-sec" style={{ paddingTop: 0 }}>
          <div className="xv-w">
            <div className="xv-band">
              <div>
                <h2>{t.contactTitle}</h2>
                <p>{t.contactText}</p>
              </div>
              <div>
                <a className="xv-btn" href={wa} target="_blank" rel="noopener noreferrer">
                  {t.whatsappCta}
                </a>
                <a className="xv-btn alt" href={`mailto:${contactInfo.email}`}>
                  {contactInfo.email}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="xv-foot">
        <div className="xv-w">
          <span>CRIDEN · {t.footer}</span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
