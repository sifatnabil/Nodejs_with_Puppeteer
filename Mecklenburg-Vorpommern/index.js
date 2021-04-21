const puppeteer = require("puppeteer");
const fs = require("fs");

// const url = "https://www.kvmv.de/service/arztsuche/";
const url = "https://www.kvmv.de/ases-kvmv/ases.jsf";
const riStr = "Rheumatologie";

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  await page.waitForTimeout(10000);

  const searchSel = "#asesInputForm\\:searchCriteria";

  await page.waitForSelector(searchSel);

  await page.type(searchSel, "nabil");

  console.log("typed");

  const html = await page.content();

  //   console.log(html);

  //   fs.writeFileSync("dummy.html", html, () => {});

  //   await browser.close();
})();
