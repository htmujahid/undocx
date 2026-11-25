import { Cta } from "../_components/cta";
import { Compared } from "./_components/compared";
import { Control } from "./_components/control";
import { Export } from "./_components/export";
import { Faq } from "./_components/faq";
import { Hero } from "./_components/hero";
import { HowItWorks } from "./_components/how-it-works";
import { PricingTeaser } from "./_components/pricing-teaser";
import { Problem } from "./_components/problem";
import { Rules } from "./_components/rules";
import { Sources } from "./_components/sources";
import { UseCases } from "./_components/use-cases";
import { Voice } from "./_components/voice";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem number="02" />
      <HowItWorks number="03" />
      <Control number="04" />
      <Voice number="05" />
      <Sources number="06" />
      <Export number="07" />
      <UseCases number="08" />
      <Rules number="09" />
      <Compared number="10" />
      <PricingTeaser number="11" />
      <Faq number="12" />
      <Cta />
    </>
  );
}
