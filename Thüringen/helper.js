module.exports = (details) => {
  const name = details.Name;
  const areaOfExpertise = details.Expertise;
  const otherDetails = details.details;

  let title = "",
    actualName = "";
  const nameWords = name.split(" ");
  for (const word of nameWords) {
    if (word.endsWith(".")) title += word + " ";
    else actualName += word + " ";
  }

  console.log(areaOfExpertise);

  // const colonIndex = areaOfExpertise.indexOf(":");
  // const parsedAreaOfExpertise = areaOfExpertise
  //   .slice(colonIndex + 1, areaOfExpertise.length)
  //   .trim();

  let mainEmphasis = "",
    servicesOffered = "",
    specialContracts = "",
    additionalDesignation = "",
    officeHours = "",
    phone = "",
    facility = "",
    accessibility = "";

  for (const d of otherDetails) {
    const property = d.Property;
    const value = d.Value;
    // console.log(property, value);
    switch (property) {
      case "Schwerpunkt:":
        mainEmphasis = value;
        break;

      case "Zusatzbezeichung:":
        additionalDesignation = value;
        break;

      case "Leistungsangebote:":
        servicesOffered = value;
        break;

      case "Sonderverträge:":
        specialContracts = value;
        break;

      case "Sprechzeiten":
        officeHours = value;
        break;

      case "Telefon":
        phone = value;
        break;

      case "Einrichtung":
        facility = value;
        break;

      case "Barrierefreiheit":
        accessibility = value;
        break;

      default:
        console.log("Not covered: " + property + " for: " + name);
    }
  }

  return {
    Title: title.trim(),
    Name: actualName.trim(),
    "Area of Expertise": areaOfExpertise,
    "Main Emphasis": mainEmphasis,
    "Additional Designation": additionalDesignation,
    "Services Offered": servicesOffered,
    "Special Contracts": specialContracts,
    "Office Hours": officeHours,
    Phone: phone,
    Facility: facility,
    Accessibility: accessibility,
  };
};
