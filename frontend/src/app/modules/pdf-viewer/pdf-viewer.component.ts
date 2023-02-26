import { Component, AfterViewInit, OnInit} from '@angular/core';
import { PdfShareService } from '../shared/pdf-share.service';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent implements AfterViewInit, OnInit {

  pdfPath: any;
  pdfSrc = "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf";
  public summarizerOn: boolean;

  ngOnInit(){
    
    this.pdfPath = this.pdfShareService.getFile();
    console.log(this.pdfPath);

    // this.pdfPath = "./assets/SCORE_intro.pdf";

    this.summarizerOn = false;

    this.pdfShareService.getSummarizerStatus().subscribe((value)=>{
      this.summarizerOn = value;
      console.log("Summary is on " + this.summarizerOn);
    })

  }

  ngAfterViewInit(){
    console.log("View is initialized " + this.pdfPath);
  }

  constructor(public pdfShareService: PdfShareService) {
  
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


}
