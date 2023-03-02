const db = require("../models");
const User = db.user;
const Paper = db.paper;
const cloudinary = require("cloudinary");
const axios = require("axios");
const SEMANTIC_SCHOLAR_API = "https://api.semanticscholar.org/graph/v1/paper/";
const SERVER_ADDRESS = "http://localhost:8080";
const fs = require("fs");
var apiKey = "b93d9d2475ed072f999710c6949f6a65";
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");
const { OneAI } = require("oneai");
var endpoint = "https://api.meaningcloud.com/summarization-1.0";
var FormData = require("form-data");
const { DownloaderHelper } = require("node-downloader-helper");
const crawler = require("crawler-request");

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

async function DownloadPdf(paperId, url) {
  const dl = new DownloaderHelper(url, "./temp", {
    fileName: paperId + ".pdf",
  });
  dl.on("error", (err) => console.log("Download Failed", err));
  dl.on("end", () => {
    console.log("Download Completed");
    return true; // return true after download is completed
  });
  await dl.start(); // wait for the download to start and finish
}

exports.getPaperDetails = async (req, res) => {
  crawler("https://www.aclweb.org/anthology/N18-3011.pdf").then(function (
    response
  ) {
    // handle response
    console.log(response);
  });
  const ppr = await Paper.findOne({ paper_id: req.params.id });
  if (ppr) {
    if (req.userId) {
      updateHistory(req.userId, req.params.id, ppr.title);
    }
    res.status(200).send(ppr);
  } else {
    res.status(404).send("Paper not found");
  }
};

exports.getPaperDetailsfromSemanticScholar = async (req, res) => {
  const paper_data = await axios
    .get(
      SEMANTIC_SCHOLAR_API +
        req.params.id +
        "?fields=isOpenAccess,openAccessPdf,title,abstract,citationCount,referenceCount,authors"
    )
    .catch((err) => res.status(404).send("Paper Not Found"));
  if (paper_data) res.status(200).send(paper_data.data);
};

exports.uploadPaper = async (req, res) => {
  // console.log(req.body.title);
  // console.log(req.file);
  if (!req.body.title || !req.file) {
    res.status(404).send("File and Title are required");
  } else {
    axios
      .get(
        SEMANTIC_SCHOLAR_API +
          `search?query=${encodeURIComponent(
            req.body.title
          )}&limit=10&fields=title,abstract,isOpenAccess,openAccessPdf,citationCount,referenceCount,authors`
      )
      .then((paper_data) => {
        if (paper_data.data) {
          const data = paper_data.data.data[0];
          Paper.findOne({ paper_id: data.paperId })
            .then((ppr) => {
              if (ppr) {
                fs.unlinkSync(req.file.path);
                console.log("successfully deleted - paper found in db");
                res.status(200).send(ppr);
              } else {
                console.log("else " + ppr);
                const paper = {
                  paper_id: data.paperId,
                  title: data.title,
                  knowledge_graph: "",
                  url: data.isOpenAccess ? data.openAccessPdf.url : "",
                  abstract: data.abstract,
                  abstractive_summary: "",
                  extractive_summary: "",
                  citationCount: data.citationCount,
                  referenceCount: data.referenceCount,
                  authors: data.authors,
                };
                Paper.create(paper)
                  .then((r) => {
                    fs.unlinkSync(req.file.path, (err) => {
                      if (err) throw err;
                      console.log(
                        "successfully deleted - paper found in scholar"
                      );
                    });
                    if (req.userId) {
                      updateHistory(req.userId, paper.paper_id, paper.title);
                    }
                    res.status(200).send(paper);
                  })
                  .catch((err) => res.status(404).send(err.message));
              }
            })
            .catch((err) => res.status(404).send(err.message));
        } else {
          console.log(paper_data);
          Paper.findOne({ title: req.body.title })
            .then((ppr) => {
              if (ppr) {
                fs.unlinkSync(req.file.path, (err) => {
                  if (err) throw err;
                  console.log("successfully deleted");
                });
                if (req.userId) {
                  updateHistory(req.userId, ppr.paper_id, ppr.title);
                }
                res.status(200).send(ppr);
              } else {
                var uuid = Math.random().toString(36).substr(2, 9);
                fs.renameSync(
                  req.file.path,
                  "./uploads/" + uuid + ".pdf",
                  (err) => {
                    if (err) throw err;
                    console.log("File renamed successfully");
                  }
                );
                const paper = {
                  paper_id: uuid,
                  title: req.body.title,
                  knowledge_graph: "",
                  url: "/uploads/" + uuid + ".pdf",
                  abstract: "",
                  abstractive_summary: "",
                  extractive_summary: "",
                  citationCount: 0,
                  referenceCount: 0,
                  authors: [],
                };
                Paper.create(paper)
                  .then((r) => {
                    if (req.userId) {
                      updateHistory(req.userId, paper.paper_id, paper.title);
                    }
                    res.status(200).send(paper);
                  })
                  .catch((err) => res.status(404).send(err.message));
              }
            })
            .catch((err) => res.status(404).send(err.message));
        }
      })
      .catch((err) => res.status(404).send(err));
  }
};

