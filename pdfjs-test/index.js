var apiKey = "b93d9d2475ed072f999710c6949f6a65";

const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs");
var endpoint = "https://api.meaningcloud.com/summarization-1.0";

class Paragraph {
  constructor(title, text) {
    this.title = title;
    this.noOfSentences = 0;
    this.text = text;
    this.summaryText = "";
  }

  setNoOfSentences(noOfSentences) {
    this.noOfSentences = noOfSentences;
  }

  appendText(newtext) {
    this.text.appendText(newtext);
  }
}

/**
 * Extarct texts from a pdf file
 * @param {string} src
 */
async function getPdfTextContent(src) {
  const doc = await pdfjs.getDocument(src).promise;
  const totalPageCount = doc.numPages;

  // clear the text file //
  fs.truncateSync("./output.txt", 0);
  fs.truncateSync("./object.txt", 0);

  let textChunkArray = [];
  heights = [];

  for (let i = 1; i <= totalPageCount; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    textChunkArray = textChunkArray.concat(getTextChunkObject(textContent));
    writeToFile("./output.txt", textContent, i);
    writeObjectToFile("./object.txt", textContent, i);
    writeUniqueHeights(heights, textContent);
  }

  // heights.sort();

  // console.log(sortedHeights);
  /* sortedHeights.forEach((element) => {
    fs.appendFileSync(
      "./heights.txt",
      JSON.stringify(element) + "\n",
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
  }); */

  // fs.appendFileSync("./heights.txt", JSON.stringify(height));
  return textChunkArray;
}

function writeUniqueHeights(heights, content) {
  const items = content.items.map((item) => {
    heights.push(item.height);
  });
}

function getTextChunkObject(content) {
  let retItems = content.items.map((item) => {
    return {
      ...item,
      style: content.styles[item.fontName],
    };
  });
  return retItems;
}

function writeObjectToFile(filePath, content, pageNo) {
  let data = `page No: ${pageNo} \n===============\n`;
  let pos = 0;

  const items = content.items.map((item) => {
    let style = content.styles[item.fontName];
    // console.log(item, style);

    heights.push(item.height);

    data += `item no ${pos}
    ------------------------
    item.str=${item.str}
    item.dir=${item.dir}
    item.width=${item.width}
    item.height=${item.height}
    item.transforme=${item.transform}
    item.hasEOL=${item.hasEOL}
    item.fontName=${style.fontFamily}
    
    content.styles object for this chunk
    ${JSON.stringify(style)}
    --------------------------------\n`;
    pos++;
  });

  data += `\n`;

  // fs.appendFileSync("./heights.txt", uniqueHeight);
  fs.appendFileSync(filePath, data);
}

function writeToFile(filePath, content, pageNo) {
  let data = `page No: ${pageNo} \n===============\n`;
  const items = content.items.map((item) => {
    data += item.str + `\n`;
  });
  data += `\n`;
  fs.appendFileSync(filePath, data);
}

