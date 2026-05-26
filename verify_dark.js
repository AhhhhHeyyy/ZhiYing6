const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const abs = path.resolve('index.html').split('\').join('/');
  const fileUrl = 'file:///' + abs;
  await page.goto(fileUrl, { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'verify_light.png' });

  const btn = await page.$('#themeToggle');
  console.log('Toggle button exists:', btn !== null);

  const moonVisible = await page.evaluate(() => {
    const moon = document.querySelector('.toggle-moon');
    return moon && getComputedStyle(moon).display !== 'none';
  });
  console.log('Moon visible (light):', moonVisible);

  const sunVisibleLight = await page.evaluate(() => {
    const sun = document.querySelector('.toggle-sun');
    return sun && getComputedStyle(sun).display !== 'none';
  });
  console.log('Sun visible (light):', sunVisibleLight);

  await btn.click();
  await page.waitForTimeout(600);

  await page.screenshot({ path: 'verify_dark_mode.png' });

  const isDark = await page.evaluate(() => document.body.classList.contains('dark-mode'));
  console.log('dark-mode class applied:', isDark);

  const storedTheme = await page.evaluate(() => localStorage.getItem('theme'));
  console.log('localStorage theme:', storedTheme);

  const darkBodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  console.log('Body bg (dark):', darkBodyBg);

  const sunVisibleDark = await page.evaluate(() => {
    const sun = document.querySelector('.toggle-sun');
    return sun && getComputedStyle(sun).display !== 'none';
  });
  console.log('Sun visible (dark):', sunVisibleDark);

  // Test toggle back
  await btn.click();
  await page.waitForTimeout(400);
  const backToLight = await page.evaluate(() => !document.body.classList.contains('dark-mode'));
  console.log('Toggle back to light:', backToLight);

  // Test persistence: reload with dark in localStorage
  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload({ waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  const persistedDark = await page.evaluate(() => document.body.classList.contains('dark-mode'));
  console.log('Persisted dark on reload:', persistedDark);

  await page.screenshot({ path: 'verify_dark_reload.png' });

  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
