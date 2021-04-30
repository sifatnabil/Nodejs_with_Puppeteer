const puppeteer = require("puppeteer");
const fs = require("fs");
const helper = require("./helper");

const url = "https://asu.kvs-sachsen.de/arztsuche/";

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
  });
  const page = await browser.newPage();

  await page.goto(url);

  const dropdownSel = "#searchForm\\:specialismDetail\\:selectWindow > label";
  await page.waitForSelector(dropdownSel);
  await page.click(dropdownSel);
  await page.waitForTimeout(1000);
  const riSel =
    "#searchForm\\:specialismDetail\\:selectTree\\:62 > span > span.ui-treenode-label.ui-corner-all";
  const gaSel =
    "#searchForm\\:specialismDetail\\:selectTree\\:11 > span > span.ui-treenode-label.ui-corner-all";
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
  // console.log("chole gese bhai");

  const tableRowsSel = "#listForm\\:tabs\\:table_data > tr";
  const nextBtnSel =
    "#listForm\\:tabs\\:table_paginator_bottom > span.ui-paginator-next.ui-state-default.ui-corner-all";
  let searchBtnCounter = 0;
  const backBtnSel = "#detailForm\\:backPanel\\:btn-navigateResultList";
  const tableContentSel =
    "#detailForm\\:cc-detailedView\\:pg-detailedView > tbody > tr";

  const hcpDetails = [];

  while (true) {
    await page.waitForTimeout(2000);
    const rowCount = await page.evaluate((sel) => {
      return document.querySelectorAll(sel).length;
    }, tableRowsSel);
    console.log(`Page has ${rowCount} results`);

    const detailsBtnRange = searchBtnCounter + rowCount;

    await page.waitForTimeout(3000);

    while (searchBtnCounter < detailsBtnRange) {
      await page.waitForSelector(
        `#listForm\\:tabs\\:table\\:${searchBtnCounter}\\:showDetail`
      );
      await page.waitForTimeout(2000);
      const profilePageUrl = `#listForm\\:tabs\\:table\\:${searchBtnCounter}\\:showDetail`;
      await page.click(profilePageUrl);
      await page.waitForTimeout(4000);
      await page.waitForSelector("form");

      /* Do the scraping from here */
      const fetchDetails = await page.evaluate((sel) => {
        const tableRows = document.querySelectorAll(sel);
        const details = [];
        tableRows.forEach((row) => {
          details.push(row.outerText);
        });
        return details;
      }, tableContentSel);

      const data = helper(fetchDetails);

      console.log(data);

      hcpDetails.push(data);

      await page.click(backBtnSel);
      await page.waitForTimeout(6000);
      searchBtnCounter++;
    }

    const tabIndex = await page.evaluate((sel) => {
      return document.querySelector(sel).tabIndex;
    }, nextBtnSel);

    if (tabIndex != -1) {
      await page.click(nextBtnSel);
    } else {
      break;
    }
  }

  fs.writeFile("RI.json", JSON.stringify(hcpDetails), () => {});

  await browser.close();
})();
