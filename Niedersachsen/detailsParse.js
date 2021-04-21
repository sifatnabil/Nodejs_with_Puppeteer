module.exports = (cardDetails) => {
  const detailsParsed = [];

  for (const details of cardDetails) {
    let address = "";
    let phone = "";
    let fax = "";
    let website = "";
    const officeHours = [];
    const openConsultation = [];
    const accessibility = [];
    let workplaceType = "";

    const detail = details.split("\n");
    if (workplaceType != "Attending physician activity") {
      workplaceType = detail[0];
      address = detail[1] + " " + detail[2];
      for (let i = 3; i < detail.length; i++) {
        const text = detail[i];
        if (text == "") continue;
        switch (text) {
          case "Telefon:":
            i++;
            phone = detail[i];
            break;
          case "Fax:":
            i++;
            fax = detail[i];
            break;
          case "Webseite:":
            i++;
            website = detail[i];
            break;
          case "Sprechzeiten:":
            i++;
            while (i < detail.length && !detail[i].endsWith(":")) {
              officeHours.push(detail[i]);
              i++;
            }
            break;

          case "Offene Sprechstunde:":
            i++;
            while (i < detail.length && !detail[i].endsWith(":")) {
              openConsultation.push(detail[i]);
              i++;
            }
            break;
          case "Barrierefreiheit:":
            i++;
            while (i < detail.length && !detail[i].endsWith(":")) {
              accessibility.push(detail[i]);
              i++;
            }
            break;
        }
      }
    } else {
      address = details;
    }

    detailsParsed.push({
      "Workplace Type": workplaceType,
      Address: address,
      Phone: phone,
      Fax: fax,
      Website: website,
      "Office Hours": officeHours.toString(),
      "Consultation Time": openConsultation.toString(),
      Accessibility: accessibility.toString(),
    });
  }
  return detailsParsed;
};
