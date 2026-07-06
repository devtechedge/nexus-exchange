import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Key, 
  Wifi, 
  GitFork, 
  Activity, 
  ShieldCheck, 
  Cpu 
} from 'lucide-react';
import { ApiKey } from '../types';

// Import sub-components
import DevelopersHelpHub from './developer/DevelopersHelpHub';
import CredentialsPanel from './developer/CredentialsPanel';
import WebhooksPanel from './developer/WebhooksPanel';
import SandboxPanel from './developer/SandboxPanel';
import AnalyticsPanel from './developer/AnalyticsPanel';
import ReservesPanel from './developer/ReservesPanel';

interface DeveloperDocsProps {
  apiKeys: ApiKey[];
  onCreateKey: (name: string, perms: { read: boolean; trade: boolean; withdraw: boolean }) => void;
  onRevokeKey: (id: string) => void;
}

export default function DeveloperDocs({ apiKeys, onCreateKey, onRevokeKey }: DeveloperDocsProps) {
  // Navigation for tab modules
  const [activeSubTab, setActiveSubTab] = useState<'credentials' | 'webhooks' | 'sandbox' | 'analytics' | 'reserves'>('credentials');

  // Copy-pasted indicator states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // --- STATE FOR TIMED KEY LEASES ---
  const [keyName, setKeyName] = useState('');
  const [perms, setPerms] = useState({ read: true, trade: false, withdraw: false });
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

  const prevKeysRef = useRef<ApiKey[]>(apiKeys);
  useEffect(() => {
    if (apiKeys.length > prevKeysRef.current.length) {
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

  // Clock tick timer
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getKeyLeaseState = (keyId: string) => {
    const lease = localLeases[keyId];
    if (!lease) return { isLease: false, expired: false, timerStr: '', remainingTrades: 0 };
    
    const timeRemainingSeconds = Math.max(0, Math.ceil((lease.expiresAt - Date.now()) / 1000));
    const expiredByTime = timeRemainingSeconds <= 0;
    const expiredByTrades = lease.remainingTrades <= 0;
    const expired = expiredByTime || expiredByTrades;

    const mins = Math.floor(timeRemainingSeconds / 60);
    const secs = timeRemainingSeconds % 60;
    const timerStr = expiredByTime ? 'Expired' : `${mins}m ${secs}s`;

    return {
      isLease: true,
      expired,
      timerStr,
      remainingTrades: lease.remainingTrades,
      expiredByTime,
      expiredByTrades
    };
  };

  // --- STATE FOR PLAYGROUND CODE TERMINAL ---
  const [playgroundLang, setPlaygroundLang] = useState<'typescript' | 'python' | 'rust' | 'go'>('typescript');
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState('/v4/trade/place');
  const [playgroundMethod, setPlaygroundMethod] = useState<'GET' | 'POST' | 'DELETE'>('POST');
  const [playgroundAsset, setPlaygroundAsset] = useState('SOL');
  const [playgroundAmount, setPlaygroundAmount] = useState(10);
  const [playgroundPrice, setPlaygroundPrice] = useState(145.25);
  const [selectedApiKeyId, setSelectedApiKeyId] = useState<string>('');
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  useEffect(() => {
    if (playgroundEndpoint === '/v4/wallet/balances' || playgroundEndpoint === '/v4/reserves/verify') {
      setPlaygroundMethod('GET');
    } else {
      setPlaygroundMethod('POST');
    }
  }, [playgroundEndpoint]);

  const activeSelectedKey = useMemo(() => {
    return apiKeys.find(k => k.id === selectedApiKeyId) || apiKeys[0] || null;
  }, [selectedApiKeyId, apiKeys]);

  const generatedCode = useMemo(() => {
    const keyString = activeSelectedKey ? activeSelectedKey.key : 'nx_live_pk_87acbe89420';
    const secretString = activeSelectedKey ? activeSelectedKey.secret : 'nx_live_sk_3943fef893a9••••••••';
    const tsPayload = playgroundMethod === 'POST' 
      ? `{\n    symbol: "${playgroundAsset}",\n    amount: ${playgroundAmount},\n    price: ${playgroundPrice}\n  }` 
      : `{}`;

    switch (playgroundLang) {
      case 'typescript':
        return `import { NexusExchangeClient } from '@nexus-exchange/sdk';\n\nconst client = new NexusExchangeClient({\n  apiKey: "${keyString}",\n  apiSecret: "${secretString}",\n  endpoint: "https://api.nexus.exchange"\n});\n\nasync function runDevPlayground() {\n  try {\n    const response = await client.${playgroundMethod.toLowerCase()}("${playgroundEndpoint}", ${playgroundMethod === 'POST' ? tsPayload : ''});\n    console.log("Response Success:", response);\n  } catch (err) {\n    console.error("SDK Error:", err.message);\n  }\n}\n\nrunDevPlayground();`;
      case 'python':
        const pyPayload = playgroundMethod === 'POST' ? `{\n        "symbol": "${playgroundAsset}",\n        "amount": ${playgroundAmount},\n        "price": ${playgroundPrice}\n    }` : `None`;
        return `from nexus_exchange_sdk import NexusClient\n\nclient = NexusClient(\n    api_key="${keyString}",\n    api_secret="${secretString}"\n)\n\ntry:\n    res = client.execute_call(\n        method="${playgroundMethod}",\n        endpoint="${playgroundEndpoint}",\n        params=${pyPayload}\n    )\n    print("Response payload:", res)\nexcept Exception as e:\n    print("API Error:", str(e))`;
      case 'rust':
        const rustPayload = playgroundMethod === 'POST' ? `\n        json!({ "symbol": "${playgroundAsset}", "amount": ${playgroundAmount}, "price": ${playgroundPrice} })` : `\n        json!({})`;
        return `use nexus_sdk::{NexusClient, Method};\n\n#[tokio::main]\nasync fn main() -> Result<(), Box<dyn std::error::Error>> {\n    let client = NexusClient::new("${keyString}", "${secretString}")?;\n    let response = client\n        .request(Method::${playgroundMethod}, "${playgroundEndpoint}")\n        .json(${rustPayload})\n        .send()\n        .await?;\n    println!("Attested Response: {:?}", response.text().await?);\n    Ok(())\n}`;
      case 'go':
        return `package main\n\nimport (\n\t"context"\n\t"fmt"\n\t"log"\n\t"github.com/nexus-exchange/go-sdk/nexus"\n)\n\nfunc main() {\n\tclient := nexus.NewClient("${keyString}", "${secretString}")\n\tctx := context.Background()\n\tresp, err := client.Call(ctx, "${playgroundMethod}", "${playgroundEndpoint}", map[string]interface{}{\n\t\t"symbol": "${playgroundAsset}",\n\t\t"amount": ${playgroundAmount},\n\t\t"price":  ${playgroundPrice},\n\t})\n\tif err != nil {\n\t\tlog.Fatalf("Fatal gateway failure: %v", err)\n\t}\n\tfmt.Printf("Ingress success payload: %+v\\n", resp)\n}`;
    }
  }, [playgroundLang, playgroundEndpoint, playgroundMethod, playgroundAsset, playgroundAmount, playgroundPrice, activeSelectedKey]);

  const handleExecutePlaygroundCall = () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);

    setTimeout(() => {
      setPlaygroundLoading(false);
      if (activeSelectedKey) {
        const leaseState = getKeyLeaseState(activeSelectedKey.id);
        if (leaseState.isLease && leaseState.expired) {
          setPlaygroundResponse(`HTTP/1.1 403 Forbidden\nContent-Type: application/json\n\n{\n  "error": "LEASE_EXPIRED_OR_LIMIT_REACHED",\n  "message": "The custom lease policy on this API credential has expired. Requests rejected.",\n  "code": 40304\n}`);
          return;
        }

        if (leaseState.isLease && playgroundEndpoint === '/v4/trade/place') {
          setLocalLeases(prev => ({
            ...prev,
            [activeSelectedKey.id]: {
              ...prev[activeSelectedKey.id],
              remainingTrades: Math.max(0, prev[activeSelectedKey.id].remainingTrades - 1)
            }
          }));
        }
      }

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

  // --- STATE FOR HIGH-FREQUENCY WEBHOOK STREAMS ---
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

      setWebhookSimulatorConsole(prev => (prev || '') + `HTTP/1.1 202 Accepted\nContent-Type: application/json\n\nDISPATCHED PAYLOAD:\n${JSON.stringify(payload, null, 2)}`);
    }, 500);
  };

  // --- STATE FOR TRADINGVIEW JSON INGESTION ---
  const [ingestionJson, setIngestionJson] = useState(`{\n  "auth_token": "nx_ingest_9a8f237bc8",\n  "action": "BUY",\n  "symbol": "SOL",\n  "amount": 10.0,\n  "price": "MARKET",\n  "alert_source": "TradingView-MACD-Cross"\n}`);
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

  // --- STATE FOR SANDBOX ENVIRONMENT FORKING ---
  const [isSandboxActive, setIsSandboxActive] = useState(false);
  const [isForkingProgress, setIsForkingProgress] = useState(false);
  const [forkLogs, setForkLogs] = useState<string[]>([]);
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

  const handleUpdateSandboxBalance = (asset: 'SOL' | 'ETH' | 'USDC', delta: number) => {
    setSandboxBalances(prev => ({
      ...prev,
      [asset]: Math.max(0, prev[asset] + delta)
    }));
  };

  // --- STATE FOR NETWORK LATENCY INJECTOR ---
  const [latencyMs, setLatencyMs] = useState(120);
  const [rateLimitProb, setRateLimitProb] = useState(0);
  const [packetLossPct, setPacketLossPct] = useState(0);
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

  // --- STATE FOR DATABASE HISTORICAL TIME-SERIES CANVAS ---
  const [canvasSource, setCanvasSource] = useState('SOL_SPOT_OHLCV');
  const [canvasPeriod, setCanvasPeriod] = useState('1h');
  const [canvasOperator, setCanvasOperator] = useState('ROLLING_VOLATILITY');
  const [canvasFormat, setCanvasFormat] = useState('JSON_ARRAY');
  const [isQueryingCanvas, setIsQueryingCanvas] = useState(false);
  const [canvasResultsJson, setCanvasResultsJson] = useState<string | null>(null);

  const generatedDbQuery = useMemo(() => {
    const table = canvasSource.toLowerCase();
    const opFunc = canvasOperator === 'ROLLING_VOLATILITY' 
      ? 'stddev(close_price) OVER (ORDER BY time ROWS 14 PRECEDING)'
      : canvasOperator === 'MEAN_AVERAGE'
      ? 'avg(close_price) OVER (ORDER BY time ROWS 20 PRECEDING)'
      : '(avg(yield_rate) - 0.04) / stddev(yield_rate)';

    return `SELECT \n  time_bucket('${canvasPeriod}', time) as time_epoch,\n  ${opFunc} as calculated_metric,\n  max(high) as boundary_peak\nFROM exchange_historical.${table}\nWHERE timestamp >= now() - INTERVAL '30 days'\nGROUP BY time_epoch\nORDER BY time_epoch DESC\nFORMAT ${canvasFormat};`;
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

  // --- STATE FOR PERFORMANCE TELEMETRY LOGGER ---
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

  // --- STATE FOR PROOF OF RESERVES SOLVENCY ---
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
      { label: 'Leaf Balance Node (My Audited Balance)', hash: `0x4a9d821${Math.random().toString(16).substr(2, 6)}`, direction: 'left' as const, verified: true },
      { label: 'Sibling Liability Leaf Hash H1', hash: '0xf3a8d9018241beba023fe12', direction: 'right' as const, verified: true },
      { label: 'Intermediate Merkle Sibling H2', hash: '0xb2c3ef92cd4128ab09528e12', direction: 'left' as const, verified: true },
      { label: 'Custody Audited Vault Sibling H3', hash: '0x89dc812ba309abef12349de5', direction: 'right' as const, verified: true },
      { label: 'Global Attested Merkle Root Hash', hash: '0x7b23cf9e8da39b9dfa32eef014298fa39e0811e921dcbabf7d29bc0efc280ac2', direction: 'root' as const, verified: true }
    ];

    stepsPath.forEach((node, idx) => {
      setTimeout(() => {
        setVerifiedMerkleNodePath(prev => [...prev, node]);
        setVerificationProgress(prev => prev + 20);
        
        if (idx === stepsPath.length - 1) {
          setIsVerifyingReserves(false);
          setProofHistoryLogs(prev => [
            `[${new Date().toLocaleTimeString()}] Authenticated liability index for account UID ${reserveUserUid}. Solvency verified 1:1.`,
            ...prev
          ]);
        }
      }, (idx + 1) * 350);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Subtabs selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 border border-slate-900/60 p-6 rounded-2xl backdrop-blur-md">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            Developer Tools & Bot Integrations
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Build and deploy automated trading software, configure self-destructing timed leases, test in safe isolated playgrounds, and mathematically verify platform reserves.
          </p>
        </div>

        {/* Subtabs options */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/60 border border-slate-900 rounded-xl">
          {[
            { id: 'credentials', label: 'Credentials & Recipes', icon: Key },
            { id: 'webhooks', label: 'Auto-Alerts & Ingest', icon: Wifi },
            { id: 'sandbox', label: 'Sandbox Playground', icon: GitFork },
            { id: 'analytics', label: 'Logs & Diagnostics', icon: Activity },
            { id: 'reserves', label: 'Solvency Audits', icon: ShieldCheck }
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

      {/* Helpful developer de-jargonizer cheat sheet */}
      <DevelopersHelpHub />

      {/* Panels content */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: CREDENTIALS & PLAYGROUND */}
        {activeSubTab === 'credentials' && (
          <CredentialsPanel 
            key="credentials"
            apiKeys={apiKeys}
            onCreateKey={onCreateKey}
            onRevokeKey={onRevokeKey}
            keyName={keyName}
            setKeyName={setKeyName}
            perms={perms}
            setPerms={setPerms}
            isLeaseEnabled={isLeaseEnabled}
            setIsLeaseEnabled={setIsLeaseEnabled}
            leaseDurationMin={leaseDurationMin}
            setLeaseDurationMin={setLeaseDurationMin}
            leaseMaxTrades={leaseMaxTrades}
            setLeaseMaxTrades={setLeaseMaxTrades}
            copiedId={copiedId}
            handleCopy={handleCopy}
            getKeyLeaseState={getKeyLeaseState}
            playgroundLang={playgroundLang}
            setPlaygroundLang={setPlaygroundLang}
            playgroundEndpoint={playgroundEndpoint}
            setPlaygroundEndpoint={setPlaygroundEndpoint}
            playgroundMethod={playgroundMethod}
            playgroundAsset={playgroundAsset}
            setPlaygroundAsset={setPlaygroundAsset}
            playgroundAmount={playgroundAmount}
            setPlaygroundAmount={setPlaygroundAmount}
            playgroundPrice={playgroundPrice}
            setPlaygroundPrice={setPlaygroundPrice}
            selectedApiKeyId={selectedApiKeyId}
            setSelectedApiKeyId={setSelectedApiKeyId}
            generatedCode={generatedCode}
            handleExecutePlaygroundCall={handleExecutePlaygroundCall}
            playgroundLoading={playgroundLoading}
            playgroundResponse={playgroundResponse}
          />
        )}

        {/* TAB 2: WEBHOOKS & INGEST */}
        {activeSubTab === 'webhooks' && (
          <WebhooksPanel 
            key="webhooks"
            webhookUrl={webhookUrl}
            setWebhookUrl={setWebhookUrl}
            webhookEvents={webhookEvents}
            setWebhookEvents={setWebhookEvents}
            webhooksList={webhooksList}
            handleRegisterWebhook={handleRegisterWebhook}
            handleFireWebhookTest={handleFireWebhookTest}
            ingestionJson={ingestionJson}
            setIngestionJson={setIngestionJson}
            ingestionLogs={ingestionLogs}
            handleTriggerIngestionCall={handleTriggerIngestionCall}
            webhookSimulatorConsole={webhookSimulatorConsole}
            setWebhookSimulatorConsole={setWebhookSimulatorConsole}
          />
        )}

        {/* TAB 3: SANDBOX PLAYGROUND */}
        {activeSubTab === 'sandbox' && (
          <SandboxPanel 
            key="sandbox"
            isSandboxActive={isSandboxActive}
            isForkingProgress={isForkingProgress}
            forkLogs={forkLogs}
            sandboxBalances={sandboxBalances}
            handleTriggerFork={handleTriggerFork}
            handleUpdateSandboxBalance={handleUpdateSandboxBalance}
            setSandboxBalances={setSandboxBalances}
            latencyMs={latencyMs}
            setLatencyMs={setLatencyMs}
            rateLimitProb={rateLimitProb}
            setRateLimitProb={setRateLimitProb}
            packetLossPct={packetLossPct}
            setPacketLossPct={setPacketLossPct}
            isPingTesting={isPingTesting}
            handleRunPingSpeedTest={handleRunPingSpeedTest}
            pingTestResults={pingTestResults}
          />
        )}

        {/* TAB 4: ANALYTICS, QUERIES & LIVE TELEMETRY */}
        {activeSubTab === 'analytics' && (
          <AnalyticsPanel 
            key="analytics"
            canvasSource={canvasSource}
            setCanvasSource={setCanvasSource}
            canvasPeriod={canvasPeriod}
            setCanvasPeriod={setCanvasPeriod}
            canvasOperator={canvasOperator}
            setCanvasOperator={setCanvasOperator}
            canvasFormat={canvasFormat}
            setCanvasFormat={setCanvasFormat}
            isQueryingCanvas={isQueryingCanvas}
            canvasResultsJson={canvasResultsJson}
            generatedDbQuery={generatedDbQuery}
            handleExecuteCanvasQuery={handleExecuteCanvasQuery}
            isLogStreamActive={isLogStreamActive}
            setIsLogStreamActive={setIsLogStreamActive}
            logFilter={logFilter}
            setLogFilter={setLogFilter}
            filteredLogs={filteredLogs}
            setLogs={setLogs}
          />
        )}

        {/* TAB 5: PUBLIC PROOF OF RESERVES AUDITS */}
        {activeSubTab === 'reserves' && (
          <ReservesPanel 
            key="reserves"
            reserveUserUid={reserveUserUid}
            setReserveUserUid={setReserveUserUid}
            reserveUserBalance={reserveUserBalance}
            setReserveUserBalance={setReserveUserBalance}
            isVerifyingReserves={isVerifyingReserves}
            handleVerifyReserves={handleVerifyReserves}
            verifiedMerkleNodePath={verifiedMerkleNodePath}
            verificationProgress={verificationProgress}
            proofHistoryLogs={proofHistoryLogs}
          />
        )}

      </AnimatePresence>
    </div>
  );
}
