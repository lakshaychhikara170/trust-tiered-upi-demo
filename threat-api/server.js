const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ─── Keyword lists ────────────────────────────────────────────────
const PHISHING_KEYWORDS = [
  'refund', 'cashback', 'kyc', 'prize', 'winner', 'verify account',
  'verify', 'pending refund', 'reward', 'lucky draw', 'claim',
  'otp', 'blocked', 'unblock', 'activate', 'link', 'expire'
];

const SCAM_VPA_PATTERNS = [
  'scam', 'scammer', 'fakepay', 'fraud', 'phish', 'fake', 'cheat'
];

function containsPhishingKeyword(note) {
  if (!note) return false;
  const lower = note.toLowerCase();
  return PHISHING_KEYWORDS.some(kw => lower.includes(kw));
}

function isScamVpa(vpa, name) {
  const target = `${vpa} ${name}`.toLowerCase();
  return SCAM_VPA_PATTERNS.some(p => target.includes(p));
}

function severityRank(s) {
  return { NONE: 0, LOW: 1, MEDIUM: 2, HIGH: 3 }[s] ?? 0;
}

function maxSeverity(...severities) {
  return severities.reduce((best, cur) =>
    severityRank(cur) > severityRank(best) ? cur : best, 'NONE');
}

function classify(tx) {
  const {
    transaction_type, payee_vpa = '', payee_display_name = '',
    amount, is_first_time_payee, payee_account_age_days,
    user_avg_transaction_amount, user_recent_device_change,
    user_recent_location_change, request_note = '',
    known_blacklist_match,
  } = tx;

  const categories = [], severities = [], reasonParts = [], messageParts = [];

  if (known_blacklist_match || isScamVpa(payee_vpa, payee_display_name)) {
    categories.push('fake_qr');
    severities.push('HIGH');
    if (known_blacklist_match) {
      reasonParts.push('VPA matched known blacklist');
      messageParts.push('This payment address has been reported for fraud by other users.');
    } else {
      reasonParts.push('VPA contains known scam pattern keywords');
      messageParts.push('The payment address matches a known suspicious pattern.');
    }
  }

  const isMuleSignal = (payee_account_age_days !== null && payee_account_age_days !== undefined && payee_account_age_days < 7) || known_blacklist_match;
  if (isMuleSignal) {
    if (!categories.includes('mule_account_signal')) categories.push('mule_account_signal');
    if (!categories.includes('fake_qr')) {
      severities.push('HIGH');
      reasonParts.push(`payee account age ${payee_account_age_days} days (<7)`);
      messageParts.push(`This account was created very recently (${payee_account_age_days} days ago) and hasn't built a payment history yet.`);
    }
  }

  const hasPhishKeyword = containsPhishingKeyword(request_note);
  if (transaction_type === 'collect_request' && (is_first_time_payee || hasPhishKeyword)) {
    categories.push('phishing_collect');
    severities.push(hasPhishKeyword ? 'HIGH' : 'MEDIUM');
    if (hasPhishKeyword) {
      reasonParts.push(`collect request note contains phishing keyword(s)`);
      messageParts.push('This payment request uses language commonly seen in scams (like refund, KYC, or prize claims).');
    } else {
      reasonParts.push('collect request from a first-time payee');
      messageParts.push("You've received a payment request from someone you've never paid before.");
    }
  }

  if (is_first_time_payee && user_avg_transaction_amount > 0) {
    const ratio = amount / user_avg_transaction_amount;
    let fthvSeverity = ratio >= 10 ? 'HIGH' : ratio >= 3 ? 'MEDIUM' : ratio >= 1.5 ? 'LOW' : 'NONE';
    if (fthvSeverity !== 'NONE') {
      categories.push('first_time_high_value');
      severities.push(fthvSeverity);
      reasonParts.push(`amount is ${ratio.toFixed(1)}x user average`);
      messageParts.push(`You're sending ₹${amount.toLocaleString('en-IN')} to a new payee — that's ${Math.round(ratio)}× your usual amount.`);
    }
  }

  const hasBehaviorFlag = user_recent_device_change || user_recent_location_change;
  if (hasBehaviorFlag) {
    categories.push('behavioral_anomaly');
    severities.push(categories.length > 1 ? 'HIGH' : 'MEDIUM');
    const flags = [user_recent_device_change && 'device change', user_recent_location_change && 'location change'].filter(Boolean).join(' + ');
    reasonParts.push(`behavioral flags: ${flags}`);
    messageParts.push(`We noticed a ${user_recent_device_change ? 'device' : 'location'} change — please confirm this is really you.`);
  }

  if (categories.length === 0) {
    return { severity: 'NONE', categories: ['none'], user_facing_message: 'No risk signals detected. Payment looks normal.', recommended_action: 'allow', judge_facing_reasoning: 'No threat categories matched.' };
  }

  const finalSeverity = maxSeverity(...severities);
  const recommended_action = finalSeverity === 'HIGH' ? 'block_with_override' : finalSeverity === 'MEDIUM' ? 'hard_confirm' : 'soft_warn';
  const user_facing_message = messageParts[0] + (messageParts.length > 1 ? ' Additionally: ' + messageParts.slice(1).join(' ') : '');
  const judge_facing_reasoning = `${categories.length} signal(s) matched: ${categories.join(', ')}. ` + reasonParts.join('; ') + '.';

  return { severity: finalSeverity, categories, user_facing_message, recommended_action, judge_facing_reasoning };
}

