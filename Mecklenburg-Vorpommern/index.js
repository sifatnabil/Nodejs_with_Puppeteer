const puppeteer = require("puppeteer");
const fs = require("fs");

// const url = "https://www.kvmv.de/service/arztsuche/";
const url = "https://www.kvmv.de/ases-kvmv/ases.jsf";
const riStr = "Rheumatologie";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  await page.waitForTimeout(2000);

  const searchSel = "#asesInputForm\\:searchCriteria";

  await page.waitForSelector(searchSel);

  await page.type(searchSel, riStr);
  await page.waitForTimeout(3000);

  const cardSel =
    "div#arztlisteDataList_content div.ases-arzt-eintrag div.ases-arzt-zeile";

  const temp =
    "body > div.main > div.container.ases-main-container > div.ases-header > div";

  const fetchHcpInfo = await page.evaluate(async (sel) => {
    const cards = document.querySelectorAll(sel);
    return cards;
  }, cardSel);

  const results = fetchHcpInfo;

  for (let i = 0; i < results.length; i++) {
    console.log(results[i].outerText);
  }

  // const clickSel = "#arztlisteDataList\\:0\\:j_idt302";

  // await page.click(clickSel);

  //   await browser.close();
})();
