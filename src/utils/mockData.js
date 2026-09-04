export const INITIAL_MERCHANTS = [
  { id: 'm1', name: 'Cafe Cupido', upiId: 'cafecupido@bank', verified: true },
  { id: 'm2', name: 'SuperMart', upiId: 'supermart@bank', verified: true },
  { id: 'm3', name: 'Tech Store', upiId: 'techstore@bank', verified: true },
];

export const INITIAL_TRUST_HISTORY = [
  { id: 't1', name: 'Alice Smith', upiId: 'alice@bank' },
  { id: 't2', name: 'Bob Johnson', upiId: 'bob@bank' },
];

const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const INITIAL_TRANSACTIONS = [
  { id: 'txn1', recipient: 'Cafe Cupido', upiId: 'cafecupido@bank', amount: 450, status: 'Completed', date: daysAgo(0.5), isMerchant: true },
  { id: 'txn2', recipient: 'Alice Smith', upiId: 'alice@bank', amount: 1200, status: 'Completed', date: daysAgo(1), isMerchant: false },
  { id: 'txn3', recipient: 'Unknown Store', upiId: 'unknown@bank', amount: 4500, status: 'Held', date: daysAgo(1.5), isMerchant: false },
  { id: 'txn4', recipient: 'Bob Johnson', upiId: 'bob@bank', amount: 200, status: 'Completed', date: daysAgo(2), isMerchant: false },
  { id: 'txn5', recipient: 'Scammy User', upiId: 'scammer@bank', amount: 8000, status: 'Under Review', date: daysAgo(2.5), isMerchant: false },
];

// For the admin view, simulating a suspicious user's history
export const SUSPICIOUS_ACCOUNT_HISTORY = {
  accountName: 'Scammy User',
  upiId: 'scammer@bank',
  transactions: [
    { id: 'stxn1', sender: 'Victim A', amount: 8000, date: '2023-10-21T10:00:00Z' },
    { id: 'stxn2', sender: 'Victim B', amount: 9500, date: '2023-10-20T15:30:00Z' },
    { id: 'stxn3', sender: 'Victim C', amount: 7200, date: '2023-10-19T11:20:00Z' },
    { id: 'stxn4', sender: 'Victim D', amount: 9900, date: '2023-10-18T09:05:00Z' },
  ],
  status: 'Active'
};

export const isScamRecipient = (upiId = '', name = '') => {
  if (!upiId && !name) return false;
  const target = `${upiId} ${name}`.toLowerCase();
  return (
    target.includes('scam') ||
    target.includes('scammer') ||
    target.includes('fakepay') ||
    target.includes('fraud') ||
    target.includes('phish') ||
    upiId === 'scammer@fakepay' ||
    upiId === 'scammer@bank'
  );
};
