'use client';

import Image from 'next/image';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Investment Consultant',
    image: '/testimonial/001.jpeg',
    content: 'InvestPro has transformed how I manage my portfolio. The real-time analytics and professional support are unmatched.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Business Owner',
    image: '/testimonial/002.jpeg',
    content: 'Best investment platform I\'ve used. The team is responsive, and the returns have been consistently impressive.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Entrepreneur',
    image: '/testimonial/003.jpeg',
    content: 'Diversifying my portfolio has never been easier. The admin team handles everything professionally and efficiently.',
    rating: 5,
  },
  {
    name: 'David Thompson',
    role: 'Financial Analyst',
    image: '/testimonial/004.jpeg',
    content: 'The platform\'s security features and transparent processes give me complete peace of mind with my investments.',
    rating: 5,
  },
  {
    name: 'Jessica Martinez',
    role: 'Real Estate Investor',
    image: '/testimonial/005.jpg',
    content: 'From gold to crypto, InvestPro makes it simple to invest across different asset classes. Highly recommend!',
    rating: 5,
  },
  {
    name: 'Robert Anderson',
    role: 'Tech Executive',
    image: '/testimonial/006.jpg',
    content: 'Professional, reliable, and user-friendly. InvestPro has exceeded all my expectations for an investment platform.',
    rating: 5,
  },
  {
    name: 'Amanda Wilson',
    role: 'Portfolio Manager',
    image: '/testimonial/4528cb3ab377507ad14f803b125e7937.jpg',
    content: 'The instant transactions and dedicated support make InvestPro stand out. My clients love the platform too!',
    rating: 5,
  },
];

export default function TestimonialScroll() {
  // Double testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <section className="py-16 md:py-20 bg-linear-to-b from-gray-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Investors Worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our community has to say about their investment journey
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="flex gap-6 animate-scroll">
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={index}
              className="shrink-0 w-[350px] md:w-[400px] bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 border border-gray-100"
            >
              {/* Rating Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-5 h-5 text-[#bea425]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Content */}
              <p className="text-gray-700 text-base leading-relaxed mb-6 italic">
                "{testimonial.content}"
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-full overflow-hidden ring-2 ring-[#bea425]/20">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="text-center mt-8">
        <p className="text-sm text-gray-500">Auto-scrolling testimonials</p>
      </div>
    </section>
  );
}
