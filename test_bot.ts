const puppeteer = require("puppeteer");

async function runBotTest() {
  const browser = await puppeteer.launch({
    headless: false, // Si true, Puppeteer ne s'affiche pas
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page: Page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  console.log("🔍 Accès à l'application...");
  await page.goto("http://localhost:3000");

  // Attendre que le canvas soit prêt
  await page.waitForSelector("canvas");

  console.log("🖌️ Commence à dessiner...");

  const canvas = await page.$("canvas");
  if (!canvas) {
    console.error("❌ Canvas introuvable !");
    await browser.close();
    return;
  }

  const boundingBox = await canvas.boundingBox();
  if (!boundingBox) {
    console.error("❌ Impossible de récupérer les dimensions du canvas.");
    await browser.close();
    return;
  }

  // 🔹 **Simuler un dessin parfait (ex: ligne droite)**
  const startX = boundingBox.x + 50;
  const startY = boundingBox.y + 50;
  const endX = boundingBox.x + 250;
  const endY = boundingBox.y + 250;

  await page.mouse.move(startX, startY);
  await page.mouse.down();

  for (let i = 0; i <= 10; i++) {
    const x = startX + (i * (endX - startX)) / 10;
    const y = startY + (i * (endY - startY)) / 10;
    await page.mouse.move(x, y, { steps: 5 });
  }

  await page.mouse.up();

  console.log("📤 Envoi des données...");
  await page.click("button:nth-of-type(2)"); // Clique sur "Envoyer le dessin"

  // 🔍 Attendre la réponse et récupérer le résultat
  await new Promise(resolve => setTimeout(resolve, 2000));

  const result = await page.evaluate(() => {
    return document.querySelector("p")?.innerText || "Pas de réponse";
  });

  console.log("📌 **Résultat du test :**", result);

  await browser.close();
}

// Lancer le bot
runBotTest().catch(console.error);
