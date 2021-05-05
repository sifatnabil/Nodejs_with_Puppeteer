const puppeteer = require("puppeteer");
const fs = require("fs");

// const url =
//   "https://dienste.kvb.de/arztsuche/app/suchergebnisse.htm?hashwert=c7fd4e82bc29a243a9f33416387c42cd";

const url =
  "https://dienste.kvb.de/arztsuche/app/suchergebnisse.htm?hashwert=1653bc503844aa3adf83c8ca87052";

(async () => {
  // Create browser instance and page.
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  // Go to the page, wait for 2 seconds and click 'accept' on the popup
  // and wait 2 more seconds just in case the page refreshes.
  await page.goto(url);
  await page.waitForTimeout(2000);
  const mapsAllowBtnSel = "#mapsAllowedButton";
  await page.click(mapsAllowBtnSel);
  await page.waitForTimeout(2000);

  // Run a loop as long as there is a next button
  // to visit every page and extract info.
  const nextBtnSel = "input[value='nächste Seite']";
  const tableSel = "table.suchergebnisse_praxis_innere_tabelle";
  const totalResults = [];
  while (true) {
    await page.waitForSelector(".suchergebnisse_liste");
    await page.waitForTimeout(3000);

    const resultDetails = await page.evaluate(async (sel) => {
      const tables = document.querySelectorAll(sel);
      const details = [];
      tables.forEach(async (table) => {
        const tableBody = table.childNodes[1].childNodes[2];
        const nameWithSpecialty = tableBody.childNodes[3].outerText
          .split("\n")
          .toString();
        const otherDetails = tableBody.childNodes[5].outerText;
        const officeHour = tableBody.childNodes[7].outerText;
        const moreInfoBtnSel = table.childNodes[1].childNodes[4].childNodes[8];
        await table.click(moreInfoBtnSel);
        const additionalInfo = table.childNodes[1].childNodes[6].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[2].childNodes[3].innerText.trim();
        const additionalInfo2 = table.childNodes[1].childNodes[6].childNodes[1].childNodes[1].childNodes[1].childNodes[1].childNodes[2].childNodes[5].innerText.trim();
        console.log(additionalInfo);
        console.log(additionalInfo2);
        await new Promise((resolve) => setTimeout(resolve, 2 * 1000));
        details.push({
          "Name and Specialty": nameWithSpecialty,
          "Other Details": otherDetails,
          "Office Hours": officeHour,
          "Additional Info 1": additionalInfo,
          "Additional Info 2": additionalInfo2,
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 20 * 1000));
      return details;
    }, tableSel);

    totalResults.push(...resultDetails);

    const nextBtn = await page.evaluate((sel) => {
      const btnValue = document.querySelector(sel);
      if (btnValue) return 1;
      return 0;
    }, nextBtnSel);
    if (nextBtn) {
      await page.click(nextBtnSel);
    } else {
      break;
    }
  }

  fs.writeFile("details_GA.json", JSON.stringify(totalResults), () => {});

  await browser.close();

  // For each result
})();
