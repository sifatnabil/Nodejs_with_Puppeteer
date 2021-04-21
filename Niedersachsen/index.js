const puppeteer = require("puppeteer");
const detailParser = require("./detailsParse");
const fs = require("fs");
const { stringify } = require("querystring");

const url = "https://www.arztauskunft-niedersachsen.de/ases-kvn/";
const riStr = "Rheumatologie";

(async () => {
  // Create browser instance, a page and hit the url
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Put "Rheumatologie" in the search box
  const searchBox = "#input-form-id > div > div > div > span > input";
  await page.waitForSelector(searchBox);
  await page.type(searchBox, riStr);

  // Hit the search button
  const searchBtn = "#input-form-id\\:search-button-id > span";
  await page.click(searchBtn);
  await page.waitForTimeout(2000);

  // Check to see the next button on the current page.
  const nextPageBtn =
    "#search-result-list-form-id\\:arztlisteDataList_paginator_bottom > a.ui-paginator-next.ui-state-default.ui-corner-all";

  let tabIndex = await page.evaluate((sel) => {
    return document.querySelector(sel).tabIndex;
  }, nextPageBtn);

  let pageNo = 1;

  const cardSel =
    "#search-result-list-form-id\\:arztlisteDataList_content > div > div > div";

  const links = [];

  while (true) {
    await page.waitForTimeout(2000);
    let fetchNames = await page.evaluate((sel) => {
      const cards = document.querySelectorAll(sel);
      const links = [];
      let link = "";
      cards.forEach((card) => {
        link = card.childNodes[1].childNodes[0].children[0].href;
        links.push(link);
      });
      return links;
    }, cardSel);

    // console.log(fetchNames);
    fetchNames.forEach((name) => {
      links.push(name);
    });

    tabIndex = await page.evaluate((sel) => {
      return document.querySelector(sel).tabIndex;
    }, nextPageBtn);

    if (tabIndex != -1) {
      await page.click(nextPageBtn);
      await page.waitForTimeout(1000);
    } else {
      break;
    }
  }

  // console.log(links.length);

  // create a new page for visiting links
  const profilePage = await browser.newPage();
  const nameWithTitleSel = "#labelArztName";
  const allSelector = "#j_idt64";

  // fs.writeFile("test.json", "[", "utf8", () => {});

  // goto each link
  for (let j = 100; j < links.length; j++) {
    const link = links[j];
    await profilePage.goto(link);
    await profilePage.waitForTimeout(40000);
    await profilePage.waitForSelector(nameWithTitleSel);

    const nameAndTitle = await profilePage.evaluate((sel) => {
      const nameWithTitle = document.querySelector(sel).outerText;
      return nameWithTitle;
    }, allSelector);

    const details = nameAndTitle.split("\n");
    // console.log(details);

    const name = details[0];
    let i = 0;
    let typeOfDoctor = "";
    if (details[1].endsWith(":")) {
      i = 1;
    } else {
      typeOfDoctor = details[1];
      i = 2;
    }

    const areaOfExpertise = [];
    const mainEmphasis = [];
    const foreignLanguages = [];
    const additionalDesignation = [];
    const specialKnowledge = [];

    for (; i < details.length; i++) {
      if (details[i].endsWith(":")) {
        const field = details[i];
        switch (field) {
          case "Fachgebiet:":
            i += 1;
            while (details[i] != "" && i < details.length) {
              areaOfExpertise.push(details[i]);
              i++;
            }
            break;

          case "Schwerpunkt:":
            i++;
            while (details[i] != "" && i < details.length) {
              mainEmphasis.push(details[i]);
              i++;
            }
            break;

          case "Fremdsprachen:":
            i++;
            while (details[i] != "" && i < details.length) {
              foreignLanguages.push(details[i]);
              i++;
            }
            break;

          case "Zusatzbezeichnung:":
            i++;
            while (details[i] != "" && i < details.length) {
              additionalDesignation.push(details[i]);
              i++;
            }
            break;

          case "Besondere Kenntnisse:":
            i++;
            while (details[i] != "" && i < details.length) {
              specialKnowledge.push(details[i]);
              i++;
            }
            break;
        }
      }
    }

    const cardSel = ".print-page-break";

    const cardDetails = await profilePage.evaluate((sel) => {
      const cards = document.querySelectorAll(sel);
      const detailsList = [];
      cards.forEach((card) => {
        const type = card.childNodes[0].outerText;
        const details = card.childNodes[1].childNodes[1].outerText;
        detailsList.push(type + "\n" + details);
      });
      return detailsList;
    }, cardSel);

    const workplace = detailParser(cardDetails);

    const result = {
      Name: name,
      "Type of Doctor": typeOfDoctor,
      "Area of Expertise": areaOfExpertise.toString(),
      "Main Emphasis": mainEmphasis,
      "Foreign Languages": foreignLanguages,
      "Additional Designation": additionalDesignation,
      "Special Knowledge": specialKnowledge,
      Workplaces: workplace,
    };

    fs.appendFile("test.json", JSON.stringify(result) + ",", "utf8", () => {});
    console.log("Done");

    // break;
  }

  fs.appendFile("test.json", "]", "utf8", () => {});

  await browser.close();
})();
