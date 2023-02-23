import fs from "fs";
import PDFParser from "pdf2json";

const pdfParser = new PDFParser();

pdfParser.on("pdfParser_dataError", (errData) =>
  console.error(errData.parserError)
);
pdfParser.on("pdfParser_dataReady", (pdfData) => {
  fs.writeFileSync("./sample.json", JSON.stringify(pdfData));
});
pdfParser.on("pdfParser_dataReady", (pdfData) => {
  fs.writeFile("./RawSample.txt", pdfParser.getRawTextContent(), () => {
    console.log("Done.");
  });
});

pdfParser.loadPDF("./sample4.pdf");
