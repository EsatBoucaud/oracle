const fs = require('fs');
let data = fs.readFileSync('src/data.ts', 'utf8');

data = data.replace(/const today = new Date\(\)\.toISOString\(\)\.split\('T'\)\[0\];/, `const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};`);

data = data.replace(/updatedAt: today,/g, () => `updatedAt: getPastDate(Math.floor(Math.random() * 14)),`);

fs.writeFileSync('src/data.ts', data);
console.log('Done');
