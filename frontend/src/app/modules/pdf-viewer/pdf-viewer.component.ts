import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FeaturesService } from '../shared/features.service';
import { PdfShareService } from '../shared/pdf-share.service';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

import { TokenStorageService } from 'src/app/token-storage.service';
import { Router } from '@angular/router';

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
  public exSummary: boolean = false;
  public absSummary: boolean = false;
  public highlightedText: any = [];
  public pageRenderedEvents: any = [];

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
    private http: HttpClient,
    public tokenStorage: TokenStorageService,
    private router: Router
  ) {}
  previewPageNum: number;
  reference: any;
  showPreview: boolean;
  topCSS: number;
  leftCSSstr: string;
  topCSSstr: string;
  heightStr: string;
  widthStr: string;

  leftCSS: number;
  @ViewChild('viewerRef') viewerRef: any;

  ngOnInit() {
    this.pdfPath = this.pdfShareService.getFile();

    if (this.pdfPath == null) {
      if (this.tokenStorage.getPaper() == null) {
        this.pdfPath = './assets/SCORE_intro.pdf';
      } else {
        this.pdfPath = JSON.parse(this.tokenStorage.getPaper());
      }
    }

    this.summarizerOn = false;
    this.graphOn = false;

    this.featureService.getAbsSummarizerStatus().subscribe((value) => {
      this.absSummary = value;
      if (this.absSummary) {
        this.summarizerOn = false;
        this.summarizerOn = true;
      } else if (this.absSummary == false && this.exSummary == false) {
        this.summarizerOn = false;
      }
    });

    this.featureService.getExSummarizerStatus().subscribe((value) => {
      console.log('extractive status changed');
      this.exSummary = value;
      if (this.exSummary) {
        this.summarizerOn = false;
        this.summarizerOn = true;
      } else if (this.absSummary == false && this.exSummary == false) {
        this.summarizerOn = false;
      }
    });

    this.featureService.getKnowledgeGraphStatus().subscribe((value) => {
      this.graphOn = value;
    });

    this.featureService.getHighlightedText().subscribe((value) => {
      this.highlightedText = value;
      // this.getTextSpans();
      this.pageRenderedEvents.forEach((e) => {
        let pageNum = e.pageNumber;
        let spans = e.source.textLayer.textDivs;

        if (this.highlightedText?.length > 0)
          this.highlightSummary(pageNum, spans, this.highlightedText);
      });
    });
  }

  getReferences(e: any) {
    //console.log(e.data.length);
  }
  ngAfterViewInit() {
    //console.log('View is initialized ' + this.pdfPath);
  }

  failed() {
    // console.log('Failed ' + this.pdfPath);
  }

  loaded() {
    console.log('Loaded ' + this.pdfPath);
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
    console.log('page rendered:', e);
    this.pageRenderedEvents.push(e);

    let pageNum = e.pageNumber;
    let spans = e.source.textLayer.textDivs;

    if (this.highlightedText?.length > 0)
      this.highlightSummary(pageNum, spans, this.highlightedText);
  }

  highlightSummary(pageNo, spans, AllSegments) {
    console.log('inside highlighted', pageNo, spans);
    let higlightedSegments = this.filterDataSegmentsForAPage(
      AllSegments,
      pageNo
    );

    higlightedSegments.map((segment) => {
      let span = spans[segment.chunkIndex];
      let textToBeWrapped = this.addWrappingTagForSummaryHighlight(
        span.innerHTML,
        segment.str,
        'summary-highlight',
        'yellow'
      );

      if (span.children.length === 0) span.innerHTML = textToBeWrapped;
    });
  }

  // Helpers for highlighting

  filterDataSegmentsForAPage(dataSegments, pageNo) {
    let segmentsForAPage = [];
    for (let i = 0; i < dataSegments.length; i++) {
      let sen = dataSegments[i];
      for (let j = 0; j < sen.segment.length; j++) {
        let seg = sen.segment[j];
        if (seg.pageNo === pageNo) segmentsForAPage.push(seg);
      }
    }
    return segmentsForAPage;
  }

  addWrappingTagForSummaryHighlight(
    spanStr,
    segStr,
    selectionClass,
    highlightColor
  ) {
    let startingIndex = spanStr.indexOf(segStr);
    let wrappedText = ``;
    for (let i = 0; i < startingIndex; i++) wrappedText += spanStr[i];
    wrappedText += `<a class="highlighed-text ${selectionClass}" style="background-color: ${highlightColor} !important; color: ${highlightColor} !important;">`;
    for (let i = startingIndex; i < startingIndex + segStr.length; i++)
      wrappedText += spanStr[i];
    wrappedText += `</a>`;
    for (let i = startingIndex + segStr.length; i < spanStr.length; i++)
      wrappedText += spanStr[i];
    return wrappedText;
  }

  convertVHToPx(value: number): number {
    return (window.innerHeight * value) / 100;
  }

  convertREMToPx(value: number): number {
    const html = document.querySelector('html');
    const fontSize = window
      .getComputedStyle(html)
      .getPropertyValue('font-size');
    return parseFloat(fontSize) * value;
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
    console.log(pdfData);
  }

  openFileDialog() {
    document.getElementById('upload').click();
  }

  receiveMetaData(e: string) {
    this.pdfShareService.setTitle(e);
    this.sendFile();
  }

  downloadPdf() {
    const blob = new Blob([this.pdfPath], { type: 'application/octet-stream' });
    saveAs(blob, 'test.pdf');
  }

  uploadPdf(e) {
    this.file = e.target.files[0];
    this.visitedFiles.push({ name: this.file.name, lastVisited: new Date() });
    console.log(this.visitedFiles);

    if (this.file.type != 'application/pdf') {
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

  sendFile() {
    if (!this.pdfShareService.getSearched()) {
      const formData: FormData = new FormData();
      formData.append('paper', this.pdfShareService.getRawFile());
      formData.append('title', this.pdfShareService.getTitle());
      console.log('formdata: ', formData.get('title'), formData.get('paper'));
      this.pdfShareService.sendFiletoServer(formData).subscribe(
        (data) => {
          console.log(data);
          this.pdfShareService.setPaperId(data.paper_id);
        },
        (err) => {
          console.log('File sending failed');
        }
      );
    }
  }

  errorsmsg() {
    this.toastr.error(
      'The uploaded file is not a pdf',
      'Unsupported File Type'
    );
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

  createPreview(e: any) {
    this.showPreview = e.show;
    if (e.show) {
      this.previewPageNum = e.page;
      this.reference = e.refDestination;
      this.reference.requireManualAnnotation = false;
      let entireScreenHeight = this.convertVHToPx(90);
      let entireScreenWidth = this.convertREMToPx(50);
      this.topCSS = -1 * (entireScreenHeight - e.clienY) - 100;

      if (this.topCSS + e.height > 0) {
        this.topCSS -= e.height;
      }
      this.leftCSS = e.clientX;
      if (this.leftCSS + e.width > entireScreenWidth) {
        this.leftCSS -= e.width / 2;
      }
      this.topCSSstr = this.topCSS + 'px';
      this.leftCSSstr = this.leftCSS + 'px';
      this.heightStr = e.height + 'px';
      this.widthStr = e.width + 'px';
    }
  }

  goToHome() {
    this.router.navigate(['home']);
  }
}
