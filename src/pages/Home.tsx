
import { HeroSection } from '../components/home/HeroSection';
import { FeaturedSection } from '../components/home/FeaturedSection';
import { CategorySection } from '../components/home/CategorySection';
import TestimonialsSection  from '../components/home/TestimonialsSection';
import { CtaSection } from '../components/home/CtaSection';
export const Home = () => {
  return <div className="w-full">
      <HeroSection />
      <CategorySection />
      <FeaturedSection />
      <TestimonialsSection />
      <CtaSection />
    </div>;
};