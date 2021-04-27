const puppeteer = require("puppeteer");
const fs = require("fs");

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

  const nameLinkSel = ".ases-arzt-name-fachgebiet-text a";
  await page.waitForSelector(nameLinkSel);

  const nextPageBtn =
    "#arztlisteDataList_paginator_bottom > span.ui-paginator-next.ui-state-default.ui-corner-all";

  while (true) {
    await page.waitForTimeout(10000);
    const fetchHcpInfo = await page.evaluate(async () => {
      const cards = document.querySelectorAll(
        ".ases-arzt-name-fachgebiet-text a"
      );

      const details = [];

      cards.forEach(async (card, ind) => {
        card.click();
        await new Promise((resolve) => setTimeout(resolve, 30000));
        const info = document.querySelector(
          `#arztlisteDataList\\:${ind}\\:detailsPanel > div`
        );
        console.log(`Name is: ${card.outerText}`);
        // console.log(`Info is: ${info.outerText}`);
        const nameWithSpecialty = card.outerText.trim().split("\n");
        const infoArray = info.outerText.split("\n");
        const infoLength = infoArray.length;
        let foreignLanguages = "",
          additionalDesignation = "",
          additionalContracts = "";
        for (let i = 0; i < infoLength; i++) {
          if (infoArray[i].startsWith("Fremdsprachen:")) {
            foreignLanguages = infoArray[i].slice(15, infoArray[i].length - 1);
          } else if (infoArray[i].startsWith("Zusatzbezeichnungen:")) {
            additionalDesignation = infoArray[i].slice(
              21,
              infoArray[i].length - 1
            );
          } else if (infoArray[i].startsWith("Zusatzverträge:")) {
            additionalContracts = infoArray[i].slice(
              16,
              infoArray[i].length - 1
            );
          }
        }

        details.push({
          Name: nameWithSpecialty,
          "Foreign Languages": foreignLanguages,
          "Additional Designation": additionalDesignation,
          "Additional Contracts": additionalContracts,
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 30000));
      return details;
    });
    console.log(fetchHcpInfo);

    const getTabIndex = await page.evaluate((sel) => {
      const tabIndex = document.querySelector(sel).tabIndex;
      return tabIndex;
    }, nextPageBtn);

    if (getTabIndex != -1) {
      await page.click(nextPageBtn);
      console.log("Going to the next page");
    } else {
      break;
    }
  }
})();
