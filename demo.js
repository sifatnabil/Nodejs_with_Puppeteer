const puppeteer = require("puppeteer");

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

  await profilePage.waitForTimeout(2000);

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
    let foreighLanguages = "";
    let consultationHour = "";
    console.log("eikhane ashe");
    for (i = 0; i < length; i++) {
      field = fields[i].outerText;
      console.log(field);
      if (field === "Address:") continue;
      switch (field) {
        case "Adresse:":
          continue;
        case "Praxismerkmale :":
          practicalFeatures = values[i].outerText.trim();
        case "Krankenhaus:":
          hospital = values[i].outerText.trim();
        case "Telefon:":
          phone = values[i].outerText.trim();
        case "Telefax:":
          fax = values[i].outerText.trim();
        case "Web:":
          web = values[i].outerText.trim();
        case "Status:":
          status = values[i].outerText.trim();
        case "Fachgebiet:":
          expertise = values[i].outerText.trim();
        case "Schwerpunkt:":
          mainEmphasis = values[i].outerText.trim();
        case "Weitere Merkmale:":
          otherFeatures = values[i].outerText.trim();
        case "Fremdsprachen:":
          foreighLanguages = values[i].outerText.trim();
        case "Sprechstunde:":
          consultationHour = values[i].outerText.trim();
      }
      d = {
        "Practical Features": practicalFeatures,
        Phone: phone,
        Fax: fax,
        Web: web,
        Status: status,
        "Area of Expertise": expertise,
      };
      data.push(d);
    }
    return data;
  });

  console.log(fetchDetails);
  await browser.close();
})();
