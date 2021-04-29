const puppeteer = require("puppeteer");

const url = "https://asu.kvs-sachsen.de/arztsuche/";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.goto(url);

  const dropdownSel = "#searchForm\\:specialismDetail\\:selectWindow > label";
  await page.waitForSelector(dropdownSel);
  await page.click(dropdownSel);
  const riSel =
    "#searchForm\\:specialismDetail\\:selectTree\\:62 > span > span.ui-treenode-label.ui-corner-all";
  await page.click(riSel);
  await page.waitForTimeout(4000);

  const searchBtnSel = "#searchForm\\:searchButton > span";
  await page.click(searchBtnSel);
  await page.waitForTimeout(5000);

  const listViewSel = "#listForm\\:tabs > ul > li:nth-child(2)";
  // const listViewSel = "#listForm\\:backPanel\\:btn-navigateSearchChange";
  await page.waitForSelector(listViewSel);
  await page.waitForTimeout(10000);
  await page.click(listViewSel);
  console.log("chole gese bhai");
})();
