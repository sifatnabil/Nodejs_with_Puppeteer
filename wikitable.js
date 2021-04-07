const puppeteer = require("puppeteer");

url = "https://en.wikipedia.org/wiki/Table_(information)";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(url);

  const headerSelector = "#Multi-dimensional_table";
  await page.waitForSelector(headerSelector);

  const tableSelector =
    "#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr > td";

  const fetchData = await page.evaluate(() => {
    const rows = document.querySelector("#Multi-dimensional_table").innerHTML;
    return rows;
  });

  const fetchTableData = await page.evaluate(() => {
    const rows = document.querySelectorAll(
      "#mw-content-text > div.mw-parser-output > table:nth-child(12) > tbody > tr"
    );
    const nameList = [];
    rows.forEach((row) => {
      const newList = [];
      const item = row.cells;
      for (i = 0; i < item.length; i++) {
        newList.push(item[i].innerText);
      }
      nameList.push(newList);
    });
    return nameList;
    // return rows;
  });

  console.log(fetchTableData);

  await browser.close();
})();
