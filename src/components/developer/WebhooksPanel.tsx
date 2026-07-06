import React from 'react';
import { motion } from 'motion/react';
import { Wifi, Layers } from 'lucide-react';

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  created: string;
}

interface WebhooksPanelProps {
  webhookUrl: string;
  setWebhookUrl: (val: string) => void;
  webhookEvents: {
    PRICE_DRIFT: boolean;
    LIMIT_FILL: boolean;
    COMPLIANCE_KYC: boolean;
    EPOCH_HARVEST: boolean;
  };
  setWebhookEvents: React.Dispatch<React.SetStateAction<{
    PRICE_DRIFT: boolean;
    LIMIT_FILL: boolean;
    COMPLIANCE_KYC: boolean;
    EPOCH_HARVEST: boolean;
  }>>;
  webhooksList: WebhookItem[];
  handleRegisterWebhook: (e: React.FormEvent) => void;
  handleFireWebhookTest: (whId: string) => void;
  ingestionJson: string;
  setIngestionJson: (val: string) => void;
  ingestionLogs: string[];
  handleTriggerIngestionCall: () => void;
  webhookSimulatorConsole: string | null;
  setWebhookSimulatorConsole: (val: string | null) => void;
}

export default function WebhooksPanel({
  webhookUrl,
  setWebhookUrl,
  webhookEvents,
  setWebhookEvents,
  webhooksList,
  handleRegisterWebhook,
  handleFireWebhookTest,
  ingestionJson,
  setIngestionJson,
  ingestionLogs,
  handleTriggerIngestionCall,
  webhookSimulatorConsole,
  setWebhookSimulatorConsole
}: WebhooksPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* High-Frequency Auto-Alerts Webhooks (Left) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md">
          <div className="border-b border-slate-900 pb-3 mb-4">
            <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-cyan-400 animate-pulse" />
              Instant Auto-Alert Receivers (Webhooks)
            </h3>
            <p className="text-[10px] font-sans text-slate-400 mt-1">Configure real-time alerts that get automatically pushed to your computer server.</p>
          </div>

          <form onSubmit={handleRegisterWebhook} className="space-y-4 mb-6">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono text-slate-500 uppercase">My Server Endpoint URL</label>
              <input
                id="webhook-url-input"
                type="url"
                placeholder="https://my-own-site.com/alerts/receiver"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 focus:border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-mono"
                required
              />
            </div>

            {/* Checkboxes of events */}
            <div className="p-3 bg-slate-900/10 border border-slate-900 rounded-xl space-y-2.5">
              <p className="text-[10px] font-mono text-slate-500 uppercase">Send me alerts when:</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {Object.keys(webhookEvents).map((evt) => (
                  <label key={evt} className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents[evt as keyof typeof webhookEvents]}
                      onChange={(e) => setWebhookEvents(prev => ({ ...prev, [evt]: e.target.checked }))}
                      className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-0"
                    />
                    <span>{evt.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              id="btn-register-webhook"
              type="submit"
              className="w-full py-2.5 bg-cyan-950 border border-cyan-800 hover:bg-cyan-900 text-cyan-300 text-xs font-mono font-bold rounded-xl transition cursor-pointer"
            >
              Add Auto-Alert Receiver Stream ✓
            </button>
          </form>

          {/* List of registered webhooks */}
          <div className="space-y-2 font-mono">
            <span className="text-[10px] text-slate-500 uppercase block border-b border-slate-900 pb-1 mb-2">My Active Webhook Receivers</span>
            {webhooksList.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">No receivers registered yet. Add one above!</p>
            ) : (
              webhooksList.map((wh) => (
                <div key={wh.id} className="p-3 bg-slate-900/20 border border-slate-900 rounded-xl flex flex-col gap-2">
                  <div className="flex justify-between items-start text-xs flex-wrap gap-2">
                    <div className="truncate max-w-[280px]">
                      <span className="text-white block truncate">{wh.url}</span>
                      <span className="text-[9px] text-slate-500 block">ID: {wh.id} • Created: {wh.created}</span>
                    </div>

                    <button
                      id={`btn-fire-test-webhook-${wh.id}`}
                      onClick={() => handleFireWebhookTest(wh.id)}
                      className="px-2.5 py-1 bg-cyan-950/40 border border-cyan-900 hover:bg-cyan-900/50 text-cyan-400 text-[10px] font-bold rounded-lg cursor-pointer transition shrink-0"
                    >
                      Test Fire Webhook
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {wh.events.map(ev => (
                      <span key={ev} className="px-1.5 py-0.5 bg-slate-950 text-cyan-500 text-[8px] font-bold rounded">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* TradingView Ingestion (Right) */}
      <div className="lg:col-span-6 space-y-6">
        <div className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold font-mono text-slate-200 uppercase flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                External TradingView Alert Ingest Adapter
              </h3>
              <p className="text-[10px] font-sans text-slate-400 mt-1">
                Trigger automated, real-world trades instantly on this exchange when charts hit alert lines on platforms like TradingView!
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">SIMULATED WEBHOOK BODY (JSON)</span>
              <textarea
                id="tradingview-ingestion-textarea"
                rows={5}
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
              Simulate Ingress Alert Signal 📥
            </button>

            {/* Logs console */}
            <div className="space-y-1.5 pt-3 border-t border-slate-900">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">ALERT INTEGRATION PIPELINE LOGS</span>
              <pre className="p-3 bg-slate-950 text-[10px] font-mono text-slate-400 overflow-y-auto max-h-[140px] rounded-xl border border-slate-900 space-y-1 leading-relaxed">
                {ingestionLogs.map((log, i) => (
                  <div key={i} className={log.includes('[SUCCESS]') ? 'text-emerald-400' : log.includes('[ERROR]') ? 'text-red-400' : ''}>
                    {log}
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Webhook trace overlay */}
          {webhookSimulatorConsole && (
            <div className="mt-4 p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <span className="text-slate-500 font-bold uppercase">OUTBOUND TELEMETRY TRACE</span>
                <button 
                  onClick={() => setWebhookSimulatorConsole(null)} 
                  className="text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  [Close]
                </button>
              </div>
              <pre className="text-[9px] font-mono text-cyan-400 overflow-x-auto max-h-[140px] leading-relaxed">
                <code>{webhookSimulatorConsole}</code>
              </pre>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
