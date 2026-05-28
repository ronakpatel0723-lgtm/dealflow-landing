const fs   = require('fs');
const path = require('path');

function loadScores() {
  const p = path.join(__dirname, '..', 'public', 'scores.json');
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  let data;
  try {
    data = loadScores();
  } catch (e) {
    return res.status(503).json({ error: 'scores.json unavailable', detail: e.message });
  }

  let companies = data.companies || [];

  const { tier, sector, page = '1', per_page = '20' } = req.query;
  if (tier)   companies = companies.filter(c => c.tier   && c.tier.toLowerCase()   === tier.toLowerCase());
  if (sector) companies = companies.filter(c => c.sector && c.sector.toLowerCase() === sector.toLowerCase());

  const perPage = Math.min(100, Math.max(1, parseInt(per_page) || 20));
  const pageNum  = Math.max(1, parseInt(page) || 1);
  const offset   = (pageNum - 1) * perPage;

  res.status(200).json({
    total:    companies.length,
    page:     pageNum,
    per_page: perPage,
    pages:    Math.ceil(companies.length / perPage),
    companies: companies.slice(offset, offset + perPage),
  });
};
