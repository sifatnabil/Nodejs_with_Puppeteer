const puppeteer = require("puppeteer");
const helper = require("./helper");
const fs = require("fs");

const url = "https://www.kv-thueringen.de/arztsuche";
const riStr = "rheumatologie";
const gaStr = "gastroenterologie";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url);

  const searchBarSel = "#as-suchbegriff";
  const searchBtnSel = "#submitArztsuche";
  await page.waitForSelector(searchBarSel);
  await page.type(searchBarSel, riStr);
  await page.click(searchBtnSel);
  await page.waitForTimeout(3000);

  const resultsSel = ".results > li > a";
  let pages = 1;
  const paginationButton = await page.evaluate(() => {
    return (buttons = document.querySelectorAll("input.pagination-button")
      .length);
  });

  const buttons = paginationButton;

  if (buttons) {
    pages = buttons;
  }

  let currentPage = 1;
  const allLinks = [];

  while (true) {
    await page.waitForTimeout(4000);
    const hcpLinks = await page.evaluate((sel) => {
      const l = document.querySelectorAll(sel);
      const links = [];
      l.forEach((link) => {
        links.push(link.href);
      });
      return links;
    }, resultsSel);

    allLinks.push(...hcpLinks);

    if (currentPage < pages) {
      currentPage++;
      await page.click(`input.pagination-button[value='${currentPage}']`);
    } else {
      break;
    }
  }

  console.log("all links: ", allLinks.length);

  const resultsAr = [];

  //   const hcpLinks = [
  //     "https://www.kv-thueringen.de/arztsuche/arztsuche-details?tx_t3kvclient_showclient%5Baction%5D=show&tx_t3kvclient_showclient%5Bclient%5D=17e633b8&tx_t3kvclient_showclient%5Bcontroller%5D=Client&tx_t3kvclient_showclient%5Bplace%5D=089f3b25&cHash=9e1845a55a2a736a9c792c3f874f8fde",
  //     "https://www.kv-thueringen.de/arztsuche/arztsuche-details?tx_t3kvclient_showclient%5Baction%5D=show&tx_t3kvclient_showclient%5Bclient%5D=1d795595&tx_t3kvclient_showclient%5Bcontroller%5D=Client&tx_t3kvclient_showclient%5Bplace%5D=86e6ad41&cHash=71d03124ba389f8d10c5b3459e7e55c1",
  //   ];

  for (const link of allLinks) {
    await page.goto(link);
    await page.waitForTimeout(3000);
    const details = await page.evaluate(() => {
      const name = document.querySelector("h1").outerText;

      const paras = document.querySelectorAll(`div.resultdetail > div > p`);
      const areaOfExpertise = [];
      let noOfExpertise = 0;
      paras.forEach((para) => {
        if (para.outerText.startsWith("Fachgebiet: ")) {
          noOfExpertise++;
          areaOfExpertise.push(para.outerText.slice(12, para.length));
        }
      });
      //   const areaOfExpertise = document.querySelector(
      //     "div.resultdetail > div > p:nth-of-type(1)"
      //   ).outerText;
      const detailsPart1 = document.querySelectorAll(
        "div.resultdetail > div > p + ul"
      );

      const d = [];

      detailsPart1.forEach((tag, ind) => {
        const property = document.querySelector(
          `div.resultdetail > div > p:nth-of-type(${ind + noOfExpertise + 1})`
        ).outerText;
        const value = tag.outerText.split("\n").toString();
        d.push({
          Property: property,
          Value: value,
        });
      });

      const detailsPart2 = document.querySelectorAll("h3 + p");
      for (let i = 0; i < detailsPart2.length - 2; i++) {
        const property = document.querySelector(`h3:nth-of-type(${i + 2})`)
          .outerText;
        const value = detailsPart2[i].outerText;
        d.push({
          Property: property,
          Value: value,
        });
      }

      const accessibility = document.querySelector("h3 + ul");
      if (accessibility) {
        const property = "Barrierefreiheit";
        const value = accessibility.outerText.split("\n").toString();
        d.push({
          Property: property,
          Value: value,
        });
      }

      const table = document.querySelector("table");

      if (table) {
        const tableContent = table.outerText.split("\n").toString();
        d.push({
          Property: "Sprechzeiten",
          Value: tableContent,
        });
      }

      const f = {
        Name: name,
        Expertise: areaOfExpertise.toString(),
        details: d,
      };
      return f;
    });
    // console.log(details);
    const parsedResult = helper(details);
    // console.log(parsedResult);
    resultsAr.push(parsedResult);
  }

  fs.writeFile("RI.json", JSON.stringify(resultsAr), () => {});

  await browser.close();
})();
