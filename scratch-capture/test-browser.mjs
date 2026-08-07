import { chromium } from 'playwright';

async function main() {
  console.log('Testing chromium launch...');
  try {
    const browser = await chromium.launch({ headless: true });
    console.log('Chromium launched successfully!');
    await browser.close();
  } catch (err) {
    console.error('Chromium launch failed:', err.message);
  }
}

main();
