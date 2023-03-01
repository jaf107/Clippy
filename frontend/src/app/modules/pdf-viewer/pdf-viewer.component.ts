import { Component, AfterViewInit, OnInit} from '@angular/core';
import { FeaturesService } from '../shared/features.service';
import { PdfShareService } from '../shared/pdf-share.service';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

import * as HL from '../../../assets/highlight.json';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css'],
})
export class PdfViewerComponent implements AfterViewInit, OnInit {
  pdfPath: any;
  pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  public summarizerOn: boolean;
  public graphOn: boolean;

  zoom = 0.5;
  page = 1;
  totalPages = 0;
  rotation = 0;

  private file: File | null;
  private url: any;

  visitedFiles = [];


  constructor(
    private toastr: ToastrService,
    private pdfShareService: PdfShareService,
    public featureService: FeaturesService,
    private http: HttpClient
    ) {
    /* More likely than not you don't need to tweak the pdfDefaultOptions.
       They are a collecton of less frequently used options.
       To illustrate how they're used, here are two example settings: */
    // but most devices support much higher resolutions.
    // Increasing this setting allows your users to use higher zoom factors,
    // trading image quality for performance.
    
    }


  ngOnInit() {
    this.pdfPath = this.pdfShareService.getFile();
    console.log(this.pdfPath);

    if(this.pdfPath == null){
      this.pdfPath = "./assets/SCORE_intro.pdf";
    }
    
    this.summarizerOn = false;
    this.graphOn = false;

    this.featureService.getSummarizerStatus().subscribe((value) => {
      this.summarizerOn = value;
      console.log('Summary is on ' + this.summarizerOn);
    });

    this.featureService.getKnowledgeGraphStatus().subscribe((value)=>{
      this.graphOn = value;
    })
  }

  getReferences(e: any) {
    // console.log(e.data.length);
  }
  ngAfterViewInit() {
    console.log('View is initialized ' + this.pdfPath);
  }

  failed() {
    // console.log('Failed ' + this.pdfPath);
  }

    loaded(){
      console.log("Loaded " + this.pdfPath);
    }
  starts() {
    // console.log('Started ' + this.pdfPath);
  }

  /**
   * Page rendered callback, which is called when a page is rendered (called multiple times)
   *
   * @param e custom event
   */
  pageRendered(e: any) {
    console.log('(page-rendered)', e);
    // Select page container
    let spans = e.source.textLayer.textDivs;
    let higlightedSegments = filterHighlightsForAPage(
      Array.from(HL),
      e.pageNumber
    );

    higlightedSegments.map((segment) => {
      let span = spans[segment.chunkIndex];
      let textToBeWrapped = addWrappingTag(span.innerHTML, segment.str);
      span.innerHTML = textToBeWrapped;
    });

    // Helpers
    function filterHighlightsForAPage(highlightSegments, pageNo) {
      let segmentsForAPage = [];
      for (let i = 0; i < highlightSegments.length; i++) {
        let sen = highlightSegments[i];
        for (let j = 0; j < sen.segment.length; j++) {
          let seg = sen.segment[j];
          if (seg.pageNo === pageNo) segmentsForAPage.push(seg);
        }
      }
      return segmentsForAPage;
    }

    function addWrappingTag(spanStr, segStr) {
      let startingIndex = spanStr.indexOf(segStr);
      let wrappedText = ``;

      for (let i = 0; i < startingIndex; i++) wrappedText += spanStr[i];
      wrappedText += `<a class="highlighed-text">`;
      for (let i = startingIndex; i < startingIndex + segStr.length; i++)
        wrappedText += spanStr[i];
      wrappedText += `</a>`;
      for (let i = startingIndex + segStr.length; i < spanStr.length; i++)
        wrappedText += spanStr[i];

      return wrappedText;
    }
  }

  replaceTextChunk(spanElement: any) {
    if (spanElement.children.length > 0) return;
    let finalHTML = spanElement.innerHTML
      .split(' ')
      .map((w) => {
        if (w.includes('95')) {
          return `<a href="https://www.google.com" style="color:red !important; background-color: red !important" class="clickable-text">${w}</a>`;
        }
        return w;
      })
      .join(' ');
    spanElement.innerHTML = finalHTML;
  }

  zoomIn() {
    this.zoom += 0.1;
  }

  zoomOut() {
    this.zoom -= 0.1;
    if (this.zoom < 0.25) {
      this.zoom = 0.25;
    }
  }

  rotate(angle: number) {
    this.rotation += angle;
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

  /**
   * Page initialized callback.
   *
   * @param {CustomEvent} e
   */
  pageInitialized(e: CustomEvent) {
    // console.log('(page-initialized)', e);
  }

  /**
   * Page change callback, which is called when a page is changed (called multiple times)
   *
   * @param e number
   */
  pageChange(e: number) {
    // console.log('(page-change)', e);
  }
}
