import { Component, AfterViewInit, OnInit} from '@angular/core';
import { FeaturesService } from '../shared/features.service';
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
  public graphOn: boolean;

  constructor(
    public pdfShareService: PdfShareService,
    private featureService: FeaturesService
    ) {
    /* More likely than not you don't need to tweak the pdfDefaultOptions.
       They are a collecton of less frequently used options.
       To illustrate how they're used, here are two example settings: */
    // pdfDefaultOptions.doubleTapZoomFactor = '150%'; // The default value is '200%'
    // pdfDefaultOptions.maxCanvasPixels = 4096 * 4096 * 5; // The default value is 4096 * 4096 pixels,
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


}
