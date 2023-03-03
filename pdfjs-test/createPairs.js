import { getPdfTextContent } from "./index";
import { exportPDFImage } from "../extrect-image/index";

const output_path = "./out/";

async function extractData(pdf_path) {
  await getPdfTextContent(pdf_path);
  exportPDFImage(pdf_path, output_path);
}

extractData("./sample1.pdf");