// ─── HTML UI ─────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UPI Threat Classifier</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#0f1117;color:#e2e8f0;min-height:100vh;padding:24px}
  .container{max-width:900px;margin:0 auto}
  header{display:flex;align-items:center;gap:12px;margin-bottom:32px;padding-bottom:20px;border-bottom:1px solid #1e2535}
  header .logo{width:42px;height:42px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px}
  header h1{font-size:22px;font-weight:700;color:#fff}
  header p{font-size:13px;color:#64748b;margin-top:2px}
  .badge{background:#1e2535;border:1px solid #2d3748;color:#94a3b8;font-size:11px;padding:3px 8px;border-radius:20px;margin-left:8px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}
  @media(max-width:640px){.grid{grid-template-columns:1fr}}
  .card{background:#161b27;border:1px solid #1e2535;border-radius:16px;padding:24px}
  .card h2{font-size:14px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.08em;margin-bottom:20px}
  .form-group{margin-bottom:14px}
  label{display:block;font-size:12px;font-weight:600;color:#64748b;margin-bottom:5px;text-transform:uppercase;letter-spacing:.05em}
  input,select,textarea{width:100%;background:#0f1117;border:1px solid #1e2535;border-radius:8px;color:#e2e8f0;padding:9px 12px;font-size:13px;outline:none;transition:border .15s}
  input:focus,select:focus,textarea:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.15)}
  select option{background:#161b27}
  .toggle-row{display:flex;gap:16px}
  .toggle-item{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:13px;color:#94a3b8}
  .toggle-item input[type=checkbox]{width:16px;height:16px;accent-color:#6366f1}
  .btn{width:100%;padding:12px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;font-weight:700;font-size:14px;border:none;border-radius:10px;cursor:pointer;margin-top:8px;transition:opacity .15s}
  .btn:hover{opacity:.9}
  .btn:active{opacity:.8}
  .btn-secondary{background:none;border:1px solid #2d3748;color:#94a3b8;margin-top:8px}
  .result{display:none}
  .severity-badge{display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:20px;font-weight:800;font-size:15px;letter-spacing:.04em;margin-bottom:16px}
  .sev-NONE{background:#052e16;color:#4ade80;border:1px solid #16a34a}
  .sev-LOW{background:#fefce8;color:#854d0e;border:1px solid #ca8a04}
  .sev-MEDIUM{background:#431407;color:#fb923c;border:1px solid #c2410c}
  .sev-HIGH{background:#3b0764;color:#e879f9;border:1px solid #a21caf}
  .action-badge{font-size:11px;padding:3px 10px;border-radius:6px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;margin-bottom:16px;display:inline-block}
  .act-allow{background:#052e16;color:#4ade80}
  .act-soft_warn{background:#422006;color:#fb923c}
  .act-hard_confirm{background:#431407;color:#f97316}
  .act-block_with_override{background:#3b0764;color:#e879f9}
  .cats{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px}
  .cat-tag{font-size:11px;padding:3px 10px;border-radius:6px;background:#1e2535;color:#94a3b8;border:1px solid #2d3748;font-family:monospace}
  .msg-box{background:#0f1117;border:1px solid #1e2535;border-radius:10px;padding:14px;margin-bottom:12px;font-size:13px;line-height:1.6}
  .msg-label{font-size:10px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:6px}
  .msg-technical{color:#64748b;font-family:monospace;font-size:11px}
  .divider{height:1px;background:#1e2535;margin:16px 0}
  .preset-row{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}
  .preset-btn{font-size:11px;padding:5px 12px;border-radius:6px;background:#1e2535;color:#94a3b8;border:1px solid #2d3748;cursor:pointer;transition:all .15s}
  .preset-btn:hover{background:#2d3748;color:#e2e8f0}
  .ping{width:8px;height:8px;border-radius:50%;background:#4ade80;display:inline-block;animation:pulse 1.5s infinite}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
</style>
</head>
<body>
<div class="container">
  <header>
    <div class="logo">🛡️</div>
    <div>
      <h1>UPI Threat Classifier <span class="badge"><span class="ping"></span> live</span></h1>
      <p>Real-time risk classification engine · v1.0.0 · localhost:3001</p>
    </div>
  </header>

  <div style="margin-bottom:16px">
    <div class="msg-label" style="margin-bottom:8px">Quick Presets</div>
    <div class="preset-row">
      <button class="preset-btn" onclick="loadPreset('scam')">🔴 Known Scammer</button>
      <button class="preset-btn" onclick="loadPreset('phishing')">🟠 Phishing Collect</button>
      <button class="preset-btn" onclick="loadPreset('highvalue')">🟡 High Value New Payee</button>
      <button class="preset-btn" onclick="loadPreset('device')">🔵 Device Change</button>
      <button class="preset-btn" onclick="loadPreset('safe')">🟢 Safe Payment</button>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h2>Transaction Input</h2>
      <div class="form-group">
        <label>Transaction Type</label>
        <select id="transaction_type">
          <option value="send_money">send_money</option>
          <option value="collect_request">collect_request</option>
          <option value="scan_qr">scan_qr</option>
        </select>
      </div>
      <div class="form-group">
        <label>Payee VPA</label>
        <input id="payee_vpa" type="text" placeholder="e.g. alice@bank" value="refund.support@ybl">
      </div>
      <div class="form-group">
        <label>Payee Display Name</label>
        <input id="payee_display_name" type="text" placeholder="e.g. Alice Smith" value="Support Team">
      </div>
      <div class="form-group">
        <label>Amount (₹)</label>
        <input id="amount" type="number" value="45000">
      </div>
      <div class="form-group">
        <label>Your Avg Transaction Amount (₹)</label>
        <input id="user_avg" type="number" value="1500">
      </div>
      <div class="form-group">
        <label>Payee Account Age (days, leave blank if unknown)</label>
        <input id="acct_age" type="number" value="2" placeholder="null">
      </div>
      <div class="form-group">
        <label>Request Note</label>
        <input id="request_note" type="text" placeholder="e.g. refund pending" value="refund pending, pay to verify">
      </div>
      <div class="form-group">
        <div class="toggle-row">
          <label class="toggle-item"><input type="checkbox" id="first_time" checked> First time payee</label>
          <label class="toggle-item"><input type="checkbox" id="blacklist"> Blacklist match</label>
        </div>
      </div>
      <div class="form-group">
        <div class="toggle-row">
          <label class="toggle-item"><input type="checkbox" id="device_change"> Device changed</label>
          <label class="toggle-item"><input type="checkbox" id="location_change"> Location changed</label>
        </div>
      </div>
      <button class="btn" onclick="classify()">⚡ Classify Transaction</button>
      <button class="btn btn-secondary" onclick="clearResult()">Clear</button>
    </div>

    <div class="card result" id="result-card">
      <h2>Risk Verdict</h2>
      <div id="severity-badge"></div>
      <div id="action-badge"></div>
      <div class="divider"></div>
      <div id="cats-row" class="cats"></div>
      <div class="msg-box">
        <div class="msg-label">👤 User-facing message</div>
        <div id="user-msg"></div>
      </div>
      <div class="msg-box">
        <div class="msg-label">🔬 Technical reasoning (debug)</div>
        <div id="tech-msg" class="msg-technical"></div>
      </div>
    </div>

    <div class="card result" id="empty-card" style="display:flex;align-items:center;justify-content:center;flex-direction:column;gap:12px;color:#2d3748;min-height:200px">
      <div style="font-size:48px">🛡️</div>
      <div style="font-size:14px;font-weight:600">Verdict will appear here</div>
      <div style="font-size:12px">Fill in the form and click Classify</div>
    </div>
  </div>
</div>

<script>
const PRESETS = {
  scam: { transaction_type:'send_money', payee_vpa:'scammer@fakepay', payee_display_name:'Scammy User', amount:8000, user_avg:2000, acct_age:1, request_note:'', first_time:true, blacklist:true, device:false, location:false },
  phishing: { transaction_type:'collect_request', payee_vpa:'refund.support@ybl', payee_display_name:'Support Team', amount:45000, user_avg:1500, acct_age:2, request_note:'refund pending, pay to verify', first_time:true, blacklist:false, device:false, location:false },
  highvalue: { transaction_type:'send_money', payee_vpa:'newguy@upi', payee_display_name:'New Guy', amount:50000, user_avg:2000, acct_age:30, request_note:'', first_time:true, blacklist:false, device:false, location:false },
  device: { transaction_type:'send_money', payee_vpa:'bob@bank', payee_display_name:'Bob', amount:3000, user_avg:2000, acct_age:null, request_note:'', first_time:false, blacklist:false, device:true, location:true },
  safe: { transaction_type:'send_money', payee_vpa:'alice@bank', payee_display_name:'Alice Smith', amount:500, user_avg:1000, acct_age:365, request_note:'', first_time:false, blacklist:false, device:false, location:false },
};

function loadPreset(key) {
  const p = PRESETS[key];
  document.getElementById('transaction_type').value = p.transaction_type;
  document.getElementById('payee_vpa').value = p.payee_vpa;
  document.getElementById('payee_display_name').value = p.payee_display_name;
  document.getElementById('amount').value = p.amount;
  document.getElementById('user_avg').value = p.user_avg;
  document.getElementById('acct_age').value = p.acct_age ?? '';
  document.getElementById('request_note').value = p.request_note;
  document.getElementById('first_time').checked = p.first_time;
  document.getElementById('blacklist').checked = p.blacklist;
  document.getElementById('device_change').checked = p.device;
  document.getElementById('location_change').checked = p.location;
}

async function classify() {
  const acctAge = document.getElementById('acct_age').value;
  const body = {
    transaction_type: document.getElementById('transaction_type').value,
    payee_vpa: document.getElementById('payee_vpa').value,
    payee_display_name: document.getElementById('payee_display_name').value,
    amount: Number(document.getElementById('amount').value),
    user_avg_transaction_amount: Number(document.getElementById('user_avg').value),
    payee_account_age_days: acctAge === '' ? null : Number(acctAge),
    request_note: document.getElementById('request_note').value,
    is_first_time_payee: document.getElementById('first_time').checked,
    known_blacklist_match: document.getElementById('blacklist').checked,
    user_recent_device_change: document.getElementById('device_change').checked,
    user_recent_location_change: document.getElementById('location_change').checked,
    time_of_day: new Date().toTimeString().slice(0,5),
    registered_bank_name: null
  };

  try {
    const res = await fetch('/classify', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    const data = await res.json();
    showResult(data);
  } catch(e) {
    alert('Error: ' + e.message);
  }
}

const SEV_ICONS = { NONE:'✅', LOW:'⚠️', MEDIUM:'🟠', HIGH:'🔴' };
const ACT_LABELS = { allow:'✅ Allow', soft_warn:'⚠️ Soft Warning', hard_confirm:'🔒 Require Confirmation', block_with_override:'🚫 Block (Override Required)' };

function showResult(data) {
  document.getElementById('empty-card').style.display = 'none';
  const rc = document.getElementById('result-card');
  rc.style.display = 'block';

  document.getElementById('severity-badge').innerHTML =
    '<span class="severity-badge sev-' + data.severity + '">' + SEV_ICONS[data.severity] + ' ' + data.severity + '</span>';

  document.getElementById('action-badge').innerHTML =
    '<span class="action-badge act-' + data.recommended_action + '">' + ACT_LABELS[data.recommended_action] + '</span>';

  document.getElementById('cats-row').innerHTML = data.categories.map(c =>
    '<span class="cat-tag">' + c + '</span>'
  ).join('');

  document.getElementById('user-msg').textContent = data.user_facing_message;
  document.getElementById('tech-msg').textContent = data.judge_facing_reasoning;
}

function clearResult() {
  document.getElementById('result-card').style.display = 'none';
  document.getElementById('empty-card').style.display = 'flex';
}

// Load phishing preset by default
loadPreset('phishing');
</script>
</body>
</html>`);
});

app.post('/classify', (req, res) => {
  const tx = req.body;
  const required = ['transaction_type', 'payee_vpa', 'amount'];
  const missing = required.filter(k => tx[k] === undefined || tx[k] === null || tx[k] === '');
  if (missing.length > 0) return res.status(400).json({ error: 'Missing required fields', missing });
  try { return res.json(classify(tx)); }
  catch (err) { return res.status(500).json({ error: 'Classifier error', detail: err.message }); }
});

app.get('/test', (req, res) => {
  const ex = { transaction_type:'collect_request', payee_vpa:'refund.support@ybl', payee_display_name:'Support Team', registered_bank_name:null, amount:45000, is_first_time_payee:true, payee_account_age_days:2, user_avg_transaction_amount:1500, user_recent_device_change:false, user_recent_location_change:false, request_note:'refund pending, pay to verify', known_blacklist_match:false, time_of_day:'14:30' };
  res.json({ input: ex, output: classify(ex) });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log('');
  console.log('  UPI Threat Classifier running at http://localhost:3001');
  console.log('  Open your browser to see the full UI!');
  console.log('');
});
