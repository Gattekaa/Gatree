import IntroductionContainer from "@/components/IntroductionContainer";
import LandingNavbar from "@/components/landingNavbar";
import PresenceContainer from "@/components/PresenceContainer";
import PresentationSparkles from "@/components/presentationSparkles";

export default function Home() {
  return (
    <main>
      <LandingNavbar />
      <PresentationSparkles />
      <IntroductionContainer />
      <PresenceContainer />
    </main>

  );
}