exports.searchPaperByTitle = async (req, res) => {
  axios
    .get(
      SEMANTIC_SCHOLAR_API +
        `search?query=${encodeURIComponent(
          req.body.title
        )}&limit=10&fields=isOpenAccess,openAccessPdf`
    )
    .then((response) => {
      res.status(200).send(JSON.stringify(response.data));
    })
    .catch((err) => {
      res.status(404).send(err);
    });
};

exports.getPdf = async (req, res) => {
  axios
    .get(req.body.url, { responseType: "arraybuffer" })
    .then((response) => {
      console.log(response);
      res.status(200).send(JSON.stringify(response.data));
    })
    .catch((err) => res.status(404).send(err));
};

exports.uploadPaperById = async (req, res) => {
  const ppr = await Paper.findOne({ paper_id: req.body.paper_id });
  if (ppr) {
    if (req.userId) {
      updateHistory(req.userId, req.body.paper_id, ppr.title);
    }
    res.status(200).send(ppr);
  } else {
    const paper_data = await axios
      .get(
        SEMANTIC_SCHOLAR_API +
          req.body.paper_id +
          "?fields=isOpenAccess,openAccessPdf,title,abstract,citationCount,referenceCount,authors"
      )
      .catch((err) => res.status(404).send("Paper Not Found"));
    if (paper_data.data) {
      if (!paper_data.data.isOpenAccess || !paper_data.data.openAccessPdf)
        res.status(404).send("Paper Not Accessible");
      else {
        var paper = {
          title: paper_data.data.title,
          paper_id: paper_data.data.paperId,
          knowledge_graph: "",
          abstract: paper_data.data.abstract,
          url: paper_data.data.openAccessPdf.url,
          abstractive_summary: "",
          extractive_summary: "",
          citationCount: paper_data.data.citationCount,
          referenceCount: paper_data.data.referenceCount,
          authors: paper_data.data.authors,
        };
        await Paper.create(paper);
        if (req.userId) {
          updateHistory(req.userId, paper.paper_id, paper.title);
        }
        res.status(200).send(paper);
      }
    }
  }
};

exports.getAbstractSummary = async (req, res) => {
  var paper = await Paper.findOne({ paper_id: req.params.id });
  if (paper) {
    if (paper.abstractive_summary !== "") {
      res.status(200).send(JSON.stringify(paper.abstractive_summary));
    } else {
      await DownloadPdf(paper.paper_id, paper.url);
      AbstractSummary("./temp/" + paper.paper_id + ".pdf")
        .then((paragraphs) => {
          const result = Paper.updateOne(
            { paper_id: req.params.id },
            { $set: { abstractive_summary: JSON.stringify(paragraphs) } },
            { upsert: true }
          )
            .then((result) => {
              fs.unlink("./temp/" + paper.paper_id + ".pdf", (err) => {
                if (err) throw err;
                console.log("successfully deleted");
                res.status(200).send(JSON.stringify(paragraphs));
              });
            })
            .catch((err) => res.status(404).send(err));
          if (result) {
          }
        })
        .catch((err) => res.status(404).send(err));
    }
  } else {
    res.status(404).send("Paper not found");
  }
};

