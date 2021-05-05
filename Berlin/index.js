const puppeteer = require("puppeteer");
const fs = require("fs");
const { table } = require("console");

const url = "http://www.aerzte-berlin.de/_php/therapie30/fach.php";

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const page = await browser.newPage();
  await page.goto(url);

  const specialtySel = `select[name='Fach']`;
  const resultSizeSel = `select[name='Limit']`;
  const searchBtnSel = `input[type='image']`;
  await page.waitForSelector(specialtySel);
  await page.click(specialtySel);
  await page.waitForTimeout(3000);
  await page.select(specialtySel, "18"); // 70 for Rheumatology, 18 for Gastroenterology
  await page.click(resultSizeSel);
  await page.waitForTimeout(3000);
  await page.select(resultSizeSel, "100");
  await page.click(searchBtnSel);
  await page.waitForTimeout(5000);

  const tableRowsSel =
    "body > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(3) > table:nth-child(4) > tbody > tr:nth-child(3) > td > table > tbody > tr";

  const fetchDetails = await page.evaluate((sel) => {
    const rows = document.querySelectorAll(sel);
    const details = [];
    for (let i = 3; i < rows.length; i += 2) {
      const row = rows[i];
      const salutation = row.childNodes[1].outerText.trim();
      const title = row.childNodes[5].outerText.trim();
      const name = row.childNodes[9].outerText.trim();
      const postCode = row.childNodes[13].outerText.trim();
      const district = row.childNodes[17].outerText.trim();
      const street = row.childNodes[21].outerText.trim();
      const urlField = row.childNodes[25].childNodes[1];
      let profileUrl = "";
      let profileText = "";
      if (urlField) {
        profileUrl = row.childNodes[25].childNodes[1].href;
        profileText = row.childNodes[25].outerText.trim();
      }

      const telephone = row.childNodes[29].outerText.trim();
      details.push({
        Salutation: salutation,
        Title: title,
        Name: name,
        PostCode: postCode,
        District: district,
        Street: street,
        Profile: profileUrl,
        ProfileText: profileText,
        Telephone: telephone,
      });
    }
    return details;
  }, tableRowsSel);

  const details = fetchDetails;

  const totalResults = [];

  for (const d of details) {
    const profileUrl = d.Profile;
    const profileText = d.ProfileText;
    const salutation = d.Salutation;
    const title = d.Title;
    const name = d.Name;
    const postCode = d.PostCode;
    const district = d.District;
    const street = d.Street;
    const telephone = d.Telephone;
    let subject = "";
    let focus = "";
    let foreignLanguage = "";
    if (profileUrl && profileText == "mehr info") {
      await page.goto(profileUrl);
      await page.waitForTimeout(4000);
      const fetchProfileData = await page.evaluate(() => {
        const tableData = document.querySelector("tbody");
        let address = "",
          phone = "",
          subject = "",
          focus = "",
          foreignLanguage = "";

        if (tableData.childNodes[8].childNodes[1]) {
          address = tableData.childNodes[8].childNodes[1].outerText
            .split("\n")
            .toString();
        }

        if (tableData.childNodes[8].childNodes[5]) {
          const tempPhone = tableData.childNodes[8].childNodes[5].outerText.trim();
          phone = tempPhone.slice(9, tempPhone.length);
        }

        if (tableData.childNodes[16].childNodes[1]) {
          const tempSubjects = tableData.childNodes[16].childNodes[1].outerText.split(
            "\n"
          );
          subject = tempSubjects.slice(1, tempSubjects.length).toString();
        }

        if (tableData.childNodes[16].childNodes[5]) {
          const tempFocus = tableData.childNodes[16].childNodes[5].outerText.split(
            "\n"
          );
          focus = tempFocus.slice(1, tempFocus.length).toString();
        }

        if (tableData.childNodes[24]) {
          const tempForeignLanguages = tableData.childNodes[24].outerText.split(
            "\n"
          );
          foreignLanguage = tempForeignLanguages
            .slice(1, tempForeignLanguages.length)
            .toString();
        }

        return {
          Address: address,
          Telephone: phone.trim(),
          Subject: subject,
          Focus: focus,
          "Foreign Languages": foreignLanguage,
        };
      });
      //   console.log(`For ${d.Name}, Data: `);
      const data = fetchProfileData;
      focus = data.Focus;
      subject = data.Subject;
      foreignLanguage = data["Foreign Languages"];
    }

    totalResults.push({
      Salutation: salutation,
      Title: title,
      Name: name,
      PostCode: postCode,
      District: district,
      Street: street,
      Telephone: telephone,
      Subject: subject,
      Focus: focus,
      "Foreign Languages": foreignLanguage,
    });

    console.log(totalResults);
  }

  console.log(totalResults);

  fs.writeFile("Berlin_GA.json", JSON.stringify(totalResults), () => {});
  await browser.close();
})();
