import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const p    = path.join(__dirname, '..', 'public', 'scores.json');
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    const meta = data.metadata || {};
    res.status(200).json({
      status:          'ok',
      company_count:   (data.companies || []).length,
      model_version:   meta.model_version,
      last_updated:    meta.last_updated,
      positive_count:  meta.positive_count,
    });
  } catch (e) {
    res.status(503).json({ status: 'error', error: e.message });
  }
}
