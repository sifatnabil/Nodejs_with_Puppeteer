const puppeteer = require("puppeteer");

const url = "https://www.arztauskunft-niedersachsen.de/ases-kvn/";
const riStr = "Rheumatologie";

(async () => {
  // Create browser instance, a page and hit the url
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Put "Rheumatologie" in the search box
  const searchBox = "#input-form-id > div > div > div > span > input";
  await page.waitForSelector(searchBox);
  await page.type(searchBox, riStr);

  // Hit the search button
  const searchBtn = "#input-form-id\\:search-button-id > span";
  await page.click(searchBtn);
  await page.waitForTimeout(2000);

  // Check to see the next button on the current page.
  const nextPageBtn =
    "#search-result-list-form-id\\:arztlisteDataList_paginator_bottom > a.ui-paginator-next.ui-state-default.ui-corner-all";

  let tabIndex = await page.evaluate((sel) => {
    return document.querySelector(sel).tabIndex;
  }, nextPageBtn);

  let pageNo = 1;

  const cardSel =
    "#search-result-list-form-id\\:arztlisteDataList_content > div > div > div";

  const links = [];

  while (true) {
    await page.waitForTimeout(2000);
    let fetchNames = await page.evaluate((sel) => {
      const cards = document.querySelectorAll(sel);
      const links = [];
      let link = "";
      cards.forEach((card) => {
        link = card.childNodes[1].childNodes[0].children[0].href;
        links.push(link);
      });
      return links;
    }, cardSel);

    // console.log(fetchNames);
    fetchNames.forEach((name) => {
      links.push(name);
    });

    tabIndex = await page.evaluate((sel) => {
      return document.querySelector(sel).tabIndex;
    }, nextPageBtn);

    if (tabIndex != -1) {
      await page.click(nextPageBtn);
      await page.waitForTimeout(1000);
    } else {
      break;
    }
  }

  console.log(links.length);

  await browser.close();
})();
