const puppeteer = require("puppeteer");
const fs = require("fs");

const noOfResultsStr = "&rpp=25";
const noOfResuttsNum = 25;
// const hessen_url =
//   "https://www.arztsuchehessen.de/arztsuche/arztsuche.php?page=suche&fachrichtung=65&haus_facharzt=egal&fachrichtung_psycho=--alle--&plz=--alle--&ort=--alle--&kreis=--alle--&strasse=--alle--&action%5BSucheStarten%5D=&name=--alle--&vorname=--alle--&geschlecht=egal&status=--alle--&genehmigung=--alle--&zusatzbezeichnung=--alle--&testungaufSARSCoV2=--alle--&fremdsprache=--alle--&sz_von_sel=&sz_bis_sel=&rpp=100";

const hessen_url =
  "https://www.arztsuchehessen.de/arztsuche/arztsuche.php?page=suche&fachrichtung=59&haus_facharzt=egal&fachrichtung_psycho=--alle--&plz=--alle--&ort=--alle--&entfernung=5&action%5BSucheStarten%5D=&name=--alle--&vorname=--alle--&geschlecht=egal&status=--alle--&genehmigung=--alle--&zusatzbezeichnung=--alle--&testungaufSARSCoV2=--alle--&fremdsprache=--alle--&sz_von_sel=&sz_bis_sel=";
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

  fs.writeFile("hessen_GA.json", "[", () => {});

  const resultsArray = [];

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
      resultsArray.push(tempList[i]);
      data = JSON.stringify(tempList[i]);
      fs.appendFile("hessen_GA.json", data + ",", () => {});
    }

    await page.click("#content > div.rahmen > a:nth-child(3)");

    console.log(tempList);

    traversedPages += 1;
  }

  fs.appendFile("hessen_GA.json", "]", () => {});

  fs.writeFile("hessen_details_GA.json", "[", () => {});

  const resultLength = resultsArray.length;

  const profilePage = await browser.newPage();

  for (i = 0; i < resultLength; i++) {
    const profileUrl = resultsArray[i].url;
    await profilePage.goto(profileUrl);
    await profilePage.waitForTimeout(3000);

    const fetchDetails = await profilePage.evaluate(() => {
      const fields = document.querySelectorAll("div.Arzt_links");
      const values = document.querySelectorAll("div.Arzt_rechts");
      const length = fields.length;
      const data = [];
      let practicalFeatures = "";
      let hospital = "";
      let phone = "";
      let fax = "";
      let web = "";
      let status = "";
      let expertise = "";
      let mainEmphasis = "";
      let otherFeatures = "";
      let authorization = "";
      let foreignLanguages = "";
      let consultationHour = "";
      let tempStr = "";
      for (j = 0; j < length; j++) {
        field = fields[j].outerText.trim();
        data.push(field);
        console.log(field);
        if (field === "Address:") continue;
        switch (field) {
          case "Praxismerkmale :":
            practicalFeatures = values[j].outerText.trim().split("\n");
            continue;
          case "Krankenhaus:":
            hospital = values[j].outerText.trim();
            continue;
          case "Telefon:":
            phone = values[j].outerText.trim();
            continue;
          case "Telefax:":
            fax = values[j].outerText.trim();
            continue;
          case "Web:":
            web = values[j].outerText.trim();
            continue;
          case "Status:":
            status = values[j].outerText.trim().split("\n");
            continue;
          case "Fachgebiet:":
            expertise = values[j].outerText.trim().split("\n");
            tempStr = values[j].outerText.split("\n");
            continue;
          case "Schwerpunkt:":
            mainEmphasis = values[j].outerText.trim();
            continue;
          case "Weitere Merkmale:":
            otherFeatures = values[j].outerText.trim().split("\n");
            continue;
          case "Ermächtigung:":
            tempStr = values[j].outerText.split("\n");
            for (k = 0; k < tempStr.length; k++) {
              if (tempStr[k] != "") {
                authorization += tempStr[k] + " ";
              }
            }
            continue;
          case "Fremdsprachen:":
            foreignLanguages = values[j].outerText.trim().split("\n");
            continue;
          case "Sprechstunde:":
            consultationHour = values[j].outerText.trim().split("\n");
            continue;
        }
      }
      const d = {
        "Practical Features": practicalFeatures,
        Hospital: hospital,
        Phone: phone,
        Fax: fax,
        Web: web,
        Status: status,
        "Area of Expertise": expertise,
        "Main Emphasis": mainEmphasis,
        "Other Features": otherFeatures,
        Authorization: authorization,
        "Foreign Languages": foreignLanguages,
        "Consultation Hour": consultationHour,
      };
      return d;
    });

    const details = fetchDetails;

    const detailsData = {
      salutation: resultsArray[i].salutation,
      name: resultsArray[i].name,
      street: resultsArray[i].address.street,
      zip: resultsArray[i].address.zip,
      district: resultsArray[i].address.district,
      // "Practical Features": details["Practical Features"],
      Hospital: details.Hospital,
      Phone: details.Phone,
      Fax: details.Fax,
      Web: details.Web,
      Status: details.Status.toString(),
      "Area of Expertise": details["Area of Expertise"].toString(),
      "Main Emphasis": details["Main Emphasis"],
      "Other Features": details["Other Features"].toString(),
      Authorization: details.Authorization,
      "Foreign Languages": details["Foreign Languages"].toString(),
      "Consultation Hour": details["Consultation Hour"].toString(),
      url: profileUrl,
    };

    fs.appendFile(
      "hessen_details_GA.json",
      JSON.stringify(detailsData) + ",",
      () => {}
    );
    console.log(detailsData);
  }

  fs.appendFile("hessen_details_GA.json", "]", () => {});

  await browser.close();
})();
