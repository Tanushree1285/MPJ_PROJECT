const fs = require('fs');

const files = [
  './frontend/src/pages/QuickPay.tsx',
  './frontend/src/pages/Transactions.tsx',
  './frontend/src/pages/Vaults.tsx',
  './frontend/src/pages/Dashboard.tsx'
];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Replace Template Literal prefixes: `$${`  => `₹${`
  content = content.replace(/\$\$\{/g, '₹${');
  
  // Replace `$` inside a backtick string: `$` => `₹`
  content = content.replace(/\`\$/g, '`₹');

  // Replace >$ (like inside HTML text: <p>$100</p>)
  content = content.replace(/\>\$/g, '>₹');

  // Replace '$' string prefixes
  content = content.replace(/\'\$/g, '\'₹');

  // Replace prefix="$" property
  content = content.replace(/prefix=\"\$\"/g, 'prefix="₹"');

  fs.writeFileSync(f, content);
});

console.log("Currency updated.");