exports.getExtractSummary = async (req, res) => {
  var paper = await Paper.findOne({ paper_id: req.params.id });
  if (paper) {
    if (paper.extractive_summary !== "") {
      res.status(200).send(JSON.stringify(paper.extractive_summary));
    } else {
      await DownloadPdf(paper.paper_id, paper.url);
      ExtractSummary("./temp/" + paper.paper_id + ".pdf").then((paragraphs) => {
        const result = Paper.updateOne(
          { paper_id: req.params.id },
          { $set: { extractive_summary: JSON.stringify(paragraphs) } },
          { upsert: true }
        )
          .then(() => {
            fs.unlink("./temp/" + paper.paper_id + ".pdf", (err) => {
              if (err) throw err;
              console.log("successfully deleted");
              res.status(200).send(JSON.stringify(paragraphs));
            });
          })
          .catch((err) => res.status(200).send(err));
        // if (result) {
        // }
      });
    }
  } else {
    res.status(404).send("Paper not found");
  }
};

exports.getCitation = async (req, res) => {
  const rootPaperId = req.params.id;
  var paperInDB = await Paper.findOne({ paper_id: rootPaperId });
  if (paperInDB && paperInDB.knowledge_graph != "") {
    res.status(200).send(paperInDB.knowledge_graph);
  } else {
    var citationResponse = axios
      .get(SEMANTIC_SCHOLAR_API + `${rootPaperId}?fields=title,citations`)
      .then((citationResponse) => {
        let rootCitationData = citationResponse.data.citations;
        rootCitationData.unshift({
          paperId: citationResponse.data.paperId,
          title: citationResponse.data.title,
        });

        Paper.updateOne(
          { paper_id: rootPaperId },
          { $set: { knowledge_graph: JSON.stringify(rootCitationData) } },
          { upsert: true }
        )
          .then((result) => {
            res.status(200).send(JSON.stringify(rootCitationData));
          })
          .catch((err) => res.status(404).send(err.message));
      })
      .catch((err) => res.status(404).send(err.message));
    // if (citationResponse) {

    // } else {
    //   res.status(404).send(citationResponse);
    // }
  }
};

async function AbstractSummary(filepath) {
  console.log(filepath);
  let paragraphs = await createJsonObjectFromPdf(filepath);
  if (paragraphs.length > 0) {
    let delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    let absApiKey = "278aff3b-5c8d-4fe3-8fda-cb82b42fba4a";

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
          if (summary.length > 0) {
            paragraphs[i].summaryText = summary;
          }
          break;
        } catch (error) {
          console.log(`Error: index ${i} ${error}`);
          retryCount++;
          await delay(1000);
        }
      }
    }
    return paragraphs;
  }
}

async function ExtractSummary(src) {
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

        if (summary) {
          paragraphs[i].summaryText = summary;
        }
        break; // Exit the retry loop if request succeeds
      } catch (error) {
        console.log(`Error: index ${i} ${error}`);
        retryCount++;
        await delay(1000); // Wait for 1 second before making the next request
      }
    }
  }

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

    let response = await axios
      .post("https://api.meaningcloud.com/summarization-1.0", formData)
      .catch((err) => {
        throw new Error(`Request failed with error :  ${err}`);
      });
    if (response.data) {
      let { summary } = response.data;
      return summary;
    }
    // let { summary } = await response;
    // return summary;
  }

  const highlighted = await createChunkForHighlighting(src, paragraphs);
  return {
    paragraphs,
    highlighted,
  };
}

async function createChunkForHighlighting(src, paragraph) {
  let paragraphs = paragraph;
  let { textChunkArray: originalArr, uniqueHeight: heightArr } =
    await getPdfTextContent(src);

  let summaryArray = [];
  paragraphs.forEach((element) => {
    if (element.title.toLowerCase().localeCompare("references") !== 0) {
      summaryArray.push(element.summaryText);
    }
  });

  let chunkSentencesArr = [];
  originalArr.map((page) => {
    let pageChunks = page.map((chunk) => {
      let chunkSentences = breakTextChunkIntoSentence(chunk.str);
      return chunkSentences;
    });
    chunkSentencesArr.push(pageChunks);
  });

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
    return filteredSegments;
  }
  return matchSummaryandHighlight();
}

