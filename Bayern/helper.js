const fs = require("fs");

const parseName = (name) => {
  const nameWithSpecialty = name;
  const nameWords = nameWithSpecialty.split(",");
  const nameWithTitle = nameWords[0];

  let title = "",
    actualName = "";
  const nameWithTitleWords = nameWithTitle.split(" ");
  for (const word of nameWithTitleWords) {
    if (word.endsWith(".")) title += word + " ";
    else actualName += word + " ";
  }

  const type = nameWords[1];
  const specialtyDetails = nameWords[2];

  return [title, actualName, type, specialtyDetails];
};

const parseOfficeHours = (hours) => {
  const hoursSplit = hours.split("\n").toString();
  return hoursSplit;
};

const parseOtherDetails = (otherDetails) => {
  const detailsWords = otherDetails.split("\n");
  const detailsWordsLen = detailsWords.length;
  let address = [],
    telephone = "",
    fax = "",
    web = "",
    email = "";

  let i = 0;
  let currentWord = detailsWords[i];
  while (
    i < detailsWordsLen &&
    !currentWord.startsWith("Tel") &&
    !currentWord.startsWith("Fax") &&
    !currentWord.startsWith("Web") &&
    !currentWord.startsWith("E-mail")
  ) {
    if (currentWord) address.push(currentWord);
    i++;
    currentWord = detailsWords[i];
  }

  for (; i < detailsWordsLen; i++) {
    const word = detailsWords[i];
    if (!word) continue;
    if (word.startsWith("Tel.:")) {
      telephone = word.split("\t")[1];
      continue;
    } else if (word.startsWith("Fax.:")) {
      fax = word.split("\t")[1];
      continue;
    } else if (word.startsWith("Web:")) {
      web = word.split("\t")[1];
      continue;
    } else if (word.startsWith("E-mail:")) {
      email = word.split("\t")[1];
      continue;
    }
  }

  return [address.toString(), telephone, fax, web, email];
};

const parseAdditionalInfo1 = (additionalInfo) => {
  let addInfo = "";
  const infoWords = additionalInfo.split("\n");
  for (const word of infoWords) {
    const tempWord = word.trim();
    if (tempWord) {
      addInfo += tempWord + "\n";
    }
  }

  return addInfo;
};

const parseAdditionalInfo2 = (additionalInfo2) => {
  let addInfo = "";
  const infoWords = additionalInfo2.split("\n");
  for (const word of infoWords) {
    const tempWord = word.trim();
    if (tempWord) {
      addInfo += tempWord + "\n";
    }
  }

  return addInfo;
};

const file = fs.readFileSync("details_GA.json", "utf-8");
const fileJson = JSON.parse(file);
const detailsParsed = [];

for (const object of fileJson) {
  const name = object["Name and Specialty"];
  const otherDetails = object["Other Details"];
  const officeHours = object["Office Hours"];
  const additionalInfo = object["Additional Info 1"];
  const additionalInfo2 = object["Additional Info 2"];

  const [title, actualName, type, specialty] = parseName(name);
  const officeHourParsed = parseOfficeHours(officeHours);
  const [address, telephone, fax, web, email] = parseOtherDetails(otherDetails);
  const additionalInfoPart1 = parseAdditionalInfo1(additionalInfo);
  const additionalInfoPart2 = parseAdditionalInfo2(additionalInfo2);

  detailsParsed.push({
    Title: title,
    Name: actualName,
    Type: type,
    Specialty: specialty,
    "Office Hours": officeHourParsed,
    Address: address,
    Telephone: telephone,
    Fax: fax,
    Web: web,
    Email: email,
    "Other Details": additionalInfoPart1 + "\n" + additionalInfoPart2,
  });
}

fs.writeFile("GA.json", JSON.stringify(detailsParsed), () => {});
