/**
 * Fincept Terminal - Trading Simulator
 * Paper trading with virtual account
 */

import { promises as fs } from 'fs';
import path from 'path';
import { webSearch, askAI } from '@/lib/ai-sdk';
import { ok, isOk, type Result } from '@/lib/types';
import type { Account, Position, Order } from './types';

const TRADING_DIR = path.join('/home/z/my-project/workspaces', 'fincept-terminal', 'trading');
const ACCOUNT_FILE = path.join(TRADING_DIR, 'account.json');

const DEFAULT_ACCOUNT: Account = {
  balance: 100000,
  totalValue: 100000,
  totalPnl: 0,
  totalPnlPercent: 0,
  positions: [],
  orders: [],
};

let accountCache: Account | null = null;

async function ensureDir(): Promise<void> {
  await fs.mkdir(TRADING_DIR, { recursive: true });
}

async function loadAccount(): Promise<Account> {
  if (accountCache) return accountCache;
  try {
    await ensureDir();
    const data = await fs.readFile(ACCOUNT_FILE, 'utf-8');
    accountCache = JSON.parse(data) as Account;
    return accountCache;
  } catch {
    accountCache = { ...DEFAULT_ACCOUNT };
    return accountCache;
  }
}

async function saveAccount(account: Account): Promise<void> {
  accountCache = account;
  try {
    await ensureDir();
    const tempPath = `${ACCOUNT_FILE}.tmp.${Date.now()}`;
    await fs.writeFile(tempPath, JSON.stringify(account, null, 2), 'utf-8');
    await fs.rename(tempPath, ACCOUNT_FILE);
  } catch (error) {
    console.error('[Fincept Trading] Save failed:', error);
  }
}

/** Get current account info */
export async function getAccount(): Promise<Account> {
  const account = await loadAccount();

  // Update current prices for positions
  for (const pos of account.positions) {
    const priceResult = await getCurrentPrice(pos.ticker);
    if (isOk(priceResult)) {
      pos.currentPrice = priceResult.value;
      pos.value = pos.shares * pos.currentPrice;
      pos.pnl = (pos.currentPrice - pos.avgPrice) * pos.shares;
      pos.pnlPercent = ((pos.currentPrice - pos.avgPrice) / pos.avgPrice) * 100;
    }
  }

  // Recalculate totals
  const positionsValue = account.positions.reduce((sum, p) => sum + p.value, 0);
  account.totalValue = account.balance + positionsValue;
  account.totalPnl = account.totalValue - DEFAULT_ACCOUNT.balance;
  account.totalPnlPercent = (account.totalPnl / DEFAULT_ACCOUNT.balance) * 100;

  return account;
}

/** Place a buy order */
export async function placeBuyOrder(ticker: string, shares: number): Promise<Result<Order>> {
  const account = await loadAccount();
  const priceResult = await getCurrentPrice(ticker);

  if (!isOk(priceResult)) {
    return ok({
      id: `order-${Date.now()}`,
      ticker, type: 'buy', shares, price: 0,
      timestamp: new Date().toISOString(), status: 'cancelled',
    });
  }

  const price = priceResult.value;
  const totalCost = price * shares;

  if (totalCost > account.balance) {
    return ok({
      id: `order-${Date.now()}`,
      ticker, type: 'buy', shares, price,
      timestamp: new Date().toISOString(), status: 'cancelled',
    });
  }

  // Execute buy
  account.balance -= totalCost;

  const existingPos = account.positions.find(p => p.ticker === ticker);
  if (existingPos) {
    const totalShares = existingPos.shares + shares;
    existingPos.avgPrice = (existingPos.avgPrice * existingPos.shares + price * shares) / totalShares;
    existingPos.shares = totalShares;
    existingPos.currentPrice = price;
    existingPos.value = totalShares * price;
  } else {
    account.positions.push({
      ticker,
      name: ticker,
      shares,
      avgPrice: price,
      currentPrice: price,
      value: price * shares,
      pnl: 0,
      pnlPercent: 0,
    });
  }

  const order: Order = {
    id: `order-${Date.now()}`,
    ticker, type: 'buy', shares, price,
    timestamp: new Date().toISOString(), status: 'filled',
  };

  account.orders.unshift(order);
  await saveAccount(account);
  return ok(order);
}

/** Place a sell order */
export async function placeSellOrder(ticker: string, shares: number): Promise<Result<Order>> {
  const account = await loadAccount();
  const position = account.positions.find(p => p.ticker === ticker);

  if (!position || position.shares < shares) {
    return ok({
      id: `order-${Date.now()}`,
      ticker, type: 'sell', shares, price: 0,
      timestamp: new Date().toISOString(), status: 'cancelled',
    });
  }

  const priceResult = await getCurrentPrice(ticker);
  if (!isOk(priceResult)) {
    return ok({
      id: `order-${Date.now()}`,
      ticker, type: 'sell', shares, price: 0,
      timestamp: new Date().toISOString(), status: 'cancelled',
    });
  }

  const price = priceResult.value;
  account.balance += price * shares;

  position.shares -= shares;
  if (position.shares === 0) {
    account.positions = account.positions.filter(p => p.ticker !== ticker);
  }

  const order: Order = {
    id: `order-${Date.now()}`,
    ticker, type: 'sell', shares, price,
    timestamp: new Date().toISOString(), status: 'filled',
  };

  account.orders.unshift(order);
  await saveAccount(account);
  return ok(order);
}

/** Get current price for a ticker via web search */
async function getCurrentPrice(ticker: string): Promise<Result<number>> {
  const searchResult = await webSearch({ query: `${ticker} stock price current today 2025`, num: 3 });
  if (!isOk(searchResult)) return ok(0);

  const parseResult = await askAI(
    `What is the current stock price of ${ticker}? Return ONLY a number.\n\n${searchResult.value.map(r => r.snippet).join('\n')}`,
    'Return only a number.',
    'small',
  );

  if (isOk(parseResult)) {
    const price = parseFloat(parseResult.value.text.replace(/[^0-9.]/g, ''));
    if (!isNaN(price) && price > 0) return ok(price);
  }

  return ok(0);
}

/** Reset account to default */
export async function resetAccount(): Promise<Account> {
  accountCache = { ...DEFAULT_ACCOUNT, positions: [], orders: [] };
  await saveAccount(accountCache);
  return accountCache;
}
