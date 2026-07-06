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
  type: 'market' | 'limit';
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  filled: number;
  status: 'open' | 'filled' | 'cancelled';
  timestamp: string;
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
