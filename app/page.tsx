import {
  TopBanner,
  Hero,
  Features,
  Brands,
  FeaturedProducts,
  Categories,
  WhyChooseUs,
  DealsSection,
  Testimonials,
  HomeFAQs,
  Newsletter,
} from '@/components/home';

export default function HomePage() {
  return (
    <>
      <TopBanner />
      <Hero />
      <Features />
      <Brands />
      <FeaturedProducts />
      <Categories />
      <WhyChooseUs />
      <DealsSection />
      <Testimonials />
      <HomeFAQs />
      <Newsletter />
    </>
  );
}
