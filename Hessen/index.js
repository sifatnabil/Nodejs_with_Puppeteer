const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto("https://www.youtube.com/");

  const grabYoutubeTitles = await page.evaluate(() => {
    const titleTags = document.querySelectorAll("#video-title");
    const titles = [];
    titleTags.forEach((element) => {
      titles.push(element.innerHTML);
    });
    return titles;
  });

  console.log(grabYoutubeTitles);

  await browser.close();
})();
