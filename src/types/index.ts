export interface User {
  username: string;
  email: string;
  isLoggedIn: boolean;
  kycStatus: 'unverified' | 'pending' | 'verified';
  twoFactorEnabled: boolean;
}

export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: number;
  staked: number;
  sparkline: number[];
}

export interface Transaction {
  id: string;
  type: 'buy' | 'sell' | 'deposit' | 'withdraw' | 'stake' | 'unstake' | 'swap';
  asset: string;
  amount: number;
  price?: number;
  targetAsset?: string;
  targetAmount?: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
}

export interface ActiveOrder {
  id: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop' | 'trailing-stop' | 'bracket' | 'twap' | 'vwap' | 'iceberg';
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  filled: number;
  status: 'open' | 'filled' | 'cancelled';
  timestamp: string;
  // Algorithmic order tracking extensions
  bracketStopLoss?: number;
  bracketTakeProfit?: number;
  trailingActivationPrice?: number;
  trailingStopPercent?: number;
  trailingHighestPrice?: number;
  twapTotalChunks?: number;
  twapFilledChunks?: number;
  twapIntervalSeconds?: number;
  twapLastTriggerTime?: number;
  vwapTargetVolumeDepth?: number;
  icebergDisclosedPercent?: number;
}

export interface GridBot {
  id: string;
  symbol: string;
  lowerPrice: number;
  upperPrice: number;
  gridCount: number;
  investmentAmount: number;
  active: boolean;
  gridLevels: { price: number; type: 'buy' | 'sell'; orderId?: string }[];
  profitEarned: number;
  createdAt: string;
}

export interface ArbitragePath {
  id: string;
  route: string[]; // e.g. ["USDC", "SOL", "ETH", "USDC"]
  anomalousReturnPercent: number;
  liquidityDepthUsd: number;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  secret: string;
  permissions: {
    read: boolean;
    trade: boolean;
    withdraw: boolean;
  };
  createdAt: string;
}
