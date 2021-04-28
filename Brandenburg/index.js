const puppeteer = require("puppeteer");
const helper = require("./helper");
const fs = require("fs");

const riStr = "Rheumatologie";
const gaStr = "Gastroenterologie";
const riOrthoStr = "Rheumatologie  (Orthopädie)";

const url =
  "https://www.laekb.de/www/website/PublicNavigation/arzt/suche-verzeichnis/arztsuche/";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url);

  const dropDownSel = "#Fachgebiet";
  const searchBtnSel =
    "#ContentExtern > form > table > tbody > tr:nth-child(5) > td > input[type=submit]";

  await page.waitForSelector(dropDownSel);

  await page.click(dropDownSel);
  await page.select(dropDownSel, gaStr);
  await page.waitForTimeout(4000);
  await page.click(searchBtnSel);

  const linkSel = "table a";
  await page.waitForTimeout(4000);
  const profilePage = await browser.newPage();
  const detailsSel = "table tbody tr";
  const nameSel = "h3 font";

  const fetchLinks = await page.evaluate((sel) => {
    const aTags = document.querySelectorAll(sel);
    const links = [];
    aTags.forEach((tag) => {
      links.push(tag.href);
    });
    return links;
  }, linkSel);

  const links = fetchLinks;

  fs.writeFile("ga.json", "[", () => {});

  for (const link of links) {
    await profilePage.goto(link);
    const fetchHcpInfo = await profilePage.evaluate((sel) => {
      const name = document.querySelector("h3").outerText.trim();
      const tableRows = document.querySelectorAll(sel);
      const rows = [];
      tableRows.forEach((row) => {
        const heading = row.childNodes[1].outerText;
        const body = row.childNodes[3].outerText;
        rows.push({
          Header: heading,
          Body: body,
        });
      });
      return [name, rows];
    }, detailsSel);
    const [name, hcpDetails] = fetchHcpInfo;
    const details = helper(name, hcpDetails);
    console.log(details);
    fs.appendFile("ga.json", JSON.stringify(details) + ",", () => {});
    await profilePage.waitForTimeout(2000);
  }

  await browser.close();
})();