async function updateHistory(userId, paper_id, title) {
  // Find the document that matches the paper_id in the history array
  let doc = await User.findOne({ _id: userId, "history.paper_id": paper_id });
  // If the document exists, update the openedAt field for that paper_id
  if (doc) {
    await User.updateOne(
      { _id: userId, "history.paper_id": paper_id },
      { $set: { "history.$.openedAt": Date.now() } }
    );
    console.log("Updated time for paper_id", paper_id);
  } else {
    // If the document doesn't exist, push a new document to the history array with the paper_id and newTime
    await User.updateOne(
      { _id: userId },
      {
        $push: {
          history: { paper_id: paper_id, openedAt: Date.now(), title: title },
        },
      },
      { upsert: true }
    );
    console.log("Pushed new data for paper_id", paper_id);
  }
}

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
}

async function createJsonObjectFromPdf(src) {
  let { textChunkArray: arr } = await getPdfTextContent(src);
  arr = arr.flat();

  let heights = [];
  arr.forEach((element) => {
    heights.push(element.height);
  });
  let allHeights = heights;

  const uniqueHeight = new Set(heights);

  heights = Array.from(uniqueHeight);
  let sortedHeights = heights.sort(function (a, b) {
    return b - a;
  });

  let heightsCounter = new Array(heights.length).fill(0);
  allHeights.forEach((element) => {
    for (var i = 0; i < heights.length; i++) {
      if (heights[i] === element) {
        heightsCounter[i]++;
      }
    }
  });

  let titleHeightIndex = 0;
  let generalTextHeightIndex = 0;

  let tempMax = -1;
  let i;
  for (i = 0; i < heights.length; i++) {
    if (heightsCounter[i] > heightsCounter[generalTextHeightIndex]) {
      generalTextHeightIndex = i;
    }
  }
  tempMax = -1;
  for (i = 0; i < generalTextHeightIndex; i++) {
    if (heightsCounter[i] > heightsCounter[titleHeightIndex]) {
      titleHeightIndex = i;
    }
  }

  let titleHeight = heights[titleHeightIndex];
  let generalTextHeight = heights[generalTextHeightIndex];

  let wiggleHeight = heights[generalTextHeightIndex] - 1;

  arr.forEach((element) => {});

  arr = arr.filter((element) => element.height > wiggleHeight);
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
    if (arr[i].str.includes("Abstract")) {
      isAbstract = true;
      let abstractTextTitle = arr[i].str;
      let abstractTextHeight = arr[i].height;
      let titleIterator = i;

      while (arr[titleIterator].height == abstractTextHeight) {
        abstractTextTitle += arr[titleIterator].str;
        titleIterator++;
      }
      i = titleIterator - 1;
      let abstractText = "";

      if (i < maxLimit) i++;
      while (i < maxLimit && arr[i].height != titleHeight) {
        console.log(arr[i].str);
        abstractText += arr[i].str;
        i++;
      }
      i--;
      let abstractParagraph = new Paragraph("Abstract", abstractText);
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
        titleIterator++;
      }
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
      titleString = "";
      genText = "";
    }
  }

  paragraphs.map((element) => {
    let sentenceNo = noOfSentences(element.text);
    element.setNoOfSentences(sentenceNo);
  });
  return paragraphs;
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
async function getPdfTextContent(src) {
  const doc = await pdfjs.getDocument(src).promise;
  const totalPageCount = doc.numPages;
  doc.getDestination;
  let textChunkArray = [];
  let heights = [];

  for (let i = 1; i <= totalPageCount; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    textChunkArray.push(getTextChunkObject(textContent));
    writeUniqueHeights(heights, textContent);
  }
  const uniqueHeight = new Set(heights);
  heights = Array.from(uniqueHeight);
  let sortedHeights = heights.sort(function (a, b) {
    return b - a;
  });

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

function noOfSentences(context) {
  let noOfSentence = 0;
  for (var i = 0; i < context.length; i++) {
    if (context[i] == "." || context[i] == "?" || context[i] == "!")
      noOfSentence++;
  }
  // console.log(noOfSentence);
  return noOfSentence;
}
function breakTextChunkIntoSentence(textChunk) {
  let sentences = textChunk.split(/[.?!]/g);
  return sentences;
}
