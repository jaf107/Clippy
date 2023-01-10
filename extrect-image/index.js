import { exportImages } from "pdf-export-images";
exportImages("./icse-template.pdf", "./out/")
  .then((images) => console.log("Exported", images.length, "images"))
  .catch(console.error);
