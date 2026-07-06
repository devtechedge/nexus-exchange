import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Key, 
  ShieldCheck, 
  Terminal,
  Info,
  Zap,
  Sliders,
  Activity,
  Database,
  GitFork,
  ShieldAlert,
  ArrowDownUp,
  Play,
  Cpu,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Wifi,
  FileText,
  Clock,
  Unlock,
  Layers,
  Sparkles,
  ExternalLink,
  Lock
} from 'lucide-react';
import { ApiKey } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DeveloperDocsProps {
  apiKeys: ApiKey[];
  onCreateKey: (name: string, perms: { read: boolean; trade: boolean; withdraw: boolean }) => void;
  onRevokeKey: (id: string) => void;
}

// Mock historic rate limiting request spikes
const RATE_LIMIT_CHART_DATA = [
  { hour: '12:00', requests: 120, limit: 1000 },
  { hour: '13:00', requests: 240, limit: 1000 },
  { hour: '14:00', requests: 890, limit: 1000 }, // Spikes
  { hour: '15:00', requests: 450, limit: 1000 },
  { hour: '16:00', requests: 180, limit: 1000 },
  { hour: '17:00', requests: 210, limit: 1000 },
  { hour: '18:00', requests: 310, limit: 1000 },
  { hour: '19:00', requests: 950, limit: 1000 }, // Spike near limit
  { hour: '20:00', requests: 420, limit: 1000 },
  { hour: '21:00', requests: 150, limit: 1000 },
  { hour: '22:00', requests: 110, limit: 1000 },
  { hour: '23:00', requests: 95,  limit: 1000 },
];

