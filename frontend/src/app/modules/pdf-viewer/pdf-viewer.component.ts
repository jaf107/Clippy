import { Component, AfterViewInit, OnInit} from '@angular/core';
import { FeaturesService } from '../shared/features.service';
import { PdfShareService } from '../shared/pdf-share.service';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements AfterViewInit, OnInit {

  pdfPath: any;
  pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  public summarizerOn: boolean;
  public graphOn: boolean;

  zoom = 1;
  page = 1;
  totalPages = 0;

  private file: File | null;
  private url: any;

  visitedFiles = [];


  constructor(
    private toastr: ToastrService,
    public pdfShareService: PdfShareService,
    private http: HttpClient
    ) {
    /* More likely than not you don't need to tweak the pdfDefaultOptions.
       They are a collecton of less frequently used options.
       To illustrate how they're used, here are two example settings: */
    // but most devices support much higher resolutions.
    // Increasing this setting allows your users to use higher zoom factors,
    // trading image quality for performance.
    
    }


  ngOnInit(){
    
    this.pdfPath = this.pdfShareService.getFile();
    console.log(this.pdfPath);

    if(this.pdfPath == null){
      this.pdfPath = "./assets/SCORE_intro.pdf";
    }
    
    this.summarizerOn = false;
    this.graphOn = false;

    this.pdfShareService.getSummarizerStatus().subscribe((value)=>{
      this.summarizerOn = value;
      console.log("Summary is on " + this.summarizerOn);
    })

    this.pdfShareService.getKnowledgeGraphStatus().subscribe((value)=>{
      this.graphOn = value;
    })

  }

  ngAfterViewInit(){
    console.log("View is initialized " + this.pdfPath);
  }

    loaded(){
      console.log("Loaded " + this.pdfPath);
    }

    failed(){
      console.log("Failed " + this.pdfPath);
    }

    starts(){
      console.log("Started " + this.pdfPath);
    }


  zoomIn() {
    this.zoom += 0.1;
  }

  zoomOut() {
    this.zoom -= 0.1;
    if (this.zoom < 0.5) {
      this.zoom = 0.5;
    }
  }

  goToPage() {
    if (this.page > this.totalPages) {
      this.page = this.totalPages;
    }
    if (this.page < 1) {
      this.page = 1;
    }
    
  
}

loadComplete(pdfData: any) {
   this.totalPages = pdfData.numPages;
}

openFileDialog(){
  document.getElementById('upload').click();
}


downloadPdf() {
  console.log(this.pdfPath);
  const blob = new Blob([this.pdfPath], { type: 'application/octet-stream' });
  saveAs(blob, 'test.pdf');
}

uploadPdf(e){
  this.file = e.target.files[0];
    this.visitedFiles.push({name:this.file.name, lastVisited: new Date()});
    console.log(this.visitedFiles);

    if(this.file.type != 'application/pdf'){
      console.log('Not supported file type!');
      this.errorsmsg();
     }

    const reader = new FileReader();
    reader.onload = () => {
      this.url = reader.result;
      this.pdfPath = this.url;

    };
    reader.readAsArrayBuffer(this.file);
}

errorsmsg(){  
  this.toastr.error("The uploaded file is not a pdf",'Unsupported File Type');
}

}
