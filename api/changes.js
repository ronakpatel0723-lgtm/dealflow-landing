import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const p = path.join(__dirname, '..', 'public', 'score_changes.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    res.status(200).json(data);
  } catch (e) {
    res.status(503).json({ error: 'score_changes.json unavailable', detail: e.message });
  }
}
