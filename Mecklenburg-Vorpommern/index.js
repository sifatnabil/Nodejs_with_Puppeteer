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

  const nameLinkSel = ".ases-arzt-name-fachgebiet-text a";
  await page.waitForSelector(nameLinkSel);

  const hcpInfoSel = "#arztlisteDataList\\:0\\:detailsPanel > div";

  await page.evaluate(() => {
    const cards = document.querySelectorAll(
      ".ases-arzt-name-fachgebiet-text a"
    );

    const details = [];

    // cards[0].click();
    console.log("here printed" + Date.now());

    // return new Promise((resolve, reject) => {
    //   cards[0].click();
    //   resolve("Done");
    // });

    cards.forEach(async (card) => {
      // await card.waitForTimeout(5000);
      card.click();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Finished waiting: " + Date.now());
      const info = document.querySelector(
        "#arztlisteDataList\\:0\\:detailsPanel > div"
      );
      console.log(info.outerText);
      const nameWithSpecialty = info.outerText.split(",");
      const name = nameWithSpecialty[0].trim();
      const specialty = nameWithSpecialty[1].trim();
      details.push({
        Name: name,
        Specialty: specialty,
        Info: info,
      });
      card.click();
    });
    // return details;
  });

  console.log("time now: " + Date.now());

  // console.log(fetchHcpDetails);
  // console.log("Reached here already");

  // await browser.close();
})();
