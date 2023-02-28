const axios = require("axios");

const rootPaperId = `87e367d76e5c63c834bf77b4f6ea8bce6cdb5553`;

let baseCitationUrl = `https://api.semanticscholar.org/graph/v1/paper/${rootPaperId}?fields=title,citations`;

class CitationNode {
  constructor(paperId, title, level) {
    this.paperId = paperId;
    this.title = title;
    this.level = level;
    this.citationChildren = [];
  }

  addCitation(citation) {
    this.citationChildren.push(citation);
  }
}

class CitationEdge {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
}

async function getCitations(url) {
  var citationResponse = await axios.get(baseCitationUrl);

  let rootNodeTitle = citationResponse.data.title;
  let rootCitationData = citationResponse.data.citations;

  console.log(rootCitationData);
  var rootNode = new CitationNode(rootPaperId, rootNodeTitle, 0);

  // let edgeList = [];

  // let rootEdge = new CitationEdge("-1", rootNode);
  // edgeList.push(rootEdge);

  // /* let promiseArray = rootCitationData
  //   .filter((element) => element.paperId != null)
  //   .map((element) => {
  //     let paperId = element.paperId;
  //     let paperTitle = element.title;
  //     let citationNode = new CitationNode(paperId, paperTitle);

  //     let tempCitationEdge = new CitationEdge(rootNode, citationNode);
  //     edgeList.push(tempCitationEdge);

  //     rootNode.addCitation(citationNode);

  //     let url = https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=title,citations;
  //     // console.log(url);
  //     // return axios.get(url);
  //   }); */

  // let nodeArray = [];
  // nodeArray.push(rootNode);
  // let runningNode = rootNode;
  // let runningUrl = ``;
  // while (nodeArray.length != 0) {
  //   runningNode = nodeArray[0];
  //   if (runningNode.level > 1) {
  //     break;
  //   }
  //   paperId = runningNode.paperId;
  //   runningUrl = `https://api.semanticscholar.org/graph/v1/paper/${paperId}?fields=title,citations`;

  //   var runningCitationResponse = await axios.get(runningUrl);

  //   citationChildren = runningCitationResponse.data.citations;

  //   citationChildren
  //     .filter((element) => element.paperId != null)
  //     .forEach((element) => {
  //       let paperId = element.paperId;
  //       let paperTitle = element.title;
  //       let paperLevel = runningNode.level + 1;
  //       let citationNode = new CitationNode(paperId, paperTitle, paperLevel);
  //       nodeArray.push(citationNode);
  //       edgeList.push(new CitationEdge(runningNode, citationNode));
  //     });

  //   console.log(runningNode);
  //   nodeArray.shift();
  // }

  // console.log(edgeList);

  // console.log(rootNode);

  /* let ok = await Promise.allSettled(promiseArray);
  ok = ok.map((item) => item.value.data);
  // console.log(ok);
  ok.forEach((element) => {
    // console.log(element.data);
  });
  return ok; */
  //   return promiseArray;
}

async function main() {
  let val = await getCitations(baseCitationUrl);
  // console.log(val);
}

main();
