const puppeteer = require("puppeteer");
const fs = require("fs");

const url = "https://www.kvmv.de/ases-kvmv/ases.jsf";
const riStr = "Rheumatologie";
const gaStr = "gastroenterologie";

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

  await page.type(searchSel, gaStr);

  const nameLinkSel = ".ases-arzt-name-fachgebiet-text a";
  await page.waitForSelector(nameLinkSel);

  const nextPageBtn =
    "#arztlisteDataList_paginator_bottom > span.ui-paginator-next.ui-state-default.ui-corner-all";

  const resultsAr = [];

  while (true) {
    await page.waitForTimeout(40000);
    const fetchHcpInfo = await page.evaluate(async () => {
      const cards = document.querySelectorAll(
        ".ases-arzt-name-fachgebiet-text a"
      );
      const details = [];

      cards.forEach(async (card, ind) => {
        card.click();
        await new Promise((resolve) => setTimeout(resolve, 30000));
        const workplaces = document.querySelectorAll(
          "div.ui-tabs-navscroller > ul > li > a"
        );

        workplaces.forEach((workplace) => {
          workplace.click();
        });

        await new Promise((resolve) => setTimeout(resolve, 10000));

        const subSections = document.querySelectorAll(
          `#arztlisteDataList\\:${ind}\\:detailsTabView > div.ui-tabs-navscroller > ul > li`
        );

        const subSectionsAr = [];
        for (let j = 0; j < subSections.length; j++) {
          const moreInfo = document.querySelector(
            `#arztlisteDataList\\:${ind}\\:detailsTabView\\:${j}\\:result-praxis > div:nth-child(1)`
          ).outerText;
          const additionalMoreInfo = document.querySelector(
            `#arztlisteDataList\\:${ind}\\:detailsTabView\\:${j}\\:result-praxis > div.ases-leistungsort-taetigkeit > ul`
          ).outerText;
          subSectionsAr.push(moreInfo + "\n" + additionalMoreInfo);
        }

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
          "Additional Info": subSectionsAr,
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 50000));
      return details;
    });
    const results = fetchHcpInfo;

    for (const result of results) {
      resultsAr.push(result);
    }

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

  fs.writeFile("result_ga.json", "[", () => {});
  for (const result of resultsAr) {
    fs.appendFile("result_ga.json", JSON.stringify(result) + ",", () => {});
  }
  fs.appendFile("result_ga.json", "]", () => {});

  await browser.close();
})();
