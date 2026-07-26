'use strict';
const { buildDriver } = require('./config/browserConfig');
const { By } = require('selenium-webdriver');

async function check() {
  const d = await buildDriver();
  try {
    await d.get('http://localhost:5173/#/role');
    await new Promise(r => setTimeout(r, 3000));

    const result = await d.executeScript(`
      const cards = document.querySelectorAll('.role-card');
      if (!cards.length) return 'no cards';
      const card = cards[0];
      const keys = Object.keys(card).filter(k => k.startsWith('__react'));
      return 'react keys: ' + keys.join(', ');
    `);
    console.log(result);

    // Try invoking React fiber onClick
    const clickResult = await d.executeScript(`
      const cards = document.querySelectorAll('.role-card');
      const card = cards[0];
      const fiberKey = Object.keys(card).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
      if (!fiberKey) return 'no fiber key';
      let fiber = card[fiberKey];
      let depth = 0;
      while (fiber && depth < 50) {
        if (fiber.memoizedProps && typeof fiber.memoizedProps.onClick === 'function') {
          fiber.memoizedProps.onClick({preventDefault:()=>{}, stopPropagation:()=>{}});
          return 'invoked onClick at depth ' + depth;
        }
        fiber = fiber.return;
        depth++;
      }
      return 'onClick not found after ' + depth + ' levels';
    `);
    console.log('click result:', clickResult);

    await new Promise(r => setTimeout(r, 2000));
    console.log('URL after:', await d.getCurrentUrl());
  } finally {
    await d.quit();
  }
}
check().catch(e => { console.error('ERR:', e.message.substring(0, 200)); process.exit(1); });
