import { notFound } from "next/navigation";
import { brand, content, isLang, members, projects, contactInfo, temploMedia } from "@/lib/content";
import { ExecView } from "@/components/public/site/exec-view";
import { StyleProvider } from "@/components/public/site/style-provider";
import { TemploLayer } from "@/components/public/site/templo-layer";
export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "en" }];
}
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const t = content(lang);
  return {
    title: "Criden · " + t.hero,
    description: t.intro,
    alternates: { languages: { es: "/es", en: "/en" } },
  };
}
export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = content(lang);
  return (
    <StyleProvider labels={t.style}>
      <ExecView lang={lang} />
      <TemploLayer
        lang={lang}
        brand={brand}
        media={temploMedia}
        t={t}
        members={members}
        projects={projects}
        contact={contactInfo}
      />
    </StyleProvider>
  );
}
