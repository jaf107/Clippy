import { exportImages } from "pdf-export-images";
// exportImages("./icse-template.pdf", "./out/")
//   .then((images) => console.log("Exported", images.length, "images"))
//   .catch(console.error);

/**
 * Function to extract embedded image from a pdf file
 * @param {string} pdf_file_path
 * @param {string} output_foldar_path
 */
export const exportPDFImage = function (pdf_file_path, output_foldar_path) {
  exportImages(pdf_file_path, output_foldar_path)
    .then((images) => console.log("Exported", images.length, "images"))
    .catch(console.error);
};
