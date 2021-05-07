const puppeteer = require("puppeteer");
const fs = require("fs");
const helper = require("./helper");

const url = "https://fiona.kvno.de/20patienten/arztsuche_mobile/index.html";

(async () => {
  // create browser and page instance and hit the url.
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url);

  // select specialty from dropdown and click search button.
  const dropdownSel = "#search_fachgebiet_1";
  const riStr = "Rheumatologie (Fachgebiet Innere Medizin)";
  const gaStr = "Gastroenterologie [Magen- / Darmkrankheiten]";
  const searchBtnSel = "#submit_bottom";
  await page.click(dropdownSel);
  await page.select(dropdownSel, gaStr);
  await page.click(searchBtnSel);

  const resultPageSel = "#arztsuche > li";
  const nextPageBtnSel = "a.next";
  const totalResult = [];

  while (true) {
    // check the number of results on the page.
    await page.waitForTimeout(3000);
    const noOfResults = await page.evaluate((sel) => {
      const resultsCount = document.querySelectorAll(sel).length;
      return resultsCount;
    }, resultPageSel);

    // Scraping starts from here.
    for (let i = 1; i <= noOfResults; i++) {
      await page.waitForTimeout(3000);
      const cardIdSel = `${resultPageSel}:nth-child(${i})`;

      const cardId = await page.evaluate((sel) => {
        const InitialId = document.querySelector(sel).id;
        const parsedId = InitialId.split("_")[1];
        return parsedId;
      }, cardIdSel);

      const cardSel = `${resultPageSel}:nth-child(${i}) > a`;
      const nameWithTitle = await page.evaluate((sel) => {
        return document.querySelector(sel).outerText.trim();
      }, cardSel);

      await page.click(cardSel);
      const cardDetailsSel = `#details_${cardId}`;
      await page.waitForSelector(cardDetailsSel);

      const [firstDiv, secondDiv, thirdDiv] = await page.evaluate((sel) => {
        const divs = document.querySelector(sel);
        const firstDiv = divs.childNodes[1].outerText.trim();
        const secondDiv = divs.childNodes[3].outerText.trim();
        const thirdDiv = divs.childNodes[5].outerText.trim();
        return [firstDiv, secondDiv, thirdDiv];
      }, cardDetailsSel);

      const details = helper(nameWithTitle, firstDiv, thirdDiv);
      //   console.log(details);

      totalResult.push(details);
      console.log(`Done for: ${nameWithTitle}`);
    }

    // check for the next button, if it exists, click it.
    const nextBtn = await page.evaluate((sel) => {
      const next = document.querySelector(sel);
      if (next) return 1;
      return 0;
    }, nextPageBtnSel);

    if (nextBtn) {
      await page.click(nextPageBtnSel);
    } else {
      break;
    }
  }

  fs.writeFile("RI.json", JSON.stringify(totalResult), () => {});

  await browser.close();
})();
