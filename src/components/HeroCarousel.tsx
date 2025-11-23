'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight, ChevronLeft, ChevronRight, Users, DollarSign, Globe, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

const carouselSlides = [
  {
    image: '/carousels/002.jpeg',
    title: 'Build Your Wealth Portfolio',
    subtitle: 'Diversify your investments across gold, silver, cryptocurrency, and premium real estate assets',
  },
  {
    image: '/carousels/003.jpeg',
    title: 'Smart Investment Platform',
    subtitle: 'Advanced analytics and real-time market insights to help you make informed decisions',
  },
  {
    image: '/carousels/004.jpeg',
    title: 'Secure & Trusted Platform',
    subtitle: 'Industry-leading security measures protecting your investments 24/7',
  },
  {
    image: '/carousels/d3c31753bc907f1a2e979e32862c5915.jpg',
    title: 'Start Investing Today',
    subtitle: 'Join thousands of successful investors building their financial future with confidence',
  },
];

const stats = [
  { icon: Users, value: '10,000+', label: 'Active Investors' },
  { icon: DollarSign, value: '$50M+', label: 'Assets Managed' },
  { icon: Globe, value: '45+', label: 'Countries' },
  { icon: Award, value: '99.9%', label: 'Success Rate' },
];

export default function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false })
  ]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      <div className="embla h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {carouselSlides.map((slide, index) => (
            <div key={index} className="embla__slide relative min-w-full h-full">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50" />
              </div>
              
              {/* Content */}
              <div className="relative z-10 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 md:mb-6 animate-fade-in">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 md:mb-8 leading-relaxed max-w-2xl mx-auto">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                    <Link href="/auth/register">
                      <Button size="lg" className="bg-[#bea425] hover:bg-[#a08f1f] text-white text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto">
                        Start Investing Now
                        <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                      </Button>
                    </Link>
                    <Link href="#features">
                      <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black text-base md:text-lg px-6 md:px-8 py-5 md:py-6 w-full sm:w-auto">
                        Learn More
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
      </button>

      {/* Stats Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-linear-to-t from-black/80 to-transparent py-4 md:py-10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-row justify-center items-center gap-3 sm:gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center flex-1 min-w-0">
                <div className="flex justify-center mb-1 md:mb-2">
                  <div className="p-1.5 md:p-3 bg-[#bea425]/20 backdrop-blur-sm rounded-md md:rounded-lg">
                    <stat.icon className="h-3 w-3 md:h-6 md:w-6 text-[#bea425]" />
                  </div>
                </div>
                <div className="text-sm sm:text-lg md:text-3xl font-bold text-white truncate">{stat.value}</div>
                <div className="text-[10px] sm:text-xs md:text-sm text-white/80 mt-0.5 md:mt-1 truncate px-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
