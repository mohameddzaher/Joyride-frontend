import {
  Hero,
  Features,
  Brands,
  FeaturedProducts,
  Categories,
  WhyChooseUs,
  DealsSection,
  Testimonials,
  Newsletter,
} from '@/components/home';

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Brands />
      <FeaturedProducts />
      <Categories />
      <WhyChooseUs />
      <DealsSection />
      <Testimonials />
      <Newsletter />
    </>
  );
}
