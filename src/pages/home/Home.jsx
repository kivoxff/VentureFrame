import { useEffect, useState } from "react";
import AppLayout from "../../components/layout/AppLayout";
import CategoryStrip from "./components/CategoryStrip";
import HeroCarousel from "./components/HeroCarousel";
import TrustBadges from "./components/TrustBadges";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import DynamicSection from "./components/sections/DynamicSection";

function Home() {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    const loadSections = async () => {
      const sectionsRef = collection(db, "storeConfig", "metadata", "sections");

      const sectionSnap = await getDocs(sectionsRef);
      const sectionsData = sectionSnap.docs.map((doc) => doc.data());
      setSections(sectionsData);
    };

    loadSections();
  }, []);

  return (
    <AppLayout>
      <CategoryStrip />
      <HeroCarousel />
      {/* Dynamic Sections */}
      {sections.map((section) => (
        <DynamicSection section={section} />
      ))}
      <TrustBadges />
    </AppLayout>
  );
}

export default Home;
