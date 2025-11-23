import { create } from 'zustand';

interface Investment {
  id: string;
  userId: string;
  assetId: string;
  asset: {
    name: string;
    symbol: string;
    type: string;
  };
  amount: number;
  quantity: number;
  purchasePrice: number;
  currentValue: number;
  profitLoss: number;
  depositProof?: string;
  depositMethod?: string;
  isActive: boolean;
  createdAt: string;
}

interface InvestmentsState {
  investments: Investment[];
  isLoading: boolean;
  setInvestments: (investments: Investment[]) => void;
  addInvestment: (investment: Investment) => void;
  updateInvestment: (investmentId: string, updates: Partial<Investment>) => void;
  updateInvestmentValues: (assetId: string, currentPrice: number) => void;
}

export const useInvestmentsStore = create<InvestmentsState>()((set) => ({
  investments: [],
  isLoading: false,
  setInvestments: (investments) => set({ investments, isLoading: false }),
  addInvestment: (investment) =>
    set((state) => ({
      investments: [...state.investments, investment],
    })),
  updateInvestment: (investmentId, updates) =>
    set((state) => ({
      investments: state.investments.map((inv) =>
        inv.id === investmentId ? { ...inv, ...updates } : inv
      ),
    })),
  updateInvestmentValues: (assetId, currentPrice) =>
    set((state) => ({
      investments: state.investments.map((inv) => {
        if (inv.assetId === assetId && inv.isActive) {
          const currentValue = inv.quantity * currentPrice;
          const profitLoss = currentValue - inv.amount;
          return { ...inv, currentValue, profitLoss };
        }
        return inv;
      }),
    })),
}));
