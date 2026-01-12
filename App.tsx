
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ATMAttackState, ATMAccount, LogEntry, AnalysisResult } from './types';
import { analyzeNFCLogs } from './services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// --- Helper Components ---

const StatusBadge: React.FC<{ state: ATMAttackState }> = ({ state }) => {
  const colors: Record<string, string> = {
    [ATMAttackState.IDLE]: 'bg-gray-600',
    [ATMAttackState.SCANNING]: 'bg-yellow-500 animate-pulse',
    [ATMAttackState.CARD_DETECTED]: 'bg-blue-500',
    [ATMAttackState.PIN_BYPASS]: 'bg-orange-500',
    [ATMAttackState.AMOUNT_SELECTION]: 'bg-purple-500',
    [ATMAttackState.TRANSACTION_PROCESSING]: 'bg-indigo-500 animate-pulse',
    [ATMAttackState.COMPLETED]: 'bg-green-500',
    [ATMAttackState.FAILED]: 'bg-red-500',
  };

  return (
    <span className={`${colors[state] || 'bg-gray-500'} text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider`}>
      {state.replace(/_/g, ' ')}
    </span>
  );
};

// --- Main App ---

const App: React.FC = () => {
  const [state, setState] = useState<ATMAttackState>(ATMAttackState.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [accounts, setAccounts] = useState<ATMAccount[]>([
    { accountNumber: '4532 **** **** 1092', balance: 1450.50, pin: '1234', lastActivity: Date.now() },
    { accountNumber: '5102 **** **** 8831', balance: 520.00, pin: '4321', lastActivity: Date.now() - 3600000 },
  ]);
  const [selectedAmount, setSelectedAmount] = useState<number>(0);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO', data?: any) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      level,
      message,
      data
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Simulation Logic
  const startSimulation = async () => {
    setAnalysis(null);
    setState(ATMAttackState.SCANNING);
    addLog('NFC Controller initialized. Listening for targets...', 'INFO');

    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setState(ATMAttackState.CARD_DETECTED);
    addLog('Target Card Detected: ISO/IEC 14443 Type A', 'SUCCESS', { uid: '04:A2:F1:C9' });
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setState(ATMAttackState.PIN_BYPASS);
    addLog('Executing PIN Bypass Payload (Modifying 0x9F34 CVM Results)...', 'WARNING');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    addLog('CVM verification bypassed. Authorized for Offline PIN.', 'SUCCESS');
    
    setState(ATMAttackState.AMOUNT_SELECTION);
    const amount = Math.floor(Math.random() * 200) + 20;
    setSelectedAmount(amount);
    addLog(`Force-selecting withdrawal amount: $${amount}`, 'INFO');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setState(ATMAttackState.TRANSACTION_PROCESSING);
    addLog('Broadcasting encrypted payload to reader...', 'INFO');
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    setState(ATMAttackState.COMPLETED);
    addLog(`Simulation complete. Transaction accepted by mock gateway. Total: $${amount}`, 'SUCCESS');
  };

  const handleAnalyze = async () => {
    if (logs.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeNFCLogs(logs);
      setAnalysis(result);
      addLog('Gemini AI Analysis complete.', 'SUCCESS');
    } catch (err) {
      addLog('Failed to analyze logs with Gemini.', 'ERROR');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetSimulator = () => {
    setState(ATMAttackState.IDLE);
    setLogs([]);
    setSelectedAmount(0);
    setAnalysis(null);
  };

  const chartData = logs.filter(l => l.level === 'SUCCESS' || l.level === 'WARNING').map((l, i) => ({
    time: i,
    val: l.level === 'SUCCESS' ? 100 : 50
  }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-md border-b border-blue-900/50 p-4 sticky top-0 z-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg glow-border">
            <i className="fas fa-shield-halved text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-blue-100">NFC SHIELD <span className="text-blue-500 font-light">RESEARCH</span></h1>
            <p className="text-[10px] mono text-blue-400 uppercase tracking-widest">Vulnerability Simulation Engine v4.0.1</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs text-gray-400 uppercase">System Integrity</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-4 h-1 bg-green-500 rounded-full"></div>)}
            </div>
          </div>
          <button 
            onClick={resetSimulator}
            className="hover:text-red-400 transition-colors"
            title="Reset All Systems"
          >
            <i className="fas fa-power-off text-lg"></i>
          </button>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
        
        {/* Left Column: Accounts & Controls */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 overflow-hidden relative">
            <h2 className="text-sm font-semibold mb-4 text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-users text-blue-500"></i> Mock Accounts
            </h2>
            <div className="space-y-3">
              {accounts.map((acc, idx) => (
                <div key={idx} className="bg-black/40 border border-gray-800 p-3 rounded-lg hover:border-blue-500/50 transition-all cursor-pointer group">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs mono text-blue-300">{acc.accountNumber}</span>
                    <i className="fas fa-credit-card text-gray-600 group-hover:text-blue-500 transition-colors"></i>
                  </div>
                  <div className="text-lg font-bold">${acc.balance.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500 uppercase">PIN: {acc.pin}</div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-semibold transition-all">
              + ADD RESEARCH TARGET
            </button>
          </div>

          <div className="bg-blue-900/10 border border-blue-900/30 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-4 text-blue-400 uppercase tracking-widest">Session Control</h2>
            <div className="space-y-3">
              <button 
                onClick={startSimulation}
                disabled={state !== ATMAttackState.IDLE}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  state === ATMAttackState.IDLE ? 'bg-blue-600 hover:bg-blue-500 shadow-lg glow-border' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <i className="fas fa-bolt"></i> START SIMULATION
              </button>
              <button 
                onClick={handleAnalyze}
                disabled={logs.length === 0 || isAnalyzing}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  logs.length > 0 ? 'bg-indigo-600 hover:bg-indigo-500 shadow-lg' : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isAnalyzing ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-brain"></i>}
                AI VULNERABILITY ANALYSIS
              </button>
            </div>
          </div>
        </div>

        {/* Middle Column: Terminal & Visualizer */}
        <div className="lg:col-span-6 space-y-4">
          {/* Terminal */}
          <div className="bg-black border border-gray-800 rounded-xl overflow-hidden flex flex-col h-[500px] shadow-2xl">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-800 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/30"></div>
              </div>
              <div className="text-xs mono text-gray-500 uppercase tracking-widest">NFC_RESEARCH_LOGS.bin</div>
              <StatusBadge state={state} />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 mono text-sm scrollbar-thin scrollbar-thumb-gray-800">
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 opacity-50">
                  <i className="fas fa-terminal text-4xl mb-4"></i>
                  <p>READY TO INTERCEPT...</p>
                </div>
              )}
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3 group">
                  <span className="text-gray-600 whitespace-nowrap">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`font-bold ${
                    log.level === 'SUCCESS' ? 'text-green-400' : 
                    log.level === 'WARNING' ? 'text-yellow-400' : 
                    log.level === 'ERROR' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    {log.level}:
                  </span>
                  <span className="text-gray-300">{log.message}</span>
                  {log.data && (
                    <div className="hidden group-hover:block ml-auto text-[10px] bg-gray-800 px-1 rounded text-gray-400">
                      {JSON.stringify(log.data)}
                    </div>
                  )}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
            {state === ATMAttackState.SCANNING && (
              <div className="h-1 bg-gray-900 relative">
                <div className="scan-line"></div>
              </div>
            )}
          </div>

          {/* Metrics Visualization */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 h-[200px]">
            <h2 className="text-xs font-semibold mb-2 text-gray-500 uppercase tracking-widest flex justify-between">
              <span>NFC Signal Strength & Data Throughput</span>
              <span className="text-blue-500">13.56 MHz / 848 kbit/s</span>
            </h2>
            <div className="w-full h-full pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.length > 0 ? chartData : [{time: 0, val: 0}, {time: 1, val: 5}, {time: 2, val: 2}]}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="val" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Reports */}
        <div className="lg:col-span-3 space-y-4">
          <div className={`bg-gray-900/50 border rounded-xl p-5 transition-all duration-500 ${analysis ? 'border-indigo-500/50' : 'border-gray-800'}`}>
            <h2 className="text-sm font-semibold mb-4 text-indigo-400 uppercase tracking-widest flex items-center gap-2">
              <i className="fas fa-brain"></i> AI Analysis Report
            </h2>
            
            {!analysis ? (
              <div className="text-center py-12">
                <i className="fas fa-robot text-4xl text-gray-700 mb-4 opacity-20"></i>
                <p className="text-xs text-gray-500 px-4 italic leading-relaxed">
                  Run simulation and click "AI Analysis" to generate threat intelligence from logs.
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-400">Risk Score</span>
                    <span className={`text-lg font-bold ${analysis.vulnerabilityScore > 70 ? 'text-red-500' : 'text-yellow-500'}`}>
                      {analysis.vulnerabilityScore}/100
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${analysis.vulnerabilityScore > 70 ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ width: `${analysis.vulnerabilityScore}%` }}
                    ></div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Detected Threat</h3>
                  <div className="bg-indigo-900/20 border border-indigo-500/30 p-2 rounded text-indigo-200 text-sm font-semibold">
                    {analysis.threatType}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Defense Recommendations</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-gray-300 flex gap-2">
                        <i className="fas fa-shield-check text-green-500 mt-0.5"></i>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <p className="text-[10px] leading-relaxed text-gray-400 text-justify italic">
                    {analysis.summary}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
             <h2 className="text-xs font-semibold mb-3 text-gray-500 uppercase tracking-widest">Protocol Stats</h2>
             <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-black/30 p-2 rounded border border-gray-800">
                  <div className="text-blue-500 font-bold">14443-A</div>
                  <div className="text-[10px] text-gray-600">Standard</div>
                </div>
                <div className="bg-black/30 p-2 rounded border border-gray-800">
                  <div className="text-blue-500 font-bold">848kbps</div>
                  <div className="text-[10px] text-gray-600">Bitrate</div>
                </div>
                <div className="bg-black/30 p-2 rounded border border-gray-800">
                  <div className="text-blue-500 font-bold">EMV-L1</div>
                  <div className="text-[10px] text-gray-600">Kernel</div>
                </div>
                <div className="bg-black/30 p-2 rounded border border-gray-800">
                  <div className="text-blue-500 font-bold">DESFire</div>
                  <div className="text-[10px] text-gray-600">Chipset</div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Footer / Notification Bar */}
      <footer className="bg-gray-900 border-t border-gray-800 p-2 flex justify-between items-center text-[10px] mono text-gray-500 px-6">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><i className="fas fa-circle text-green-500 text-[6px]"></i> API_GATEWAY: CONNECTED</span>
          <span className="flex items-center gap-1"><i className="fas fa-circle text-green-500 text-[6px]"></i> GEMINI_LLM: READY</span>
        </div>
        <div>
          &copy; {new Date().getFullYear()} NFC SHIELD SECURITY RESEARCH | INTERNAL USE ONLY
        </div>
      </footer>
    </div>
  );
};

export default App;
