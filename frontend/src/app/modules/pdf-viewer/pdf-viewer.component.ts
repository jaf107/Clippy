import { Component, AfterViewInit, OnInit } from '@angular/core';
import { PdfShareService } from '../shared/pdf-share.service';
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

  ngOnInit() {
    this.pdfPath = this.pdfShareService.getFile();
    console.log(this.pdfPath);

    this.pdfPath = './assets/sample4.pdf';

    this.summarizerOn = false;

    this.pdfShareService.getSummarizerStatus().subscribe((value) => {
      this.summarizerOn = value;
      console.log('Summary is on ' + this.summarizerOn);
    });
  }

  getReferences(e: any) {
    // console.log(e.data.length);
  }
  ngAfterViewInit() {
    console.log('View is initialized ' + this.pdfPath);
  }

  constructor(public pdfShareService: PdfShareService) {}

  loaded() {
    // console.log('Loaded ' + this.pdfPath);
  }

  failed() {
    // console.log('Failed ' + this.pdfPath);
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
    console.log(e.pageNumber, 'page spans: ');
    console.dir(spans);
    // console.log('page HL segs: ', higlightedSegments, e.pageNumber);

    // console.log('befor for');
    // for (const span in spans) {
    //   console.log(span);
    // }

    // Helpers
    function filterHighlightsForAPage(highlightSegments, pageNo) {
      let segmentsForAPage = [];
      for (let i = 0; i < highlightSegments.length; i++) {
        let sen = HL[i];
        for (let j = 0; j < sen.segment.length; j++) {
          let seg = sen.segment[j];
          if (seg.pageNo === pageNo) segmentsForAPage.push(seg);
        }
      }
      return segmentsForAPage;
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
