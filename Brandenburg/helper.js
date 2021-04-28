const formatContact = (contact) => {
  const contactWords = contact.split("\n");
  const contactWordsLen = contactWords.length;
  let telephone = "",
    fax = "",
    web = "",
    mail = "";

  for (const word of contactWords) {
    if (word.startsWith("Tel:")) {
      telephone = word.slice(5, word.length - 1);
    } else if (word.startsWith("Fax:")) {
      fax = word.slice(5, word.length - 1);
    } else if (word.startsWith("Web:")) {
      web = word.slice(5, word.length - 1);
    } else if (word.startsWith("Mail:")) {
      mail = word.slice(6, word.length - 1);
    }
  }

  return [telephone, fax, mail, web];
};

module.exports = (name, tableRows) => {
  //   test();
  const nameWithTitle = name;

  const nameWords = nameWithTitle.split(" ");
  let title = "",
    actualName = "";
  for (const word of nameWords) {
    if (word.endsWith(".")) {
      title += word + " ";
    } else {
      actualName += word + " ";
    }
  }

  let areaOfExpertise = "",
    mainEmphasis = "",
    address = "",
    contact = "",
    yearOfBirth = "",
    licenseYear = "",
    powers = "",
    optionalTraining = "",
    medicalInformation = "",
    additionalDesignations = "";

  for (const row of tableRows) {
    const header = row.Header.trim();
    const body = row.Body.trim();
    switch (header) {
      case "Fachgebiete":
        areaOfExpertise = body;
        break;

      case "Schwerpunkt":
        mainEmphasis = body;
        break;

      case "Adresse":
        address = body.split("\n").toString();
        break;

      case "Kontakt":
        contact = formatContact(body);
        break;

      case "Geburtsjahr":
        yearOfBirth = body;
        break;

      case "Zusatzbezeichnungen":
        additionalDesignations = body.split("\n").toString();
        break;

      case "Approbationsjahr":
        licenseYear = body;
        break;

      case "Befugnisse":
        powers = body.split("\n").toString();
        break;

      case "Fakultative Weiterbildungen und\nFortbildungszertifikate":
        optionalTraining = body.split("\n").toString();
        break;

      case "Medizinische Angaben":
        medicalInformation = body.split("\n").toString();
        break;

      default:
        console.log("Found a name not covered");
        console.log(header);
    }
  }

  const details = {
    Title: title.trim(),
    Name: actualName.trim(),
    "Area of Expertise": areaOfExpertise,
    "Main Emphasis": mainEmphasis,
    Adress: address,
    Phone: contact[0].trim(),
    Fax: contact[1].trim(),
    Mail: contact[2].trim(),
    Web: contact[3].trim(),
    "Year of Birth": yearOfBirth,
    "License Year": licenseYear,
    Powers: powers,
    "Optional Training": optionalTraining,
    "Medical Information": medicalInformation,
  };

  return details;
};
