const puppeteer = require("puppeteer");
const fs = require("fs");

const hessen_url =
  "https://www.arztsuchehessen.de/arztsuche/arztsuche.php?page=suche&fachrichtung=65&haus_facharzt=egal&fachrichtung_psycho=--alle--&plz=--alle--&ort=--alle--&kreis=--alle--&strasse=--alle--&action%5BSucheStarten%5D=&name=--alle--&vorname=--alle--&geschlecht=egal&status=--alle--&genehmigung=--alle--&zusatzbezeichnung=--alle--&testungaufSARSCoV2=--alle--&fremdsprache=--alle--&sz_von_sel=&sz_bis_sel=&rpp=100";

const profileUrl =
  "https://www.arztsuchehessen.de/arztsuche/arztsuche.php?page=karteikarte&arztID=35995&status=43460&zulknz=E&adrkey=112184&bstkey=547569";

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(hessen_url);

  await page.reload();

  await page.click("#content > form > button:nth-child(9)");

  const profilePage = await browser.newPage();

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
    console.log("eikhane ashe");
    for (i = 0; i < length; i++) {
      field = fields[i].outerText.trim();
      data.push(field);
      console.log(field);
      if (field === "Address:") continue;
      switch (field) {
        case "Praxismerkmale :":
          practicalFeatures = values[i].outerText.trim().split("\n");
          continue;
        case "Krankenhaus:":
          hospital = values[i].outerText.trim();
          continue;
        case "Telefon:":
          phone = values[i].outerText.trim();
          continue;
        case "Telefax:":
          fax = values[i].outerText.trim();
          continue;
        case "Web:":
          web = values[i].outerText.trim();
          continue;
        case "Status:":
          status = values[i].outerText.trim();
          continue;
        case "Fachgebiet:":
          expertise = values[i].outerText.trim().split("\n");
          continue;
        case "Schwerpunkt:":
          mainEmphasis = values[i].outerText.trim();
          continue;
        case "Weitere Merkmale:":
          otherFeatures = values[i].outerText.trim().split("\n");
          continue;
        case "Ermächtigung:":
          const tempStr = values[i].outerText.split("\n");
          for (i = 0; i < tempStr.length; i++) {
            if (tempStr[i] != "") {
              authorization += tempStr[i] + "\n";
            }
          }
          continue;
        case "Fremdsprachen:":
          foreignLanguages = values[i].outerText.trim().split("\n");
          continue;
        case "Sprechstunde:":
          consultationHour = values[i].outerText.trim().split("\n");
          continue;
      }
    }

    // if (expertise) {
    //   const tempStr = expertise.split("\n");
    //   expertise = "";
    //   for (i = 0; i < tempStr.length; i++) {
    //     expertise += tempStr[i] + "\n";
    //   }
    // }

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

  let authorization = "";
  if (fetchDetails.Authorization) {
    const temp = fetchDetails.Authorization;
    for (i = 0; i < temp.length; i++) {
      authorization += temp[i] + "\n";
    }
  }

  // fs.writeFile("authorization.txt", details.Authorization, () => {});

  console.log(details.Authorization);
  await browser.close();
})();