export default function DeveloperDocs({ apiKeys, onCreateKey, onRevokeKey }: DeveloperDocsProps) {
  // Sub-tabs navigation for Batch 4 features
  const [activeSubTab, setActiveSubTab] = useState<'credentials' | 'webhooks' | 'sandbox' | 'analytics' | 'reserves'>('credentials');

  // Copied states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Common copy utility
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // ==========================================
  // --- FEATURE 34. SCOPED SESSION LEASES STATE & HANDLERS ---
  // ==========================================
  const [keyName, setKeyName] = useState('');
  const [perms, setPerms] = useState({ read: true, trade: false, withdraw: false });
  
  // Custom lease configuration
  const [isLeaseEnabled, setIsLeaseEnabled] = useState(false);
  const [leaseDurationMin, setLeaseDurationMin] = useState(15);
  const [leaseMaxTrades, setLeaseMaxTrades] = useState(5);

  const [localLeases, setLocalLeases] = useState<{
    [keyId: string]: {
      isLease: boolean;
      expiresAt: number;
      remainingTrades: number;
      maxTrades: number;
      durationMin: number;
    }
  }>({});

  // Intercept key creation to bind lease parameters
  const prevKeysRef = useRef<ApiKey[]>(apiKeys);
  useEffect(() => {
    if (apiKeys.length > prevKeysRef.current.length) {
      // Locate the newly created key in the list
      const newKey = apiKeys.find(k => !prevKeysRef.current.some(pk => pk.id === k.id));
      if (newKey && isLeaseEnabled) {
        setLocalLeases(prev => ({
          ...prev,
          [newKey.id]: {
            isLease: true,
            expiresAt: Date.now() + leaseDurationMin * 60 * 1000,
            remainingTrades: leaseMaxTrades,
            maxTrades: leaseMaxTrades,
            durationMin: leaseDurationMin
          }
        }));
      }
    }
    prevKeysRef.current = apiKeys;
  }, [apiKeys, isLeaseEnabled, leaseDurationMin, leaseMaxTrades]);

  // Periodic ticking for countdown leases
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    onCreateKey(keyName.trim(), perms);
    setKeyName('');
    // Note: lease switches are kept active for convenience but key is successfully bound
  };

  // Helper to check if key is expired
  const getKeyLeaseState = (keyId: string) => {
    const lease = localLeases[keyId];
    if (!lease) return { isLease: false, expired: false, timerStr: '', remainingTrades: 0 };
    
    const timeRemainingSeconds = Math.max(0, Math.ceil((lease.expiresAt - Date.now()) / 1000));
    const expiredByTime = timeRemainingSeconds <= 0;
    const expiredByTrades = lease.remainingTrades <= 0;
    const expired = expiredByTime || expiredByTrades;

    const mins = Math.floor(timeRemainingSeconds / 60);
    const secs = timeRemainingSeconds % 60;
    const timerStr = expiredByTime ? '0m 0s' : `${mins}m ${secs}s`;

    return {
      isLease: true,
      expired,
      timerStr,
      remainingTrades: lease.remainingTrades,
      expiredByTime,
      expiredByTrades
    };
  };

  // ==========================================
  // --- FEATURE 33. REAL-TIME SDK CODE-GEN PLAYGROUND ---
  // ==========================================
  const [playgroundLang, setPlaygroundLang] = useState<'typescript' | 'python' | 'rust' | 'go'>('typescript');
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState('/v4/trade/place');
  const [playgroundMethod, setPlaygroundMethod] = useState<'GET' | 'POST' | 'DELETE'>('POST');
  const [playgroundAsset, setPlaygroundAsset] = useState('SOL');
  const [playgroundAmount, setPlaygroundAmount] = useState(10);
  const [playgroundPrice, setPlaygroundPrice] = useState(145.25);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('');
  
  // Simulated request outcomes
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // Sync endpoint method automatically for comfort
  useEffect(() => {
    if (playgroundEndpoint === '/v4/wallet/balances' || playgroundEndpoint === '/v4/reserves/verify') {
      setPlaygroundMethod('GET');
    } else {
      setPlaygroundMethod('POST');
    }
  }, [playgroundEndpoint]);

  // Selected credential info helper
  const activeSelectedKey = useMemo(() => {
    return apiKeys.find(k => k.id === selectedApiKeyId) || apiKeys[0] || null;
  }, [selectedApiKeyId, apiKeys]);

  // Code Generation Engine
  const generatedCode = useMemo(() => {
    const keyString = activeSelectedKey ? activeSelectedKey.key : 'nx_live_pk_87acbe89420';
    const secretString = activeSelectedKey ? activeSelectedKey.secret : 'nx_live_sk_3943fef893a9••••••••';
    
    const tsPayload = playgroundMethod === 'POST' 
      ? `{\n    symbol: "${playgroundAsset}",\n    amount: ${playgroundAmount},\n    price: ${playgroundPrice}\n  }` 
      : `{}`;

    switch (playgroundLang) {
      case 'typescript':
        return `import { NexusExchangeClient } from '@nexus-exchange/sdk';

const client = new NexusExchangeClient({
  apiKey: "${keyString}",
  apiSecret: "${secretString}",
  endpoint: "https://api.nexus.exchange"
});

async function runDevPlayground() {
  try {
    const response = await client.${playgroundMethod.toLowerCase()}("${playgroundEndpoint}", ${playgroundMethod === 'POST' ? tsPayload : ''});
    console.log("Nexus Edge Ingress response successful:", response);
  } catch (err) {
    console.error("SDK Execution rejected:", err.message);
  }
}

runDevPlayground();`;

      case 'python':
        const pyPayload = playgroundMethod === 'POST'
          ? `{\n        "symbol": "${playgroundAsset}",\n        "amount": ${playgroundAmount},\n        "price": ${playgroundPrice}\n    }`
          : `None`;
        return `from nexus_exchange_sdk import NexusClient

client = NexusClient(
    api_key="${keyString}",
    api_secret="${secretString}"
)

def run_playground():
    try:
        res = client.execute_call(
            method="${playgroundMethod}",
            endpoint="${playgroundEndpoint}",
            params=${pyPayload}
        )
        print("Nexus Edge Response:", res)
    except Exception as e:
        print("API Pipeline Error:", str(e))

if __name__ == "__main__":
    run_playground()`;

      case 'rust':
        const rustPayload = playgroundMethod === 'POST'
          ? `\n        json!({ "symbol": "${playgroundAsset}", "amount": ${playgroundAmount}, "price": ${playgroundPrice} })`
          : `\n        json!({})`;
        return `use nexus_sdk::{NexusClient, Method};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = NexusClient::new(
        "${keyString}",
        "${secretString}"
    )?;

    let response = client
        .request(Method::${playgroundMethod}, "${playgroundEndpoint}")
        .json(${rustPayload})
        .send()
        .await?;

    println!("Attested Response: {:?}", response.text().await?);
    Ok(())
}`;

      case 'go':
        return `package main

import (
	"context"
	"fmt"
	"log"
	"github.com/nexus-exchange/go-sdk/nexus"
)

func main() {
	client := nexus.NewClient("${keyString}", "${secretString}")

	ctx := context.Background()
	resp, err := client.Call(ctx, "${playgroundMethod}", "${playgroundEndpoint}", map[string]interface{}{
		"symbol": "${playgroundAsset}",
		"amount": ${playgroundAmount},
		"price":  ${playgroundPrice},
	})
	if err != nil {
		log.Fatalf("Fatal gateway failure: %v", err)
	}

	fmt.Printf("Ingress success payload: %+v\\n", resp)
}`;
    }
  }, [playgroundLang, playgroundEndpoint, playgroundMethod, playgroundAsset, playgroundAmount, playgroundPrice, activeSelectedKey]);

  // Simulate execution call incorporating Lease reductions
  const handleExecutePlaygroundCall = () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);

    setTimeout(() => {
      setPlaygroundLoading(false);
      
      // If a key is selected, check if it's leased and handle deductions
      if (activeSelectedKey) {
        const leaseState = getKeyLeaseState(activeSelectedKey.id);
        if (leaseState.isLease) {
          if (leaseState.expired) {
            setPlaygroundResponse(`HTTP/1.1 403 Forbidden\nContent-Type: application/json\nDate: ${new Date().toUTCString()}\n\n{\n  "error": "LEASE_EXPIRED_OR_LIMIT_REACHED",\n  "message": "The custom lease policy on this API credential has expired. Requests rejected.",\n  "code": 40304\n}`);
            return;
          }

          // Decrement trade allocation locally if it's a trade call
          if (playgroundEndpoint === '/v4/trade/place') {
            setLocalLeases(prev => ({
              ...prev,
              [activeSelectedKey.id]: {
                ...prev[activeSelectedKey.id],
                remainingTrades: Math.max(0, prev[activeSelectedKey.id].remainingTrades - 1)
              }
            }));
          }
        }
      }

      // Generate realistic dynamic returns
      const payloadId = `tx-api-${Math.floor(Math.random() * 900000 + 100000)}`;
      const signatureAttestation = `0x${Math.random().toString(16).substr(2, 40)}`;
      const successJson = {
        status: "SUCCESS",
        endpoint: playgroundEndpoint,
        timestamp: Date.now(),
        client_nonce: Math.floor(Math.random() * 1e8),
        payload: {
          asset: playgroundAsset,
          side: playgroundMethod === 'POST' ? 'BUY' : 'QUERY',
          price_matched: playgroundPrice,
          amount_processed: playgroundAmount,
          fill_status: "FILLED_IMMEDIATE_OR_CANCEL",
          system_attestation: signatureAttestation
        },
        latency: "14ms"
      };

      setPlaygroundResponse(`HTTP/1.1 200 OK\nContent-Type: application/json\nDate: ${new Date().toUTCString()}\nServer: Nexus-CloudRun-Ingress\n\n${JSON.stringify(successJson, null, 2)}`);
    }, 600);
  };

  // ==========================================
  // --- FEATURE 32. REAL-TIME WEBHOOK SETUP ---
  // ==========================================
  const [webhookUrl, setWebhookUrl] = useState('https://api.my-tradebot.io/v1/ingest');
  const [webhookEvents, setWebhookEvents] = useState({
    PRICE_DRIFT: true,
    LIMIT_FILL: true,
    COMPLIANCE_KYC: false,
    EPOCH_HARVEST: false
  });
  const [webhooksList, setWebhooksList] = useState<Array<{
    id: string;
    url: string;
    events: string[];
    status: 'active' | 'inactive';
    created: string;
  }>>([
    { id: 'wh-87a2', url: 'https://webhook.crypto-signals.com/handler', events: ['PRICE_DRIFT', 'LIMIT_FILL'], status: 'active', created: '2026-06-15' }
  ]);
  const [webhookSimulatorConsole, setWebhookSimulatorConsole] = useState<string | null>(null);

  const handleRegisterWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;

    const eventsArray = Object.keys(webhookEvents).filter(k => webhookEvents[k as keyof typeof webhookEvents]);
    if (eventsArray.length === 0) {
      alert('Please select at least one trigger event.');
      return;
    }

    const newWh = {
      id: `wh-${Math.floor(Math.random() * 9000 + 1000)}`,
      url: webhookUrl.trim(),
      events: eventsArray,
      status: 'active' as const,
      created: new Date().toISOString().split('T')[0]
    };

    setWebhooksList(prev => [newWh, ...prev]);
    setWebhookUrl('');
  };

  const handleFireWebhookTest = (whId: string) => {
    const targetWh = webhooksList.find(w => w.id === whId);
    if (!targetWh) return;

    setWebhookSimulatorConsole(`[ATTEMPT] Dispatching real-time cryptographic webhook alert to:\n➔ ${targetWh.url}\n\n`);

    setTimeout(() => {
      const payload = {
        event: targetWh.events[0] || "PRICE_DRIFT",
        timestamp: Date.now(),
        webhookId: targetWh.id,
        payload: {
          asset: "SOL",
          price_drift_percent: "+4.12%",
          current_spot_index: 145.25,
          alert_boundary: "UPPER_BAND_BREACHED",
          risk_threshold: "0.05"
        },
        hmac_sha256_signature: `0f8a9d102bc45de90e8f7a8c${Math.random().toString(16).substr(2, 24)}`
      };

      setWebhookSimulatorConsole(prev => (prev || '') + `HTTP/1.1 202 Accepted\nContent-Type: application/json\nConnection: keep-alive\n\nDISPATCHED WEBHOOK PAYLOAD:\n${JSON.stringify(payload, null, 2)}`);
    }, 500);
  };

  // ==========================================
  // --- FEATURE 37. TRADINGVIEW JSON INGESTION ADAPTER ---
  // ==========================================
  const [ingestionJson, setIngestionJson] = useState(`{
  "auth_token": "nx_ingest_9a8f237bc8",
  "action": "BUY",
  "symbol": "SOL",
  "amount": 10.0,
  "price": "MARKET",
  "alert_source": "TradingView-MACD-Cross"
}`);
  const [ingestionLogs, setIngestionLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] Adapter online. JSON ingestion endpoints initialized at /api/v4/ingest/tradingview`
  ]);

  const handleTriggerIngestionCall = () => {
    try {
      const parsed = JSON.parse(ingestionJson);
      if (!parsed.auth_token || !parsed.action || !parsed.symbol || !parsed.amount) {
        throw new Error("Missing required payload properties: auth_token, action, symbol, and amount are mandatory.");
      }

      setIngestionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [INGESTED ALERT] Inbound request received from TradingView user-agent.`,
        `[${new Date().toLocaleTimeString()}] Authenticating token signature: nx_ingest_••••••••`,
        `[${new Date().toLocaleTimeString()}] MATCH FOUND. Routing direct ${parsed.action} order for ${parsed.amount} ${parsed.symbol} to spot matcher...`,
        `[${new Date().toLocaleTimeString()}] [SUCCESS] Order processed. Executed on-chain synthetic fills. Code: 200.`,
        ...prev
      ]);
    } catch (err: any) {
      setIngestionLogs(prev => [
        `[${new Date().toLocaleTimeString()}] [ERROR] Parse/Validation failed: ${err.message}`,
        ...prev
      ]);
    }
  };

  // ==========================================
  // --- FEATURE 31. SANDBOX FORKING FRAMEWORK ---
  // ==========================================
  const [isSandboxActive, setIsSandboxActive] = useState(false);
  const [isForkingProgress, setIsForkingProgress] = useState(false);
  const [forkLogs, setForkLogs] = useState<string[]>([]);
  
  // Sandbox customized balances
  const [sandboxBalances, setSandboxBalances] = useState({
    SOL: 100,
    ETH: 10,
    USDC: 50000
  });

  const handleTriggerFork = () => {
    setIsForkingProgress(true);
    setForkLogs([]);
    
    const steps = [
      'Establishing secure hyper-node isolate VM container...',
      'Production database layer height attestation captured at block #4182903.',
      'Cloning asset ledger configurations for SOL, ETH, USDC, and NEX...',
      'Mapping cryptographic signatures and isolation gateways (routing active keys directly to sandbox pipeline).',
      'SUCCESS: Isolated sandbox environment established successfully! Mirror Node: sandbox-nx-7a is now ACTIVE.'
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setForkLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${step}`]);
        if (idx === steps.length - 1) {
          setIsForkingProgress(false);
          setIsSandboxActive(true);
        }
      }, (idx + 1) * 350);
    });
  };

  // Adjust sandbox assets directly to test boundary constraints
  const handleUpdateSandboxBalance = (asset: 'SOL' | 'ETH' | 'USDC', delta: number) => {
    setSandboxBalances(prev => ({
      ...prev,
      [asset]: Math.max(0, prev[asset] + delta)
    }));
  };

  // ==========================================
  // --- FEATURE 35. LATENCY INJECTOR TOOLS ---
  // ==========================================
  const [latencyMs, setLatencyMs] = useState(120);
  const [rateLimitProb, setRateLimitProb] = useState(0); // 0-100%
  const [packetLossPct, setPacketLossPct] = useState(0); // 0-20%
  const [isPingTesting, setIsPingTesting] = useState(false);
  const [pingTestResults, setPingTestResults] = useState<Array<{
    endpoint: string;
    latency: number;
    status: number;
    message: string;
    state: 'success' | 'warn' | 'error';
  }>>([]);

  const handleRunPingSpeedTest = () => {
    setIsPingTesting(true);
    setPingTestResults([]);

    const endpoints = [
      '/v4/ping',
      '/v4/wallet/balances',
      '/v4/trade/place',
      '/v4/reserves/verify'
    ];

    endpoints.forEach((ep, idx) => {
      setTimeout(() => {
        // Calculate artificial variances
        const randomLoss = Math.random() * 100 < packetLossPct;
        const randomLimit = Math.random() * 100 < rateLimitProb;
        
        let status = 200;
        let message = 'HTTP 200 OK';
        let state: 'success' | 'warn' | 'error' = 'success';
        let delay = latencyMs + Math.floor(Math.random() * 45);

        if (randomLoss) {
          status = 0;
          message = 'CONNECTION TIMEOUT (Packet Loss)';
          state = 'error';
          delay = 2000;
        } else if (randomLimit) {
          status = 429;
          message = 'HTTP 429 Too Many Requests (Rate Limited)';
          state = 'error';
          delay = 40;
        } else if (delay > 500) {
          state = 'warn';
          message = `HTTP 200 OK (Congestion Delay)`;
        }

        setPingTestResults(prev => [...prev, {
          endpoint: ep,
          latency: delay,
          status,
          message,
          state
        }]);

        if (idx === endpoints.length - 1) {
          setIsPingTesting(false);
        }
      }, (idx + 1) * 300);
    });
  };

  // ==========================================
  // --- FEATURE 38. VISUAL HISTORICAL QUERY CANVAS ---
  // ==========================================
  const [canvasSource, setCanvasSource] = useState('SOL_SPOT_OHLCV');
  const [canvasPeriod, setCanvasPeriod] = useState('1h');
  const [canvasOperator, setCanvasOperator] = useState('ROLLING_VOLATILITY');
  const [canvasFormat, setCanvasFormat] = useState('JSON_ARRAY');
  const [isQueryingCanvas, setIsQueryingCanvas] = useState(false);
  const [canvasResultsJson, setCanvasResultsJson] = useState<string | null>(null);

  // Generate real-time DB syntax
  const generatedDbQuery = useMemo(() => {
    const table = canvasSource.toLowerCase();
    const opFunc = canvasOperator === 'ROLLING_VOLATILITY' 
      ? 'stddev(close_price) OVER (ORDER BY time ROWS 14 PRECEDING)'
      : canvasOperator === 'MEAN_AVERAGE'
      ? 'avg(close_price) OVER (ORDER BY time ROWS 20 PRECEDING)'
      : canvasOperator === 'ROLLING_SHARPE_RATIO'
      ? '(avg(yield_rate) - 0.04) / stddev(yield_rate)'
      : 'crystallize_loss(buy_price, close_price)';

    return `SELECT 
  time_bucket('${canvasPeriod}', time) as time_epoch,
  ${opFunc} as calculated_metric,
  max(high) as boundary_peak
FROM exchange_historical.${table}
WHERE timestamp >= now() - INTERVAL '30 days'
GROUP BY time_epoch
ORDER BY time_epoch DESC
FORMAT ${canvasFormat};`;
  }, [canvasSource, canvasPeriod, canvasOperator, canvasFormat]);

  const handleExecuteCanvasQuery = () => {
    setIsQueryingCanvas(true);
    setCanvasResultsJson(null);

    setTimeout(() => {
      setIsQueryingCanvas(false);
      const mockRows = Array.from({ length: 4 }).map((_, idx) => {
        const date = new Date();
        date.setHours(date.getHours() - idx);
        return {
          time_epoch: date.toISOString(),
          calculated_metric: parseFloat((Math.random() * 0.15 + 0.02).toFixed(6)),
          boundary_peak: parseFloat((Math.random() * 10 + 140).toFixed(2)),
          integrity_hash: `sha256_${Math.random().toString(16).substr(2, 12)}`
        };
      });

      setCanvasResultsJson(JSON.stringify({
        query_duration_ms: 12.4,
        records_matched: 720,
        result_set: mockRows
      }, null, 2));
    }, 800);
  };

  // ==========================================
  // --- FEATURE 40. DECENTRALIZED TELEMETRY LOG VIEWER ---
  // ==========================================
  const [isLogStreamActive, setIsLogStreamActive] = useState(true);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [logs, setLogs] = useState<Array<{
    id: string;
    time: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
    subsystem: 'Vercel Edge' | 'API Gateway' | 'Database Core' | 'Hydration';
    msg: string;
  }>>([
    { id: '1', time: '23:34:02', level: 'INFO', subsystem: 'Vercel Edge', msg: 'Cold start handler completed in 14ms (Node: us-east)' },
    { id: '2', time: '23:34:05', level: 'SUCCESS', subsystem: 'API Gateway', msg: 'HMAC signature authenticated on credential key-8742 (v4 Ingress)' },
    { id: '3', time: '23:34:08', level: 'WARN', subsystem: 'Database Core', msg: 'DB connection limit near 82%. Re-allocating read replica routing.' },
    { id: '4', time: '23:34:12', level: 'INFO', subsystem: 'Hydration', msg: 'Client SSR layout hydration initialized cleanly in 184ms.' }
  ]);

  // Periodic simulated streaming log feed
  useEffect(() => {
    if (!isLogStreamActive) return;

    const subsystems = ['Vercel Edge', 'API Gateway', 'Database Core', 'Hydration'] as const;
    const infoMsgs = [
      'Edge router bypassed cached headers for private key signature lookup.',
      'Attestation node #4 registered new consensus height.',
      'Polling background cron schedules for expiring API leases...',
      'Client rendering loop achieved stable 120 FPS frame limits.'
    ];
    const warnMsgs = [
      'Rate-limiting policies parsed for client IP 142.250.72.14.',
      'WebSocket ping delay slightly elevated: 180ms.',
      'Serverless function response latency at 94ms. Warm-up invoked.'
    ];
    const errorMsgs = [
      'Invalid HMAC payload signatures rejected on request /v4/withdraw.',
      'CORS access restriction triggered: Referrer origin mismatch on client 52.41.',
      'Database connection timed out momentarily on replication pool #3.'
    ];

    const timer = setInterval(() => {
      const rand = Math.random() * 100;
      let level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' = 'INFO';
      let msg = '';
      const subsystem = subsystems[Math.floor(Math.random() * subsystems.length)];

      if (rand < 15) {
        level = 'ERROR';
        msg = errorMsgs[Math.floor(Math.random() * errorMsgs.length)];
      } else if (rand < 40) {
        level = 'WARN';
        msg = warnMsgs[Math.floor(Math.random() * warnMsgs.length)];
      } else if (rand < 65) {
        level = 'SUCCESS';
        msg = 'Credential lookup attestation completed successfully (0.4ms).';
      } else {
        level = 'INFO';
        msg = infoMsgs[Math.floor(Math.random() * infoMsgs.length)];
      }

      const newLog = {
        id: Math.random().toString(),
        time: new Date().toTimeString().split(' ')[0],
        level,
        subsystem,
        msg
      };

      setLogs(prev => [newLog, ...prev.slice(0, 40)]);
    }, 4000);

    return () => clearInterval(timer);
  }, [isLogStreamActive]);

  const filteredLogs = useMemo(() => {
    if (logFilter === 'ALL') return logs;
    return logs.filter(l => l.level === logFilter);
  }, [logs, logFilter]);

  // ==========================================
  // --- FEATURE 39. PROOF OF RESERVES VERIFICATION ---
  // ==========================================
  const [reserveUserUid, setReserveUserUid] = useState('acc-user-9821-nexus');
  const [reserveUserBalance, setReserveUserBalance] = useState(14842.10);
  const [isVerifyingReserves, setIsVerifyingReserves] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState<number>(0);
  const [proofHistoryLogs, setProofHistoryLogs] = useState<string[]>([]);
  const [verifiedMerkleNodePath, setVerifiedMerkleNodePath] = useState<Array<{
    label: string;
    hash: string;
    direction: 'left' | 'right' | 'root';
    verified: boolean;
  }>>([]);

  const handleVerifyReserves = () => {
    setIsVerifyingReserves(true);
    setVerificationProgress(0);
    setVerifiedMerkleNodePath([]);

    const stepsPath = [
      { label: 'Leaf Balance Node (Your Balance)', hash: `0x4a9d821${Math.random().toString(16).substr(2, 6)}`, direction: 'left' as const, verified: true },
      { label: 'Sibling Liability Leaf H1', hash: '0xf3a8d9018241beba023fe12', direction: 'right' as const, verified: true },
      { label: 'Intermediate Merkle Sibling Branch H2', hash: '0xb2c3ef92cd4128ab09528e12', direction: 'left' as const, verified: true },
      { label: 'Custody Cold Wallet Audited Hash H3', hash: '0x89dc812ba309abef12349de5', direction: 'right' as const, verified: true },
      { label: 'Global Attested Merkle Root Hash', hash: '0x7b23cf9e8da39b9dfa32eef014298fa39e0811e921dcbabf7d29bc0efc280ac2', direction: 'root' as const, verified: true }
    ];

    // Simulate node validation delays
    stepsPath.forEach((node, idx) => {
      setTimeout(() => {
        setVerifiedMerkleNodePath(prev => [...prev, node]);
        setVerificationProgress(prev => prev + 20);
        
        if (idx === stepsPath.length - 1) {
          setIsVerifyingReserves(false);
          setProofHistoryLogs(prev => [
            `[${new Date().toLocaleTimeString()}] Authenticated liability index for UID ${reserveUserUid}. Cryptographically proved 1:1 backed solvency.`,
            ...prev
          ]);
        }
      }, (idx + 1) * 350);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER CONTROLLER WITH SUB-TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            Enterprise-Grade Developer Gateway
          </h2>
          <p className="text-xs font-sans text-slate-400 mt-1">
            Build institutional trading algorithms, customize secure expiring key leases, test via isolated sandboxes, and audit live cryptographic solvency proofs.
          </p>
        </div>

        {/* SUB-TABS SELECTOR */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-900 rounded-xl">
          {[
            { id: 'credentials', label: 'Credentials & Playground', icon: Key },
            { id: 'webhooks', label: 'Webhooks & Ingest', icon: Wifi },
            { id: 'sandbox', label: 'Sandbox VM & Latency', icon: GitFork },
            { id: 'analytics', label: 'Analytics & Telemetry', icon: Activity },
            { id: 'reserves', label: 'Merkle Proof Reserves', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                id={`dev-subtab-${tab.id}`}
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition cursor-pointer ${
                  isActive 
                    ? 'bg-slate-900 text-cyan-400 shadow-md border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ==========================================
            --- SUB-TAB 1: CREDENTIALS & PLAYGROUND ---
            ========================================== */}
        {activeSubTab === 'credentials' && (
          <motion.div
            key="credentials"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* Credentials & Scoped Leases Form (Left) */}
            <div className="lg:col-span-6 space-y-6">
              <div id="api-management" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
                  <span className="text-xs font-sans font-semibold text-slate-300">API Access Credentials & Leasing</span>
                  <Key className="w-4 h-4 text-slate-500" />
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Token Display Name</label>
                    <div className="flex gap-2">
                      <input
                        id="api-key-name-input"
                        type="text"
                        placeholder="e.g. dynamic-bot-hedger"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors font-mono"
                      />
                      <button
                        id="api-key-create-btn"
                        type="submit"
                        className="px-4 py-2 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900/40 text-cyan-400 rounded-xl text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition-colors shrink-0 animate-pulse"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Mint Key
                      </button>
                    </div>
                  </div>

                  {/* Permissions checkboxes */}
                  <div className="p-3.5 bg-slate-900/10 border border-slate-900/60 rounded-xl space-y-3">
                    <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Scope Permissions</p>
                    <div className="flex flex-wrap gap-4 text-xs font-mono">
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={perms.read}
                          disabled
                          className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                        />
                        READ
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          id="api-scope-trade"
                          type="checkbox"
                          checked={perms.trade}
                          onChange={(e) => setPerms(p => ({ ...p, trade: e.target.checked }))}
                          className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                        />
                        TRADE
                      </label>
                      <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                        <input
                          id="api-scope-withdraw"
                          type="checkbox"
                          checked={perms.withdraw}
                          onChange={(e) => setPerms(p => ({ ...p, withdraw: e.target.checked }))}
                          className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0 focus:ring-offset-0"
                        />
                        WITHDRAW
                      </label>
                    </div>
                  </div>

                  {/* 34. Scoped Session Key Lease Policy Config */}
                  <div className="p-4 bg-slate-950/80 border border-slate-900 rounded-xl space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-mono font-bold text-amber-400 uppercase">Scoped Lease Lease Policy</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          id="toggle-lease-policy"
                          type="checkbox" 
                          checked={isLeaseEnabled}
                          onChange={(e) => setIsLeaseEnabled(e.target.checked)}
                          className="sr-only peer" 
                        />
                        <div className="w-8 h-4 bg-slate-900 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3.5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>

                    <p className="text-[10px] font-sans text-slate-400">
                      When active, credentials automatically expire after a customized timeline or a designated threshold of active spot order transactions.
                    </p>

                    {isLeaseEnabled && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3 pt-2 border-t border-slate-900/60 font-mono text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>LEASE TIMELINE EXPIRE</span>
                            <span className="text-amber-400 font-bold">{leaseDurationMin} Minutes</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="60" 
                            value={leaseDurationMin}
                            onChange={(e) => setLeaseDurationMin(parseInt(e.target.value))}
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-slate-400 text-[10px]">
                            <span>MAX EXECUTED TRADES ALLOWED</span>
                            <span className="text-amber-400 font-bold">{leaseMaxTrades} Trades</span>
                          </div>
                          <input 
                            type="number" 
                            min="1" 
                            max="50"
                            value={leaseMaxTrades}
                            onChange={(e) => setLeaseMaxTrades(parseInt(e.target.value) || 1)}
                            className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>
                </form>

                {/* API Gateways List */}
                <div className="space-y-3">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-900/50 pb-1.5">Minted Gateways & Active Leases</p>
                  
                  {apiKeys.length === 0 ? (
                    <div className="py-6 text-center border border-dashed border-slate-900/60 rounded-xl">
                      <p className="text-[11px] font-mono text-slate-500">No active API keys created yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[210px] overflow-y-auto pr-1">
                      {apiKeys.map((item) => {
                        const lease = getKeyLeaseState(item.id);
                        return (
                          <div key={item.id} className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl flex flex-col gap-2 relative">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="text-xs font-sans font-bold text-slate-200">{item.name}</span>
                                <span className="text-[9px] font-mono text-slate-500 block">Created: {item.createdAt}</span>
                              </div>
                              <button
                                id={`api-revoke-${item.id}`}
                                onClick={() => onRevokeKey(item.id)}
                                className="p-1 bg-red-950/25 border border-red-950 hover:bg-red-900 text-red-400 rounded-lg cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Attested public and secret lines */}
                            <div className="space-y-1 text-[11px] font-mono">
                              <div className="flex items-center justify-between p-1 bg-slate-950 border border-slate-900/50 rounded-lg">
                                <span className="text-slate-500 text-[10px] ml-1">PK:</span>
                                <span className="text-slate-300 font-mono truncate max-w-[120px]">{item.key}</span>
                                <button
                                  id={`copy-pk-${item.id}`}
                                  onClick={() => handleCopy(item.key, `${item.id}-pk`)}
                                  className="text-slate-500 hover:text-cyan-400 p-0.5 cursor-pointer"
                                >
                                  {copiedId === `${item.id}-pk` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            {/* Scoped Lease indicator */}
                            {lease.isLease && (
                              <div className="flex items-center justify-between p-2 rounded bg-amber-950/20 border border-amber-900/30 text-[10px] font-mono mt-1">
                                <div className="flex items-center gap-1.5 text-amber-400">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>Time Remaining:</span>
                                  <span className={lease.expiredByTime ? 'text-red-400 font-bold' : 'text-amber-200 font-bold animate-pulse'}>
                                    {lease.timerStr}
                                  </span>
                                </div>

                                <div className="text-amber-400 flex items-center gap-1">
                                  <span>Trades Left:</span>
                                  <span className={lease.expiredByTrades ? 'text-red-400 font-bold' : 'text-amber-200 font-bold'}>
                                    {lease.remainingTrades}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Status and permissions badge row */}
                            <div className="flex justify-between items-center mt-1">
                              <div className="flex gap-1.5">
                                {item.permissions.read && <span className="px-1.5 py-0.5 bg-slate-900 text-slate-400 rounded text-[9px] font-mono font-bold">READ</span>}
                                {item.permissions.trade && <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 rounded text-[9px] font-mono font-bold">TRADE</span>}
                                {item.permissions.withdraw && <span className="px-1.5 py-0.5 bg-red-950 text-red-400 rounded text-[9px] font-mono font-bold">WITHDRAW</span>}
                              </div>

                              {lease.isLease && lease.expired && (
                                <span className="px-1.5 py-0.5 bg-red-950 text-red-400 border border-red-900 rounded text-[8px] font-mono font-bold">
                                  LEASE EXPIRED
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 33. Real-Time SDK Code-Gen Terminal Playground (Right) */}
            <div className="lg:col-span-6 space-y-6">
              <div id="sdk-playground" className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div className="flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-sans font-semibold text-slate-300">Sovereign SDK Code-Gen Terminal</span>
                  </div>

                  <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                    {(['typescript', 'python', 'rust', 'go'] as const).map(lang => (
                      <button
                        key={lang}
                        onClick={() => setPlaygroundLang(lang)}
                        className={`px-2 py-0.5 font-mono rounded-md cursor-pointer transition ${
                          playgroundLang === lang ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Playground Interactive Parameters */}
                <div className="grid grid-cols-2 gap-3.5 p-3.5 bg-slate-900/10 border border-slate-900/80 rounded-xl font-mono text-xs">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1.5">API INGRESS GATEWAY</label>
                    <select
                      id="playground-api-key-select"
                      value={selectedApiKeyId}
                      onChange={(e) => setSelectedApiKeyId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-cyan-500/50"
                    >
                      <option value="">-- Use Default Key --</option>
                      {apiKeys.map(k => (
                        <option key={k.id} value={k.id}>{k.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1.5">ENDPOINT METRIC</label>
                    <select
                      id="playground-endpoint-select"
                      value={playgroundEndpoint}
                      onChange={(e) => setPlaygroundEndpoint(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none"
                    >
                      <option value="/v4/trade/place">POST /v4/trade/place</option>
                      <option value="/v4/wallet/balances">GET /v4/wallet/balances</option>
                      <option value="/v4/reserves/verify">GET /v4/reserves/verify</option>
                    </select>
                  </div>

                  {playgroundMethod === 'POST' && (
                    <>
                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">ASSET SYMBOL</label>
                        <select
                          id="playground-asset-select"
                          value={playgroundAsset}
                          onChange={(e) => setPlaygroundAsset(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
                        >
                          <option value="SOL">SOL</option>
                          <option value="ETH">ETH</option>
                          <option value="USDC">USDC</option>
                          <option value="NEX">NEX</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 block mb-1">ORDER SIZE ({playgroundAsset})</label>
                        <input
                          id="playground-amount-input"
                          type="number"
                          value={playgroundAmount}
                          onChange={(e) => setPlaygroundAmount(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Generated Code Display */}
                <div className="relative">
                  <button
                    id="copy-code-playground"
                    onClick={() => handleCopy(generatedCode, 'playground')}
                    className="absolute top-3.5 right-3.5 p-1.5 bg-slate-950/80 border border-slate-900 hover:border-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg cursor-pointer transition z-10"
                  >
                    {copiedId === 'playground' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <pre className="p-4 bg-slate-950 text-[10px] font-mono text-cyan-300 overflow-x-auto rounded-xl border border-slate-900 leading-relaxed max-h-[220px]">
                    <code>{generatedCode}</code>
                  </pre>
                </div>

                {/* Simulated execution response terminal */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <button
                      id="btn-simulate-sdk-call"
                      onClick={handleExecutePlaygroundCall}
                      disabled={playgroundLoading}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {playgroundLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                      TEST FIRE PROTOCOL ENDPOINT
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">DYNAMIC PARSED RESPONSE</span>
                  </div>

                  {playgroundResponse && (
                    <pre className="p-3.5 bg-slate-950/90 text-[10px] font-mono text-slate-300 overflow-x-auto rounded-xl border border-slate-900 max-h-[160px]">
                      <code>{playgroundResponse}</code>
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            --- SUB-TAB 2: WEBHOOKS & INGESTION ---
            ========================================== */}
        {activeSubTab === 'webhooks' && (
          <motion.div
            key="webhooks"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* 32. High-Frequency Webhook Streams Config (Left) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
                <div className="border-b border-slate-900 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                      <Wifi className="w-4 h-4 text-cyan-400 animate-pulse" />
                      High-Frequency Webhook Dispatcher
                    </h3>
                    <p className="text-[10px] font-sans text-slate-400 mt-1">Config real-time push events to your servers on trigger bounds.</p>
                  </div>
                </div>

                <form onSubmit={handleRegisterWebhook} className="space-y-4 mb-6">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono text-slate-400">Endpoint URL</label>
                    <input
                      id="webhook-url-input"
                      type="url"
                      placeholder="https://my-domain.com/ingest/alerts"
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none transition-colors font-mono"
                    />
                  </div>

                  <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl space-y-2.5">
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Trigger Event Streams</p>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {Object.keys(webhookEvents).map((evt) => (
                        <label key={evt} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={webhookEvents[evt as keyof typeof webhookEvents]}
                            onChange={(e) => setWebhookEvents(prev => ({ ...prev, [evt]: e.target.checked }))}
                            className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                          />
                          {evt.replace('_', ' ')}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    id="btn-register-webhook"
                    type="submit"
                    className="w-full py-2.5 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 text-xs font-mono font-bold rounded-xl transition"
                  >
                    REGISTER DISPATCH STREAM
                  </button>
                </form>

                {/* Configured webhooks list */}
                <div className="space-y-2 font-mono">
                  <span className="text-[10px] text-slate-500 uppercase block border-b border-slate-900 pb-1 mb-2">Configure Webhook Bridges</span>
                  {webhooksList.map((wh) => (
                    <div key={wh.id} className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col gap-2">
                      <div className="flex justify-between items-start text-xs">
                        <div className="truncate max-w-[280px]">
                          <span className="text-white block truncate">{wh.url}</span>
                          <span className="text-[9px] text-slate-500 block">ID: {wh.id} • Created: {wh.created}</span>
                        </div>

                        <button
                          id={`btn-fire-test-webhook-${wh.id}`}
                          onClick={() => handleFireWebhookTest(wh.id)}
                          className="px-2 py-1 bg-cyan-950/40 border border-cyan-900 hover:bg-cyan-900/50 text-cyan-400 text-[10px] font-bold rounded-lg cursor-pointer transition"
                        >
                          FIRE TEST
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {wh.events.map(ev => (
                          <span key={ev} className="px-1.5 py-0.5 bg-slate-950 text-cyan-500 text-[9px] font-bold rounded">
                            {ev}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 37. Event-Driven Trade Ingestion JSON Webhook Adapters (Right) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-emerald-400" />
                      TradingView Event Ingestion Adapter
                    </h3>
                    <p className="text-[10px] font-sans text-slate-400 mt-1">
                      Inject alert webhooks directly from TradingView or custom signals to automate spot purchases and volatility protection.
                    </p>
                  </div>

                  {/* Ingestion Payload Customization */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">INBOUND JSON INGESTION BODY</span>
                    <textarea
                      id="tradingview-ingestion-textarea"
                      rows={6}
                      value={ingestionJson}
                      onChange={(e) => setIngestionJson(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 focus:border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none font-mono"
                    />
                  </div>

                  <button
                    id="btn-trigger-ingest-call"
                    onClick={handleTriggerIngestionCall}
                    className="w-full py-2.5 bg-emerald-950/60 border border-emerald-900 hover:bg-emerald-900 text-emerald-300 text-xs font-mono font-bold rounded-xl transition cursor-pointer"
                  >
                    SEND SIMULATED INBOUND INGESTION ALERT
                  </button>

                  {/* Ingestion Console Logs */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-900">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">ADAPTER PIPELINE INGESTION LOG</span>
                    <pre className="p-3 bg-slate-950 text-[10px] font-mono text-slate-400 overflow-y-auto max-h-[170px] rounded-xl border border-slate-900 space-y-1 leading-relaxed">
                      {ingestionLogs.map((log, i) => (
                        <div key={i} className={log.includes('[SUCCESS]') ? 'text-emerald-400' : log.includes('[ERROR]') ? 'text-red-400' : ''}>
                          {log}
                        </div>
                      ))}
                    </pre>
                  </div>
                </div>

                {/* Simulator outcome overlay */}
                {webhookSimulatorConsole && (
                  <div className="mt-4 p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500 font-bold uppercase">DISPATCH TELEMETRY TRACE</span>
                      <button 
                        onClick={() => setWebhookSimulatorConsole(null)} 
                        className="text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        [Dismiss]
                      </button>
                    </div>
                    <pre className="text-[9px] font-mono text-cyan-400 overflow-x-auto max-h-[160px] leading-relaxed">
                      <code>{webhookSimulatorConsole}</code>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            --- SUB-TAB 3: SANDBOX & LATENCY ---
            ========================================== */}
        {activeSubTab === 'sandbox' && (
          <motion.div
            key="sandbox"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* 31. Sandbox Environment Forking Framework (Left) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
                <div className="border-b border-slate-900 pb-3 mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                      <GitFork className="w-4 h-4 text-cyan-400 animate-pulse" />
                      Isolated Sandbox Forking Engine
                    </h3>
                    <p className="text-[10px] font-sans text-slate-400 mt-1">Fork an instant, isolated mirror copy of your production config.</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                    isSandboxActive ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {isSandboxActive ? 'SANDBOX ACTIVE' : 'PRODUCTION MODE'}
                  </span>
                </div>

                {/* Production vs Sandbox State comparison */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 bg-slate-900/10 border border-slate-900 rounded-2xl mb-5">
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-500 block uppercase">Production Ledger</span>
                    <div className="space-y-1">
                      <div className="flex justify-between"><span>SOL:</span><span className="text-slate-400">12.00</span></div>
                      <div className="flex justify-between"><span>ETH:</span><span className="text-slate-400">1.45</span></div>
                      <div className="flex justify-between"><span>USDC:</span><span className="text-slate-400">14,842</span></div>
                    </div>
                  </div>

                  <div className="space-y-2 border-l border-slate-900 pl-4">
                    <span className="text-[10px] text-cyan-400 block uppercase">Sandbox Ledger (Isolated)</span>
                    {isSandboxActive ? (
                      <div className="space-y-1">
                        <div className="flex justify-between"><span>SOL:</span><span className="text-cyan-400">{sandboxBalances.SOL}</span></div>
                        <div className="flex justify-between"><span>ETH:</span><span className="text-cyan-400">{sandboxBalances.ETH}</span></div>
                        <div className="flex justify-between"><span>USDC:</span><span className="text-cyan-400">{sandboxBalances.USDC.toLocaleString()}</span></div>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 italic mt-3">Fork required to instantiate sandbox allocations.</p>
                    )}
                  </div>
                </div>

                {/* Adjustments Panel inside Sandbox */}
                {isSandboxActive && (
                  <div className="mb-5 p-4 bg-cyan-950/10 border border-cyan-900/40 rounded-xl space-y-3 font-mono text-xs">
                    <span className="text-[10px] text-cyan-400 uppercase font-bold block">Inject Sandbox Test Capital</span>
                    <div className="flex gap-2">
                      <button
                        id="btn-sandbox-usdc-plus"
                        onClick={() => handleUpdateSandboxBalance('USDC', 10000)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] border border-slate-800 text-slate-300 rounded cursor-pointer transition"
                      >
                        +10k USDC
                      </button>
                      <button
                        id="btn-sandbox-sol-plus"
                        onClick={() => handleUpdateSandboxBalance('SOL', 100)}
                        className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-[10px] border border-slate-800 text-slate-300 rounded cursor-pointer transition"
                      >
                        +100 SOL
                      </button>
                      <button
                        id="btn-reset-sandbox"
                        onClick={() => setSandboxBalances({ SOL: 100, ETH: 10, USDC: 50000 })}
                        className="px-2 py-1.5 bg-red-950/20 hover:bg-red-900/30 text-[10px] border border-red-900 text-red-400 rounded cursor-pointer transition"
                      >
                        RESET
                      </button>
                    </div>
                  </div>
                )}

                <button
                  id="btn-fork-production"
                  onClick={handleTriggerFork}
                  disabled={isForkingProgress}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-mono font-bold rounded-xl shadow-lg transition tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {isForkingProgress ? 'SYNCHRONIZING PRODUCTION STATE LEDGERS...' : 'CLONE & FORK PRODUCTION ENVIRONMENT'}
                </button>

                {/* Fork logs display */}
                {forkLogs.length > 0 && (
                  <pre className="p-3 bg-slate-950 text-[9px] font-mono text-cyan-300 rounded-xl border border-slate-900 max-h-[140px] overflow-y-auto leading-relaxed mt-4">
                    {forkLogs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </pre>
                )}
              </div>
            </div>

            {/* 35. Synthetic Network Latency Injector Tools (Right) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md space-y-4">
                <div>
                  <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-400 animate-pulse" />
                    Synthetic Network Latency Injector
                  </h3>
                  <p className="text-[10px] font-sans text-slate-400 mt-1">
                    Simulate extreme network congestion, API rate-limiting blocks, and database replication drop delays to strengthen client robust error behaviors.
                  </p>
                </div>

                {/* Latency adjustment sliders */}
                <div className="space-y-4 p-4 bg-slate-900/10 border border-slate-900 rounded-xl font-mono text-xs">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>SYNTHETIC PIPELINE DELAY</span>
                      <span className="text-indigo-400 font-bold">{latencyMs} ms</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="2000"
                      value={latencyMs}
                      onChange={(e) => setLatencyMs(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>HTTP 429 RATE-LIMIT PROBABILITY</span>
                      <span className="text-indigo-400 font-bold">{rateLimitProb}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rateLimitProb}
                      onChange={(e) => setRateLimitProb(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>SIMULATED PACKET DROP RATE</span>
                      <span className="text-indigo-400 font-bold">{packetLossPct}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={packetLossPct}
                      onChange={(e) => setPacketLossPct(parseInt(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Trigger speedtest check */}
                <div className="space-y-3">
                  <button
                    id="btn-speed-ping-test"
                    onClick={handleRunPingSpeedTest}
                    disabled={isPingTesting}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-mono font-bold text-xs rounded-lg flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
                  >
                    {isPingTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    RUN ENDPOINT SPEEDTEST WITH INJECTED LATENCY
                  </button>

                  {/* Ping testing output tables */}
                  {pingTestResults.length > 0 && (
                    <div className="border border-slate-900 rounded-xl overflow-hidden font-mono text-[10px]">
                      <div className="grid grid-cols-12 bg-slate-950 p-2 text-slate-500 font-bold uppercase border-b border-slate-900">
                        <span className="col-span-5">REST Endpoint</span>
                        <span className="col-span-3 text-right">Delay</span>
                        <span className="col-span-4 text-right">Response Attestation</span>
                      </div>

                      <div className="divide-y divide-slate-900">
                        {pingTestResults.map((p, idx) => (
                          <div key={idx} className="grid grid-cols-12 p-2.5 items-center">
                            <span className="col-span-5 text-slate-300 font-bold">{p.endpoint}</span>
                            <span className="col-span-3 text-right text-indigo-400">{p.latency} ms</span>
                            <span className={`col-span-4 text-right font-bold ${
                              p.state === 'success' ? 'text-emerald-400' : p.state === 'warn' ? 'text-amber-400' : 'text-red-400'
                            }`}>{p.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            --- SUB-TAB 4: ANALYTICS & TELEMETRY ---
            ========================================== */}
        {activeSubTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* 36. Policy Rate-Limiting + 38. Historical Time-Series Query Canvas (Left) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Rate Limiting Monitors */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-3 border-b border-slate-900 pb-1.5">Granular Policy Rate-Limiting Visual Monitors</span>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-mono mb-4">
                  <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl">
                    <span className="text-[9px] text-slate-500 block">BANDWIDTH USAGE</span>
                    <span className="text-sm font-bold text-white block mt-1">1.22 GB / 5.00 GB</span>
                    <div className="w-full bg-slate-900 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded" style={{ width: '24.4%' }}></div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl">
                    <span className="text-[9px] text-slate-500 block">REQUESTS REMAINING</span>
                    <span className="text-sm font-bold text-white block mt-1">1,432 / 5,000 Hourly</span>
                    <div className="w-full bg-slate-900 h-1 rounded mt-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded" style={{ width: '28.6%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Recharts chart */}
                <div className="h-40 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={RATE_LIMIT_CHART_DATA} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#0f172a" />
                      <XAxis dataKey="hour" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: 10, fontFamily: 'monospace' }} />
                      <Area type="monotone" dataKey="requests" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorRequests)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 38. Visual Historical Time-Series Query Canvas */}
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
                <div>
                  <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-cyan-400" />
                    Time-Series Historical Query Canvas
                  </h3>
                  <p className="text-[10px] font-sans text-slate-400 mt-1">Visual query workflow builder mapping database analytics to structures.</p>
                </div>

                {/* Pipeline connector boxes */}
                <div className="grid grid-cols-4 gap-2 mt-4 text-center font-mono text-[10px]">
                  <div className="p-2 bg-slate-900/20 border border-slate-900 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block mb-1">Source Stream</span>
                    <select
                      value={canvasSource}
                      onChange={(e) => setCanvasSource(e.target.value)}
                      className="bg-slate-950 text-slate-300 w-full rounded p-1 border border-slate-900"
                    >
                      <option value="SOL_SPOT_OHLCV">SOL OHLCV</option>
                      <option value="ETH_SPOT_OHLCV">ETH OHLCV</option>
                      <option value="NEX_REWARD_LEDGER">NEX Yield</option>
                    </select>
                  </div>

                  <div className="p-2 bg-slate-900/20 border border-slate-900 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block mb-1">Bucket Interval</span>
                    <select
                      value={canvasPeriod}
                      onChange={(e) => setCanvasPeriod(e.target.value)}
                      className="bg-slate-950 text-slate-300 w-full rounded p-1 border border-slate-900"
                    >
                      <option value="5m">5 Min</option>
                      <option value="1h">1 Hour</option>
                      <option value="1d">1 Day</option>
                    </select>
                  </div>

                  <div className="p-2 bg-slate-900/20 border border-slate-900 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block mb-1">Metric Operator</span>
                    <select
                      value={canvasOperator}
                      onChange={(e) => setCanvasOperator(e.target.value)}
                      className="bg-slate-950 text-slate-300 w-full rounded p-1 border border-slate-900"
                    >
                      <option value="ROLLING_VOLATILITY">Volatility</option>
                      <option value="MEAN_AVERAGE">Mean Avg</option>
                      <option value="ROLLING_SHARPE_RATIO">Sharpe Ratio</option>
                    </select>
                  </div>

                  <div className="p-2 bg-slate-900/20 border border-slate-900 rounded-xl">
                    <span className="text-[8px] text-slate-500 uppercase block mb-1">Export Format</span>
                    <select
                      value={canvasFormat}
                      onChange={(e) => setCanvasFormat(e.target.value)}
                      className="bg-slate-950 text-slate-300 w-full rounded p-1 border border-slate-900"
                    >
                      <option value="JSON_ARRAY">JSON</option>
                      <option value="CSV_STREAM">CSV</option>
                    </select>
                  </div>
                </div>

                {/* Rendered DB Query */}
                <pre className="p-3 bg-slate-950 text-[9px] font-mono text-cyan-400 overflow-x-auto rounded-xl border border-slate-900 mt-4 leading-relaxed">
                  <code>{generatedDbQuery}</code>
                </pre>

                <div className="mt-3 flex justify-between items-center">
                  <button
                    id="btn-execute-canvas-query"
                    onClick={handleExecuteCanvasQuery}
                    disabled={isQueryingCanvas}
                    className="px-4 py-2 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-400 font-mono font-bold text-[10px] rounded-lg cursor-pointer transition disabled:opacity-50"
                  >
                    {isQueryingCanvas ? <RefreshCw className="w-3 h-3 animate-spin mr-1 inline" /> : null}
                    EXECUTE HISTORICAL CANVAS QUERY
                  </button>

                  <span className="text-[10px] font-mono text-slate-500">Query Engine: TimescaleDB Integrated</span>
                </div>

                {canvasResultsJson && (
                  <pre className="p-3 bg-slate-950 text-[9px] font-mono text-slate-400 rounded-xl border border-slate-900 mt-3 max-h-[140px] overflow-y-auto leading-relaxed">
                    <code>{canvasResultsJson}</code>
                  </pre>
                )}
              </div>
            </div>

            {/* 40. Decentralized Application Performance Telemetry Log Viewer (Right) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <div>
                    <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                      Platform Performance Telemetry Streams
                    </h3>
                    <p className="text-[10px] font-sans text-slate-400 mt-1">Real-time trace logs detailing serverless Edge nodes and hydration delay times.</p>
                  </div>

                  <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[9px]">
                    {(['ALL', 'INFO', 'WARN', 'ERROR'] as const).map(lev => (
                      <button
                        key={lev}
                        onClick={() => setLogFilter(lev)}
                        className={`px-1.5 py-0.5 font-mono rounded cursor-pointer ${
                          logFilter === lev ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-500'
                        }`}
                      >
                        {lev}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Log Shell Screen */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isLogStreamActive ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isLogStreamActive ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                      </span>
                      <span className="text-slate-400">{isLogStreamActive ? 'STREAMING ACTIVE' : 'STREAM PAUSED'}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsLogStreamActive(!isLogStreamActive)}
                        className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        {isLogStreamActive ? '[Pause Stream]' : '[Resume Stream]'}
                      </button>
                      <button
                        onClick={() => setLogs([])}
                        className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                      >
                        [Clear]
                      </button>
                    </div>
                  </div>

                  <pre className="p-4 bg-slate-950 text-[10px] font-mono rounded-xl border border-slate-900/80 leading-relaxed max-h-[340px] overflow-y-auto space-y-1 text-left select-none">
                    {filteredLogs.length === 0 ? (
                      <p className="text-slate-600 text-center italic py-4">Logs stream empty. Ready to capture telemetry...</p>
                    ) : (
                      filteredLogs.map((log) => {
                        let colClass = 'text-slate-400';
                        if (log.level === 'SUCCESS') colClass = 'text-emerald-400 font-semibold';
                        if (log.level === 'WARN') colClass = 'text-amber-400 font-semibold';
                        if (log.level === 'ERROR') colClass = 'text-red-400 font-semibold';
                        
                        return (
                          <div key={log.id} className="hover:bg-slate-900/40 p-0.5 rounded transition">
                            <span className="text-slate-600">[{log.time}] </span>
                            <span className={colClass}>[{log.level}] </span>
                            <span className="text-cyan-600 font-bold">[{log.subsystem}] </span>
                            <span className="text-slate-300">{log.msg}</span>
                          </div>
                        );
                      })
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ==========================================
            --- SUB-TAB 5: MERKLE RESERVES ---
            ========================================== */}
        {activeSubTab === 'reserves' && (
          <motion.div
            key="reserves"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            {/* 39. Merkle Tree Cryptographic Proof (Left) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
                <div className="border-b border-slate-900 pb-3 mb-5 flex justify-between items-center">
                  <div>
                    <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Public Cryptographic Proof of Reserves (PoR)
                    </h3>
                    <p className="text-[10px] font-sans text-slate-400 mt-1">Verify that customer liability lines are audited and cryptographically backed 1:1.</p>
                  </div>

                  <span className="px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 rounded text-[9px] font-mono font-bold animate-pulse">
                    100% SOLVENT ATTESTED
                  </span>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="p-4 bg-slate-900/10 border border-slate-900 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>GLOBAL ATTESTED MERKLE ROOT</span>
                      <span>AUDIT STABILITY: VERIFIED SECURE</span>
                    </div>
                    <span className="text-xs font-bold text-white block truncate select-all">
                      0x7b23cf9e8da39b9dfa32eef014298fa39e0811e921dcbabf7d29bc0efc280ac2
                    </span>
                  </div>

                  {/* Merkle Node path render widget */}
                  <div className="relative border border-slate-900 bg-slate-950 p-5 rounded-2xl min-h-[220px] flex flex-col justify-center">
                    <div className="absolute top-3 right-3 text-[9px] text-slate-500 uppercase">Interactive Merkle Node Chain</div>
                    
                    {verifiedMerkleNodePath.length === 0 ? (
                      <div className="text-center space-y-2">
                        <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-[11px] text-slate-500 italic">Please trigger a liability presence verify to visualize cryptographic path hashes...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        {verifiedMerkleNodePath.map((node, i) => (
                          <div key={i} className="flex flex-col items-center w-full">
                            {/* Visual Sibling connector line */}
                            {i > 0 && <div className="h-4 w-0.5 bg-emerald-500/50 my-1 animate-pulse"></div>}
                            
                            <div className="p-3 bg-slate-900/30 border border-emerald-500/30 text-[10px] rounded-xl flex items-center justify-between w-full max-w-md">
                              <div>
                                <span className="text-emerald-400 font-bold block">{node.label}</span>
                                <span className="text-slate-400 font-mono text-[9px] block truncate">{node.hash}</span>
                              </div>
                              <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 text-[8px] font-bold rounded flex items-center gap-1">
                                <Check className="w-3 h-3" /> VERIFIED
                              </span>
                            </div>
                          </div>
                        ))}

                        {verificationProgress === 100 && (
                          <div className="p-3.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-center max-w-md mt-2">
                            <span className="text-xs text-emerald-400 font-bold block">CRYPTOGRAPHIC sol-attestation PASSED</span>
                            <span className="text-[10px] text-slate-300 mt-1 block leading-relaxed">
                              Verification path fully attested up to core Merkle Root. Your account holdings are guaranteed 1:1 backed.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Input Verification Controls (Right) */}
            <div className="lg:col-span-4 space-y-6">
              <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md space-y-4">
                <span className="text-[10px] font-mono text-slate-500 uppercase block border-b border-slate-900 pb-1.5">Verify Ledger Balance Presence</span>
                
                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400">Your Account ID/UID</label>
                    <input
                      type="text"
                      value={reserveUserUid}
                      onChange={(e) => setReserveUserUid(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-slate-300"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400">Liability Account Balance</label>
                    <input
                      type="number"
                      value={reserveUserBalance}
                      onChange={(e) => setReserveUserBalance(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-2.5 py-1.5 text-slate-300"
                    />
                  </div>

                  <button
                    id="btn-execute-por-verify"
                    onClick={handleVerifyReserves}
                    disabled={isVerifyingReserves}
                    className="w-full py-2.5 bg-emerald-950/60 border border-emerald-900 hover:bg-emerald-900 text-emerald-300 text-xs font-mono font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isVerifyingReserves ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    VERIFY LEDGER SOLVENCY
                  </button>
                </div>

                {/* Audit proof historical log */}
                <div className="space-y-2 pt-2 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-slate-500 uppercase block">PoR Audit Ingress Log</span>
                  <pre className="p-3 bg-slate-950 text-[10px] font-mono text-slate-400 rounded-xl border border-slate-900 max-h-[140px] overflow-y-auto leading-relaxed">
                    {proofHistoryLogs.length === 0 ? (
                      <span className="text-slate-600 italic">No historical audit checks executed in current session...</span>
                    ) : (
                      proofHistoryLogs.map((log, i) => (
                        <div key={i}>{log}</div>
                      ))
                    )}
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
