var request = require('request');   // For meaning cloud summarization
let  axios = require('axios'); 
var apiKey = 'b93d9d2475ed072f999710c6949f6a65';

const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs");
var endpoint = 'https://api.meaningcloud.com/summarization-1.0';

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

async function createJsonObjectFromPdf() {
  let arr = await getPdfTextContent("./sample4.pdf");

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
    if (context[i] == ".") noOfSentence++;
  }
  // console.log(noOfSentence);
  return noOfSentence;
}

// noOfSentences("Hello. I'm kauwa. Whatcha doin?");

async function summary() {
  let paragraphs = await createJsonObjectFromPdf();

paragraphs.forEach(async(element, index) => {
    noOfSentenceInSummary = parseInt(element.noOfSentences / 3);
     let contextString = element.text;

      let summary = await requestSummary (contextString,noOfSentenceInSummary);
      console.log("Summary holo: "+JSON.stringify(summary));

      paragraphs[index].summaryText = summary;

// Get form data



  });


  let text = 'One month after the United States began what has become a \ntroubled rollout of a national COVID vaccination campaign, the effort is finally \ngathering real steam. Close to a million doses -- over 951,000, to be more exact -- \nmade their way into the arms of Americans in the past 24 hours, the U.S. Centers \nfor Disease Control and Prevention reported Wednesday. That s the largest number \nof shots given in one day since the rollout began and a big jump from the \nprevious day, when just under 340,000 doses were given, CBS News reported. \nThat number is likely to jump quickly after the federal government on Tuesday \ngave states the OK to vaccinate anyone over 65 and said it would release all \nthe doses of vaccine it has available for distribution. Meanwhile, a number \nof states have now opened mass vaccination sites in an effort to get larger \nnumbers of people inoculated, CBS News reported.';

  // let summary = await requestSummary (text,5);
  // console.log("Summary holo: "+JSON.stringify(summary));


  async function requestSummary (contextString, noOfSentences) {
  let returnVal;
  const formData = new FormData();

  formData.append( 'key', apiKey);
  formData.append('txt', contextString);
  formData.append('sentences',noOfSentences);

  const requestOptions = {
    method: 'POST',
    body: formData,
    redirect: 'follow'
  };
  
  const response = fetch("https://api.meaningcloud.com/summarization-1.0", requestOptions)
    .then(response => {
      return response.json()
    })
    .then((res) => res )
    .catch(error => console.log('error', error));

   return response;
  }
// Need to be updated
 //  fs.writeFileSync("./preprocessed.json", JSON.stringify(paragraphs));
}


summary();

createJsonObjectFromPdf();