async function createJsonObjectFromPdf(src) {
  let arr = await getPdfTextContent(src);

  heights = [];
  arr.forEach((element) => {
    heights.push(element.height);
  });
  allHeights = heights;

  const uniqueHeight = new Set(heights);

  heights = Array.from(uniqueHeight);
  sortedHeights = heights.sort(function (a, b) {
    return b - a;
  });

  heightsCounter = new Array(heights.length).fill(0);
  allHeights.forEach((element) => {
    for (var i = 0; i < heights.length; i++) {
      if (heights[i] === element) {
        heightsCounter[i]++;
      }
    }
  });

  // for (let i = 0; i < heights.length; i++) {
  //   console.log(heights[i] + "\t" + heightsCounter[i]);
  // }

  let titleHeightIndex = 0;
  let generalTextHeightIndex = 0;

  let tempMax = -1;
  for (var i = 0; i < heights.length; i++) {
    if (heightsCounter[i] > heightsCounter[generalTextHeightIndex]) {
      generalTextHeightIndex = i;
    }
  }
  tempMax = -1;
  for (var i = 0; i < generalTextHeightIndex; i++) {
    if (heightsCounter[i] > heightsCounter[titleHeightIndex]) {
      titleHeightIndex = i;
    }
  }

  let titleHeight = heights[titleHeightIndex];
  let generalTextHeight = heights[generalTextHeightIndex];

  let wiggleHeight = heights[generalTextHeightIndex] - 0.3;
  // console.log(wiggleHeight);

  arr.forEach((element) => {
    // if (element.height == titleHeight) console.log(element.str);
  });

  arr = arr.filter((element) => element.height > wiggleHeight);
  // console.log(arr);
  // Extract title and text
  let paragraphs = [];
  let isAbstract = false;
  let maxLimit = arr.length;

  for (let i = 0; i < maxLimit; i++) {
    if (arr[i].height == titleHeight && arr[i].str.includes("References")) {
      let referanceText = "";
      let j = i;
      if (j < maxLimit) j++;
      while (j < maxLimit) {
        referanceText += arr[j].str;
        j++;
      }

      paragraphs.push(new Paragraph("References", referanceText));
      break;
    }
    // if (arr[i].height == titleHeight && arr[i].str.includes("Abstract")) {
    if (arr[i].str.includes("Abstract")) {
      isAbstract = true;
    }
    if (arr[i].height == titleHeight && isAbstract) {
      let titleString = arr[i].str;
      let titleIterator = i + 1;

      while (arr[titleIterator].height == titleHeight) {
        if (titleString === "") {
          titleString += arr[titleIterator].str;
        } else {
          titleString += " ";
          titleString += arr[titleIterator].str;
        }
        // console.log(arr[titleIterator].str);
        titleIterator++;
      }
      // console.log(titleString);
      i = titleIterator;
      i--;
      if (i + 1 < maxLimit) i++;
      let genText = "";
      while (i < maxLimit && arr[i].height != titleHeight) {
        if (arr[i].height == generalTextHeight) genText += arr[i].str;
        i++;
      }
      i--;
      let newPara = new Paragraph(titleString, genText);
      paragraphs.push(newPara);
      // console.log(titleString);
      // console.log(genText);
      // console.log("\n");

      titleString = "";
      genText = "";
    }
  }

  paragraphs.map((element) => {
    let sentenceNo = noOfSentences(element.text);
    // console.log(sentenceNo);
    element.setNoOfSentences(sentenceNo);
  });
  // Writing JSON object to file
  fs.truncateSync("./preprocessed.json", 0);
  fs.writeFileSync("./preprocessed.json", JSON.stringify(paragraphs));

  // console.log(paragraphs);
  return paragraphs;

  // console.log(acceptedHeights);
  // console.log("Title index is " + titleHeightIndex);
  // console.log("General Text index is " + generalTextHeightIndex);
}

function noOfSentences(context) {
  let noOfSentence = 0;
  for (var i = 0; i < context.length; i++) {
    if (context[i] == "." || context[i] == "?" || context[i] == "!")
      noOfSentence++;
  }
  // console.log(noOfSentence);
  return noOfSentence;
}

// noOfSentences("Hello. I'm kauwa. Whatcha doin?");

async function summary() {
  let paragraphs = await createJsonObjectFromPdf("./sample4.pdf");
  let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let apiKey = "b93d9d2475ed072f999710c6949f6a65";

  for (let i = 0; i < paragraphs.length; i++) {
    let element = paragraphs[i];

    if (element.noOfSentences > 50) {
      noOfSentenceInSummary = parseInt(element.noOfSentences / 10);
    } else {
      noOfSentenceInSummary = parseInt(element.noOfSentences / 3);
    }

    let contextString = element.text;
    let retryCount = 0;

    while (retryCount < 3) {
      try {
        let summary = await requestSummaryWithRetry(
          contextString,
          noOfSentenceInSummary,
          apiKey,
          retryCount
        );
        console.log(`Summary holo: index ${i} ${JSON.stringify(summary)}`);

        paragraphs[i].summaryText = summary;
        break; // Exit the retry loop if request succeeds
      } catch (error) {
        console.log(`Error: index ${i} ${error}`);
        retryCount++;
        await delay(1000); // Wait for 5 seconds before making the next request
      }
    }
  }

  fs.writeFileSync("./preprocessed.json", JSON.stringify(paragraphs));

  async function requestSummaryWithRetry(
    contextString,
    noOfSentences,
    apiKey,
    retryCount
  ) {
    let formData = new FormData();
    formData.append("key", apiKey);
    formData.append("txt", contextString);
    formData.append("sentences", noOfSentences);
    formData.append("retry", retryCount); // Add retry count to formData

    let requestOptions = {
      method: "POST",
      body: formData,
      redirect: "follow",
    };

    let response = await fetch(
      "https://api.meaningcloud.com/summarization-1.0",
      requestOptions
    );

    if (response.status !== 200) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    let { summary } = await response.json();

    return summary;
  }
}

summary();
