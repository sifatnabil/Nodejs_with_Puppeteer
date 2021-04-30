module.exports = (detailsAr) => {
  const salutation = detailsAr[0];
  const nameWithTitle = detailsAr[1];
  let title = "";
  let actualName = "";
  const nameWords = nameWithTitle.split(" ");
  for (const word of nameWords) {
    if (word.endsWith(".")) title += word + " ";
    else actualName += word + " ";
  }

  let additionalInfo = "",
    areaOfExpertise = "",
    practice = "",
    therapTime = "",
    additionalDesignation = "",
    servicesRequiringApproval = "",
    foreignLanguages = "";

  const detailsArLen = detailsAr.length;
  for (let i = 2; i < detailsArLen; i++) {
    const item = detailsAr[i];
    if (!item) continue;
    const itemWords = item.split("\t");
    if (itemWords.length > 1) {
      const property = itemWords[0].trim();
      const value = itemWords.slice(1, itemWords.length).toString();
      console.log(property);
      switch (property) {
        case "Fachgebiet:":
          areaOfExpertise = value.split("\n").toString();
          break;
        case "Praxis:":
          practice = value.split("\n").toString();
          break;
        case "Ärztliche Sprechstunde / Therapiezeit (PT):":
          console.log("Dhorse eikhane");
          therapTime = value.split("\n").toString();
          break;
        case "Genehmigungspflichtige Leistungen:":
          servicesRequiringApproval = value.split("\n").toString();
          break;
        case "Zusatzbezeichnung:":
          additionalDesignation = value.split("\n").toString();
          break;
        case "Fremdsprache:":
          foreignLanguages = value.split("\n").toString();
          break;
      }
    } else {
      additionalInfo += item + ", ";
    }
  }

  const details = {
    Salutation: salutation,
    Title: title.trim(),
    Name: actualName.trim(),
    "Area of Expertise": areaOfExpertise,
    Practice: practice,
    "Medical consultation / therapy time (PT)": therapTime,
    "Additional Designation": additionalDesignation,
    "Services Requiring Approval": servicesRequiringApproval,
    "Foreign Languages": foreignLanguages,
    "Additional Info": additionalInfo,
  };

  return details;
};
