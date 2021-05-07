const parseFirstDiv = (firstDiv) => {
  const divText = firstDiv.split("\n");
  let address = "",
    phone = "",
    fax = "",
    areaOfActivity = "",
    foreignLanguages = "";
  const divTextLen = divText.length;
  for (let i = 0; i < divTextLen; ) {
    const word = divText[i];
    if (!word) {
      i++;
      continue;
    }
    switch (word) {
      case "Adresse & Kontakt":
        i++;
        while (
          i < divTextLen &&
          divText[i] != "Tätigkeitsbereiche" &&
          divText[i] != "Fremdsprachenkenntnisse"
        ) {
          if (
            divText[i] &&
            divText[i] != "E-Mail" &&
            divText[i] != "Homepage"
          ) {
            if (divText[i].startsWith("Tel.:")) {
              phone = divText[i].slice(5, divText[i].length);
            } else if (divText[i].startsWith("Fax:")) {
              fax = divText[i].slice(5, divText[i].length);
            } else {
              address += divText[i] + "\n";
            }
          }
          i++;
        }
        break;

      case "Tätigkeitsbereiche":
        i++;
        while (
          i < divTextLen &&
          divText[i] != "Adresse & Kontakt" &&
          divText[i] != "Fremdsprachenkenntnisse"
        ) {
          if (divText[i]) areaOfActivity += divText[i] + "\n";
          i++;
        }
        break;

      case "Fremdsprachenkenntnisse":
        i++;
        while (
          i < divTextLen &&
          divText[i] != "Adresse & Kontakt" &&
          divText[i] != "Tätigkeitsbereiche"
        ) {
          if (divText[i]) foreignLanguages += divText[i] + "\n";
          i++;
        }
        break;

      default:
        console.log(`Not Matched in the first div: ${word}`);
        i++;
    }
  }

  return [address, areaOfActivity, foreignLanguages, phone, fax];
};

const parseThirdDiv = (thirdDiv) => {
  const divText = thirdDiv.split("\n");
  let professionalAssociation = "",
    medicalCareCenterWith = "",
    otherAdvantages = "",
    officeHours = "",
    telephoneAvailibility = "";

  const divTextLen = divText.length;
  for (let i = 0; i < divTextLen; ) {
    const word = divText[i];
    if (!word) {
      i++;
      continue;
    }
    switch (word) {
      case "Berufsausübungsgemeinschaft mit":
        i++;
        while (
          i < divTextLen &&
          !divText[i].startsWith("Angebote") &&
          divText[i] != "Sprechstunden"
        ) {
          if (divText[i]) professionalAssociation += divText[i] + "\n";
          i++;
        }
        break;

      case "Medizinisches Versorgungszentrum mit":
        i++;
        while (
          i < divTextLen &&
          !divText[i].startsWith("Angebote") &&
          divText[i] != "Sprechstunden"
        ) {
          if (divText[i]) medicalCareCenterWith += divText[i] + "\n";
          i++;
        }
        break;

      case "Angebote für Menschen mit Behinderung":
        while (i < divTextLen && divText[i] != "Sprechstunden") {
          otherAdvantages += divText[i] + "\n";
          i++;
        }
        break;

      case "Sprechstunden":
        i++;
        while (i < divTextLen && divText[i] != "Telefonische Erreichbarkeit") {
          officeHours += divText[i] + "\n";
          i++;
        }
        break;

      case "Telefonische Erreichbarkeit":
        i++;
        while (i < divTextLen) {
          telephoneAvailibility += divText[i] + "\n";
          i++;
        }
        break;

      default:
        i++;
        console.log(
          `Not Matched in the third div: ${word} with value of i: ${i}`
        );
    }
  }

  return [
    professionalAssociation,
    otherAdvantages,
    officeHours,
    telephoneAvailibility,
  ];
};

const processName = (nameWithTitle) => {
  const splittedName = nameWithTitle.split(",");
  const firstName = splittedName[1];
  const lastNameWithTitle = splittedName[0];
  const lastNameWithTitleWords = lastNameWithTitle.split(" ");
  let title = "";
  let lastName = "";
  for (const word of lastNameWithTitleWords) {
    if (word.endsWith(".")) {
      title += word + " ";
    } else {
      lastName += word + " ";
    }
  }

  return [title.trim(), firstName.trim() + " " + lastName.trim()];
};

module.exports = (nameWithTitle, firstDiv, thirdDiv) => {
  const [address, areaOfActivity, foreignLanguages, phone, fax] = parseFirstDiv(
    firstDiv
  );

  let professionalAssociation = "",
    otherAdvantages = "",
    officeHours = "",
    telephoneAvailibility = "";
  if (thirdDiv) {
    [
      professionalAssociation,
      otherAdvantages,
      officeHours,
      telephoneAvailibility,
    ] = parseThirdDiv(thirdDiv);
  }

  const [title, name] = processName(nameWithTitle);

  const details = {
    Title: title,
    Name: name,
    Address: address,
    "Area of activity": areaOfActivity,
    "Foreign Languages": foreignLanguages,
    Phone: phone,
    Fax: fax,
    "Professional Association": professionalAssociation,
    "Other Advantages": otherAdvantages,
    "Office Hours": officeHours,
    "Telephone Availibiilty": telephoneAvailibility,
  };

  return details;
};
