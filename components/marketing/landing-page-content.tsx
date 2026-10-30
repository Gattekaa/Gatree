import type { Dictionary } from "@/lib/i18n/dictionaries";
import { ChevronDown } from "lucide-react";
import { AudienceShowcase } from "./audience-showcase";
import { DestinationMarquee } from "./destination-marquee";
import { HeroStage } from "./hero-stage";
import { MarketingReveal } from "./reveal";
import { ScrollStory } from "./scroll-story";
import { UniverseScene } from "./universe-scene";
import { FeatureMotionGrid } from "./feature-motion-grid";
import { MotionBridge } from "./motion-bridge";
import { ScrollFinale } from "./scroll-finale";

const heading =
  "max-w-5xl text-balance text-[clamp(2.3rem,5.4vw,5.1rem)] font-semibold leading-[1.04] tracking-[-.055em]";

export function LandingPageContent({
  marketing: t,
  localePath,
}: {
  marketing: Dictionary["marketing"];
  localePath: string;
}) {
  const campaign = t.campaign;

  return (
    <>
      <HeroStage
        content={campaign.hero}
        persona={campaign.audience.items[0]}
        exampleLabel={campaign.audience.exampleLabel}
        cta={t.nav.startFree}
        localePath={localePath}
      />
      <DestinationMarquee content={campaign.marquee} />

      <UniverseScene campaign={campaign} />

      <FeatureMotionGrid content={campaign.bento} />

      <MotionBridge words={campaign.universe.bridgeWords} />

      <ScrollStory
        content={campaign.story}
        localePath={localePath}
        ctaLabel={t.nav.startFree}
      />
      <AudienceShowcase content={campaign.audience} />

      <section className="px-5 py-28 sm:px-8 md:py-40 lg:px-10">
        <div className="mx-auto grid max-w-[1280px] gap-12 md:grid-cols-[.8fr_1.2fr] md:gap-24">
          <MarketingReveal>
            <h2 className={heading}>{t.faq.title}</h2>
          </MarketingReveal>
          <MarketingReveal>
            {t.faq.items.map((item) => (
              <details
                key={item.q}
                className="group border-b border-marketing-border first:border-t"
              >
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium tracking-[-.02em] [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    size={20}
                    aria-hidden="true"
                    className="shrink-0 text-marketing-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <p className="max-w-xl pb-7 pr-8 text-[15px] leading-[1.8] text-marketing-muted">
                  {item.a}
                </p>
              </details>
            ))}
          </MarketingReveal>
        </div>
      </section>

      <ScrollFinale
        content={campaign.final}
        cta={t.nav.startFree}
        localePath={localePath}
      />
    </>
  );
}
