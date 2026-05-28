import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  let data;
  try {
    const p = path.join(__dirname, '..', '..', 'public', 'scores.json');
    data = JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (e) {
    return res.status(503).json({ error: 'scores.json unavailable', detail: e.message });
  }

  const ticker = (req.query.ticker || '').toUpperCase();
  const company = (data.companies || []).find(c => c.ticker === ticker);

  if (!company) {
    return res.status(404).json({ error: `ticker ${ticker} not found` });
  }
  res.status(200).json(company);
}
