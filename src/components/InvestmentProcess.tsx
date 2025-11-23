'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function InvestmentProcess() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            INVESTPRO INVESTMENT PROCESS
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our strategic approach combines cutting-edge technology with proven investment methodologies
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Investment Process Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <Image
                src="/investment-process-graph-fpo.png.webp"
                alt="Investment Process Flow"
                width={600}
                height={500}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>

          {/* Investment Process Content */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6 border-l-4 border-[#bea425] pl-4">
                Core Values & Strategic Methods
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 group">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#bea425] flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    <strong className="text-gray-900">Advanced Market Analysis:</strong> Development and execution of tactical macroeconomic strategies tailored to global market trends
                  </p>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#bea425] flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    <strong className="text-gray-900">Proprietary Research:</strong> In-depth valuation analysis using our exclusive research methodologies and data models
                  </p>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#bea425] flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    <strong className="text-gray-900">AI-Powered Quantamental Models:</strong> Sophisticated algorithms analyzing equity markets, macro trends, precious metals, and energy sectors
                  </p>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#bea425] flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    <strong className="text-gray-900">Expert Team:</strong> Collaboration with industry-leading professionals recognized as experts in their specialized fields
                  </p>
                </li>
                <li className="flex items-start gap-3 group">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-[#bea425] flex items-center justify-center mt-1 group-hover:scale-110 transition-transform">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    <strong className="text-gray-900">Strategic Risk Management:</strong> Dynamic approach that leverages market volatility to unlock and realize intrinsic asset value
                  </p>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link href="/auth/register">
                <Button size="lg" className="bg-[#bea425] hover:bg-[#a08d1f] text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                  Start Investing Today
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
