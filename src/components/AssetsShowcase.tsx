'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: string;
  description?: string;
  currentPrice: number;
  minInvestment: number;
  imageUrl?: string;
  benefits?: string[];
}

const assetIcons: { [key: string]: string } = {
  'GOLD': '🥇',
  'SILVER': '🥈',
  'CRYPTO': '₿',
  'STOCKS': '📈',
  'REAL_ESTATE': '🏢',
  'BONDS': '💰',
};

const assetGradients: { [key: string]: string } = {
  'GOLD': 'from-yellow-500 to-amber-600',
  'SILVER': 'from-gray-400 to-gray-600',
  'CRYPTO': 'from-orange-500 to-yellow-600',
  'STOCKS': 'from-blue-500 to-indigo-600',
  'REAL_ESTATE': 'from-green-500 to-emerald-600',
  'BONDS': 'from-purple-500 to-pink-600',
};

export default function AssetsShowcase() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets');
      const data = await response.json();
      
      // If API returns error or empty, use fallback data
      if (data.error || !data.assets || data.assets.length === 0) {
        setAssets(getFallbackAssets());
      } else {
        setAssets(data.assets);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      // Use fallback data on error
      setAssets(getFallbackAssets());
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackAssets = (): Asset[] => {
    return [
      {
        id: '1',
        name: 'Gold',
        symbol: 'XAU',
        type: 'GOLD',
        description: 'Invest in physical gold with guaranteed returns',
        currentPrice: 2034.50,
        minInvestment: 100,
        benefits: [
          'Hedge against inflation and currency devaluation',
          'Safe-haven asset during economic uncertainty',
          'Highly liquid and globally recognized',
          'Portfolio diversification and wealth preservation',
          'No counterparty risk - tangible asset ownership'
        ]
      },
      {
        id: '2',
        name: 'Silver',
        symbol: 'XAG',
        type: 'SILVER',
        description: 'Invest in silver for steady growth and portfolio diversification',
        currentPrice: 24.12,
        minInvestment: 50,
        benefits: [
          'Industrial demand driving long-term growth',
          'More affordable entry point than gold',
          'Essential component in green energy technologies',
          'Historical store of value with high upside potential',
          'Lower volatility compared to cryptocurrencies'
        ]
      },
      {
        id: '3',
        name: 'Bitcoin',
        symbol: 'BTC',
        type: 'CRYPTO',
        description: 'Invest in the leading cryptocurrency for high-growth potential',
        currentPrice: 43250.00,
        minInvestment: 10,
        benefits: [
          'Decentralized digital currency with limited supply',
          'High growth potential with institutional adoption',
          '24/7 trading with global market access',
          'Borderless transactions and financial freedom',
          'Protection against traditional market correlation'
        ]
      },
      {
        id: '4',
        name: 'Real Estate',
        symbol: 'REIT',
        type: 'REAL_ESTATE',
        description: 'Invest in commercial and residential real estate properties',
        currentPrice: 156.80,
        minInvestment: 200,
        benefits: [
          'Regular dividend income from rental properties',
          'Tangible asset backed by physical property',
          'Tax advantages and depreciation benefits',
          'Professional property management included',
          'Diversification across multiple properties'
        ]
      }
    ];
  };

  if (isLoading) {
    return (
      <section id="assets" className="py-20 bg-linear-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">Loading assets...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="assets" className="py-20 bg-linear-to-b from-[#bea42516] to-[#e0d07f29] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#bea425] opacity-5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-black opacity-5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#bea425]/10 text-[#bea425] px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Premium Investment Options</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Diversify Your Portfolio
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Invest in a carefully curated selection of high-performing assets designed to maximize your returns while minimizing risk
          </p>
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {assets.map((asset, index) => (
            <Card 
              key={asset.id} 
              className="group relative overflow-hidden border-2 border-gray-200 hover:border-[#bea425] transition-all duration-300 hover:shadow-2xl"
            >
              {/* Gradient Header */}
              <div className={`absolute top-0 left-0 right-0 h-2 bg-linear-to-r ${assetGradients[asset.type] || 'from-gray-400 to-gray-600'}`}></div>
              
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    {/* Asset Icon */}
                    <div className={`w-16 h-16 rounded-xl bg-linear-to-br ${assetGradients[asset.type] || 'from-gray-400 to-gray-600'} flex items-center justify-center text-4xl shadow-lg group-hover:scale-110 transition-transform`}>
                      {assetIcons[asset.type] || '💎'}
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                        {asset.name}
                      </CardTitle>
                      <CardDescription className="text-sm font-medium text-gray-500">
                        {asset.symbol} • {asset.type.replace('_', ' ')}
                      </CardDescription>
                    </div>
                  </div>
                  
                  {/* Price Badge */}
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-green-600 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-semibold">Live</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      ${asset.currentPrice.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Min: ${asset.minInvestment}
                    </div>
                  </div>
                </div>

                {/* Description */}
                {asset.description && (
                  <p className="text-sm text-gray-600 mt-4 leading-relaxed">
                    {asset.description}
                  </p>
                )}
              </CardHeader>

              <CardContent>
                {/* Benefits Section */}
                {asset.benefits && asset.benefits.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-[#bea425] rounded"></span>
                      Key Benefits
                    </h4>
                    <ul className="space-y-2">
                      {asset.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle2 className="w-4 h-4 text-[#bea425] mt-0.5 shrink-0" />
                          <span className="leading-relaxed">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Button */}
                <Link href="/auth/register">
                  <Button 
                    className="w-full bg-[#bea425] hover:bg-[#a08d1f] text-white font-semibold group-hover:shadow-lg transition-all"
                    size="lg"
                  >
                    Start Investing
                    <TrendingUp className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-[#bea425]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Not sure where to start? Our investment advisors are here to help.
          </p>
          <Link href="/auth/register">
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-[#bea425] text-[#bea425] hover:bg-[#bea425] hover:text-white font-semibold"
            >
              Get Free Consultation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
