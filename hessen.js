const puppeteer = require("puppeteer");
const fs = require("fs");

const noOfResultsStr = "&rpp=100";
const noOfResuttsNum = 25;
const hessen_url =
  "https://www.arztsuchehessen.de/arztsuche/arztsuche.php?page=suche&fachrichtung=65&haus_facharzt=egal&fachrichtung_psycho=--alle--&plz=--alle--&ort=--alle--&kreis=--alle--&strasse=--alle--&action%5BSucheStarten%5D=&name=--alle--&vorname=--alle--&geschlecht=egal&status=--alle--&genehmigung=--alle--&zusatzbezeichnung=--alle--&testungaufSARSCoV2=--alle--&fremdsprache=--alle--&sz_von_sel=&sz_bis_sel=&rpp=100";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(hessen_url);

  await page.reload();

  await page.click("#content > form > button:nth-child(9)");

  await page.waitForSelector("#content > b");

  const getNoOfPages = await page.evaluate(() => {
    const totalResults = parseInt(
      document.querySelector("#content > b").textContent,
      10
    );
    return totalResults;
  });

  const pages = Math.ceil(getNoOfPages / noOfResuttsNum);
  let traversedPages = 1;

  const tableSelector = "#content > table > tbody > tr:not(:first-child)";

  fs.writeFile("hessen.json", "[", () => {});

  while (traversedPages <= pages) {
    await page.waitForSelector("table > tbody > tr > td");

    await page.waitForSelector(tableSelector);

    await page.waitForSelector("#content > table > tbody > tr:last-child");

    await page.waitForTimeout(2000);

    const fetchTableData = await page.evaluate((selector) => {
      const rows = document.querySelectorAll(selector);
      const tableList = [];
      rows.forEach((row) => {
        const item = row.cells;

        const nameCol = item[0];
        const addressCol = item[2];

        const nameColWords = nameCol.outerText.split("\n");
        const addressColWords = addressCol.outerText.split("\n");
        const salutation = nameColWords[0];
        const name = nameColWords[1];
        const street = addressColWords[0];
        const zip = addressColWords[1];
        const district = addressColWords[2];
        const profileUrl = nameCol.childNodes[1].href;

        const data = {
          salutation: salutation,
          name: name,
          address: {
            street: street,
            zip: zip,
            district: district,
          },
          url: profileUrl,
        };

        tableList.push(data);
      });
      return tableList;
    }, tableSelector);

    tempList = fetchTableData;

    for (i = 0; i < tempList.length; i++) {
      data = JSON.stringify(tempList[i]);
      fs.appendFile("hessen.json", data + ",", () => {});
    }

    await page.click("#content > div.rahmen > a:nth-child(3)");

    console.log(tempList);

    traversedPages += 1;
  }

  fs.appendFile("hessen.json", "]", () => {});

  console.log(getNoOfPages, pages);

  await browser.close();
})();
