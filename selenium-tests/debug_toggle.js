'use strict';
const { buildDriver } = require('./config/browserConfig');
async function check() {
  const d = await buildDriver();
  try {
    await d.get('http://localhost:5173/#/auth?role=doctor');
    await new Promise(r => setTimeout(r, 2000));

    const before = await d.executeScript(
      "var el=document.querySelector('.auth-header h2'); return el?el.textContent.trim():'';"
    );
    console.log('Before toggle:', before);

    const toggleText = await d.executeScript(
      "var el=document.querySelector('.text-link'); return el?el.textContent.trim():'';"
    );
    console.log('Toggle link text before:', toggleText);

    // Check React props on toggle button
    const propsInfo = await d.executeScript(`
      var btn = document.querySelector('.text-link');
      if (!btn) return 'no .text-link found';
      var pk = Object.keys(btn).find(function(k){ return k.startsWith('__reactProps'); });
      if (pk) {
        return 'has reactProps key: ' + pk + ', onClick: ' + typeof btn[pk].onClick;
      }
      return 'no reactProps key. Keys: ' + Object.keys(btn).filter(function(k){ return k.startsWith('__react'); }).join(', ');
    `);
    console.log('Props info:', propsInfo);

    // Execute our toggleMode code
    const result = await d.executeScript(`
      var btn = document.querySelector('.text-link');
      if (!btn) return 'no button';
      var pk = Object.keys(btn).find(function(k){ return k.startsWith('__reactProps'); });
      if (pk && btn[pk] && typeof btn[pk].onClick === 'function') {
        btn[pk].onClick({ preventDefault: function(){}, stopPropagation: function(){} });
        return 'fired via reactProps';
      }
      btn.click();
      return 'fired via .click()';
    `);
    console.log('Toggle result:', result);

    await new Promise(r => setTimeout(r, 1000));

    const after = await d.executeScript(
      "var el=document.querySelector('.auth-header h2'); return el?el.textContent.trim():'';"
    );
    console.log('After toggle:', after);

    const toggleTextAfter = await d.executeScript(
      "var el=document.querySelector('.text-link'); return el?el.textContent.trim():'';"
    );
    console.log('Toggle link text after:', toggleTextAfter);

  } finally {
    await d.quit();
  }
}
check().catch(e => { console.error('ERR:', e.message.substring(0, 200)); process.exit(1); });
