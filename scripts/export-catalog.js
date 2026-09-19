const fs = require('fs');
const vm = require('vm');

const inputPath = process.argv[2];
const outputPath = process.argv[3];
if (!inputPath || !outputPath) {
  throw new Error('Usage: node export-catalog.js <data.js> <output.json>');
}

const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(inputPath, 'utf8'), context);
fs.writeFileSync(outputPath, JSON.stringify(context.window.DATA), 'utf8');
