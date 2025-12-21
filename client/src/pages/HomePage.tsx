// src/pages/HomePage.tsx

import Hero from "@/components/sections/Hero";
import AboutPage from "@/pages/AboutPage";
import EventsPreview from "@/components/sections/EventsPreview";
import TeamPage from "@/pages/TeamPage"; // Your modified component
// import SponsorsSection from "@/components/sections/SponsorsSection";
import Footer from "@/components/layout/Footer";

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <AboutPage />
      <EventsPreview />

      {/* --- Team Preview Section --- */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Meet Our Team
            </h2>
            <p className="text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              The brilliant minds driving our club forward.
            </p>
          </div>
          
          {/* Using the modified TeamPage component for the preview */}
          <TeamPage 
            maxMembers={20}             // Limits the preview to 6 members
            showHeading={false}        // Hides the main H1 title block from TeamPage
            filterStatus="current"     // IMPORTANT: Fetches and displays only current members
          />
        </div>
      </section>
      {/* --- End Team Preview Section --- */}

      {/* <SponsorsSection /> */}
      <Footer />
    </div>
  );
};

export default HomePage;