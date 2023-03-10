var apiKey = "b93d9d2475ed072f999710c6949f6a65";

const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const { OneAI } = require("oneai");
const fs = require("fs");
var endpoint = "https://api.meaningcloud.com/summarization-1.0";

class Title {
  constructor(titleText, titleIndex) {
    (this.titleText = titleText), (this.titleIndex = titleIndex);
  }
}

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
  doc.getDestination;
  // clear the text file //
  fs.truncateSync("./output.txt", 0);
  fs.truncateSync("./object.txt", 0);

  let textChunkArray = [];
  heights = [];

  for (let i = 1; i <= totalPageCount; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    textChunkArray.push(getTextChunkObject(textContent));
    writeToFile("./output.txt", textContent, i);
    writeObjectToFile("./object.txt", textContent, i);
    writeUniqueHeights(heights, textContent);
  }
  const uniqueHeight = new Set(heights);
  heights = Array.from(uniqueHeight);
  sortedHeights = heights.sort(function (a, b) {
    return b - a;
  });

  // console.log(sortedHeights);
  sortedHeights.forEach((element) => {
    fs.appendFileSync(
      "./heights.txt",
      JSON.stringify(element) + "\n",
      (err) => {
        if (err) {
          throw err;
        }
      }
    );
  });

  // fs.appendFileSync("./heights.txt", JSON.stringify(height));
  return { textChunkArray, uniqueHeight };
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
  let { textChunkArray: arr } = await getPdfTextContent(src);
  arr = arr.flat();

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

  let wiggleHeight = heights[generalTextHeightIndex] - 1;
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

      let referanceParagraph = new Paragraph("References", referanceText);
      paragraphs.push(referanceParagraph);
      break;
    }
    // if (arr[i].height == titleHeight && arr[i].str.includes("Abstract")) {
    if (arr[i].str.includes("Abstract")) {
      isAbstract = true;
      let abstractTextTitle = arr[i].str;
      let abstractTextHeight = arr[i].height;
      // console.log(abstractTextHeight);
      // console.log(titleHeight);
      // console.log(wiggleHeight);
      let titleIterator = i;

      while (arr[titleIterator].height == abstractTextHeight) {
        // if (titleString === "") {
        //   abstractTextTitle += arr[titleIterator].str;
        // } else {
        //   abstractTextTitle += " ";
        //   abstractTextTitle += arr[titleIterator].str;
        // }
        abstractTextTitle += arr[titleIterator].str;
        // console.log(arr[titleIterator].str);
        titleIterator++;
      }
      // console.log(i + " " + arr[i].height + "  " + arr[i].str);
      i = titleIterator - 1;
      // console.log(i);
      let abstractText = "";

      if (i < maxLimit) i++;
      // i++;
      // console.log(i + " " + arr[i].height + "  " + arr[i].str);
      while (i < maxLimit && arr[i].height != titleHeight) {
        console.log(arr[i].str);
        abstractText += arr[i].str;
        i++;
      }
      i--;
      // console.log(abstractText);
      let abstractParagraph = new Paragraph("Abstract", abstractText);
      // console.log(abstractParagraph);
      paragraphs.push(abstractParagraph);
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

async function ExtractiveSummary(src) {
  let paragraphs = await createJsonObjectFromPdf(src);
  let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let apiKey = "dffe1d46b7dc44e77c2807c775855819";

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
        // console.log(`Summary holo: index ${i} ${JSON.stringify(summary)}`);

        paragraphs[i].summaryText = summary;
        break; // Exit the retry loop if request succeeds
      } catch (error) {
        console.log(`Error: index ${i} ${error}`);
        retryCount++;
        await delay(1000); // Wait for 1 second before making the next request
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

    // return paragraphs;

    let { summary } = await response.json();

    return summary;
  }
}

async function AbstractiveSummary(src) {
  let paragraphs = await createJsonObjectFromPdf(src);
  let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  let absApiKey = "453265e9-a392-4e2b-aacc-ecc527a3f41f";

  for (let i = 0; i < paragraphs.length; i++) {
    let element = paragraphs[i];
    let contextString = element.text;
    let retryCount = 0;

    if (element.noOfSentences > 50) {
      noOfSentenceInSummary = parseInt(element.noOfSentences / 10);
    } else {
      noOfSentenceInSummary = parseInt(element.noOfSentences / 3);
    }

    while (retryCount < 3) {
      try {
        let summary = await requestAbsSummaryWithRetry(
          contextString,
          absApiKey,
          retryCount,
          noOfSentenceInSummary
        );
        paragraphs[i].summaryText = summary;
        break;
      } catch (error) {
        console.log(`Error: index ${i} ${error}`);
        retryCount++;
        await delay(1000);
      }
    }
  }

  fs.writeFileSync("./preprocessedAbs.json", JSON.stringify(paragraphs));

  async function requestAbsSummaryWithRetry(
    contextString,
    absApiKey,
    retryCount,
    noOfSentenceInSummary
  ) {
    const oneai = new OneAI(absApiKey, {
      multilingual: true,
    });

    const pipeline = new oneai.Pipeline(
      oneai.skills.summarize({ min_length: noOfSentenceInSummary })
    );

    async function absTesting() {
      let demo = await pipeline.run(contextString);
      return demo.summary.text;
    }

    return await absTesting();

    //  return {pipeline};
  }
}

// let src = `./sample4.pdf`;
// ExtractiveSummary(src);
// AbstractiveSummary(src);

