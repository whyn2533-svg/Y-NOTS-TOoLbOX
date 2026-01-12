
export enum ATMAttackState {
  IDLE = 'IDLE',
  SCANNING = 'SCANNING',
  CARD_DETECTED = 'CARD_DETECTED',
  PIN_BYPASS = 'PIN_BYPASS',
  AMOUNT_SELECTION = 'AMOUNT_SELECTION',
  TRANSACTION_PROCESSING = 'TRANSACTION_PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export interface ATMAccount {
  accountNumber: string;
  balance: number;
  pin: string;
  lastActivity: number;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  data?: any;
}

export interface AnalysisResult {
  vulnerabilityScore: number;
  threatType: string;
  recommendations: string[];
  summary: string;
}
