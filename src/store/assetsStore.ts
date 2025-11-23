import { create } from 'zustand';

interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: string;
  currentPrice: number;
  priceHistory?: { timestamp: number; price: number }[];
  description?: string;
  imageUrl?: string;
  minInvestment: number;
  isActive: boolean;
}

interface AssetsState {
  assets: Asset[];
  selectedAsset: Asset | null;
  isLoading: boolean;
  setAssets: (assets: Asset[]) => void;
  setSelectedAsset: (asset: Asset | null) => void;
  updateAssetPrice: (assetId: string, newPrice: number) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (assetId: string, updates: Partial<Asset>) => void;
}

export const useAssetsStore = create<AssetsState>()((set) => ({
  assets: [],
  selectedAsset: null,
  isLoading: false,
  setAssets: (assets) => set({ assets, isLoading: false }),
  setSelectedAsset: (asset) => set({ selectedAsset: asset }),
  updateAssetPrice: (assetId, newPrice) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              currentPrice: newPrice,
              priceHistory: [
                ...(asset.priceHistory || []),
                { timestamp: Date.now(), price: newPrice },
              ].slice(-100), // Keep last 100 price points
            }
          : asset
      ),
    })),
  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, asset],
    })),
  updateAsset: (assetId, updates) =>
    set((state) => ({
      assets: state.assets.map((asset) =>
        asset.id === assetId ? { ...asset, ...updates } : asset
      ),
    })),
}));