async function createChunkForHighlighting() {
  let paragraphs = require("./preprocessed.json");
  let { textChunkArray: originalArr, uniqueHeight: heightArr } =
    await getPdfTextContent("./sample4.pdf");

  let summaryArray = [];
  paragraphs.forEach((element) => {
    if (element.title.toLowerCase().localeCompare("references") !== 0) {
      summaryArray.push(element.summaryText);
    }
  });
  fs.truncateSync("./sentences.json", 0);
  fs.writeFileSync("./sentences.json", JSON.stringify(summaryArray));

  let chunkSentencesArr = [];
  originalArr.map((page) => {
    let pageChunks = page.map((chunk) => {
      let chunkSentences = breakTextChunkIntoSentence(chunk.str);
      return chunkSentences;
    });
    chunkSentencesArr.push(pageChunks);
  });
  fs.truncateSync("./test.json", 0);
  fs.writeFileSync("./test.json", JSON.stringify(chunkSentencesArr));

  let highlightsSegments = [];
  let stillCountingSentence = false;
  let temp = {
    sentence: "",
    segment: [],
  };
  for (let pageIndex = 0; pageIndex < chunkSentencesArr.length; pageIndex++) {
    let pageChunks = chunkSentencesArr[pageIndex];
    for (let chunkIndex = 0; chunkIndex < pageChunks.length; chunkIndex++) {
      let chunk = pageChunks[chunkIndex];

      if (chunk.length > 1) {
        // Start
        if (stillCountingSentence) {
          temp.sentence += chunk[0];
          temp.segment.push({
            str: chunk[0],
            pageNo: pageIndex + 1,
            chunkIndex: chunkIndex,
          });

          highlightsSegments.push(temp);
          // reset temp
          temp = {
            sentence: "",
            segment: [],
          };

          stillCountingSentence = false;
        }

        // Middle
        for (let i = 1; i < chunk.length - 1; i++) {
          temp.sentence += chunk[i];
          temp.segment.push({
            str: chunk[i],
            pageNo: pageIndex + 1,
            chunkIndex: chunkIndex,
          });

          highlightsSegments.push(temp);
          // reset temp
          temp = {
            sentence: "",
            segment: [],
          };
        }

        // End
        stillCountingSentence = true;
        temp.sentence += chunk[chunk.length - 1];
        temp.segment.push({
          str: chunk[chunk.length - 1],
          pageNo: pageIndex + 1,
          chunkIndex: chunkIndex,
        });
      } else {
        if (stillCountingSentence) {
          temp.sentence += chunk[chunk.length - 1];
          temp.segment.push({
            str: chunk[0],
            pageNo: pageIndex + 1,
            chunkIndex: chunkIndex,
          });
        } else {
          stillCountingSentence = true;
          temp.sentence += chunk[chunk.length - 1];
          temp.segment.push({
            str: chunk[0],
            pageNo: pageIndex + 1,
            chunkIndex: chunkIndex,
          });
        }
      }
    }
  }
  fs.writeFileSync("./segments.json", JSON.stringify(highlightsSegments));

  //Match with summary text

  function matchSummaryandHighlight() {
    let allSegmentCheck = highlightsSegments;
    let summaryCheck = summaryArray;
    let filteredSegments = [];

    for (let i = 0; i < allSegmentCheck.length; i++) {
      let sens = allSegmentCheck[i];
      if (
        summaryCheck.some((summary) => summary.includes(sens?.sentence)) &&
        sens?.sentence.trim().split(" ").length > 1
      )
        filteredSegments.push(sens);
      else {
        let demo = { sentence: sens.sentence, segment: [] };
        for (let j = 0; j < sens.segment.length; j++) {
          if (
            summaryCheck.some((summary) =>
              summary.includes(sens.segment[j].str)
            ) &&
            sens.segment[j].str.trim().split(" ").length > 1
          )
            demo.segment.push(sens.segment[j]);
        }
        if (demo.segment.length > 0) filteredSegments.push(demo);
      }
    }

    fs.truncateSync("./highlight.json", 0);
    fs.writeFileSync("./highlight.json", JSON.stringify(filteredSegments));
  }
  matchSummaryandHighlight();
}

async function objectForIndex(index) {
  const { textChunkArray } = await getPdfTextContent(src);
  for (let i = 0; i < textChunkArray.length; i++) {
    let pageLen = textChunkArray[i].length;
    if (index > pageLen) {
      index -= pageLen;
    } else {
      let object = {
        pageNo: i,
        chunkNo: index,
        chunk: textChunkArray[i][index],
      };
      return object;
    }
  }
}

function getMaxFreq(arr, heights) {
  let freq = Array.from(heights).map((item) => {
    return { height: item, count: 0 };
  });
  arr.map((page) => {
    page.map((chunk) => {
      for (let i = 0; i < freq.length; i++) {
        if (freq[i].height == chunk.height) freq[i].count++;
      }
    });
  });
  let max = freq[0];
  for (let i = 1; i < freq.length; i++) {
    if (max.count < freq[i].count && freq[i].height > 0) max = freq[i];
  }
  console.log(max);
}

// objectForIndex(1130);
// createChunkForHighlighting();
// const src = "./sample4.pdf";

// createJsonObjectFromPdf(src);
function breakTextChunkIntoSentence(textChunk) {
  let sentences = textChunk.split(/[.?!]/g);
  return sentences;
}

// objectForIndex(1130);
createChunkForHighlighting();
