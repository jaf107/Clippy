import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { PdfShareService } from '../shared/pdf-share.service';
import * as HL from '../../../assets/highlight.json';
import * as refs from '../../../assets/reference.json';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css'],
})
export class PdfViewerComponent implements AfterViewInit, OnInit {
  pdfPath: any;
  pdfSrc = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  public summarizerOn: boolean;
  previewPageNum: number;
  reference: any;
  showPreview: boolean;
  topCSS: number;
  leftCSSstr: string;
  topCSSstr: string;
  heightStr: string;
  widthStr: string;

  leftCSS: number;
  @ViewChild('viewerRef') viewerRef: HTMLElement;

  ngOnInit() {
    this.pdfPath = this.pdfShareService.getFile();
    //console.log(this.pdfPath);

    this.pdfPath = '../../../assets/sample4.pdf';

    this.summarizerOn = false;

    this.pdfShareService.getSummarizerStatus().subscribe((value) => {
      this.summarizerOn = value;
      //console.log('Summary is on ' + this.summarizerOn);
    });
  }

  getReferences(e: any) {
    //console.log(e.data.length);
  }
  ngAfterViewInit() {
    //console.log('View is initialized ' + this.pdfPath);
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
    //console.log('(page-rendered)', e);
    // Select page container
    let spans = e.source.textLayer.textDivs;
    // this.highlightSummary(e.pageNumber, spans, Array.from(HL));
    this.highlightReference(e.pageChange, spans, Array.from(refs));
  }

  highlightSummary(pgaeNo, spans, AllSegments) {
    let higlightedSegments = this.filterDataSegmentsForAPage(
      AllSegments,
      pgaeNo
    );

    higlightedSegments.map((segment) => {
      let span = spans[segment.chunkIndex];
      let textToBeWrapped = this.addWrappingTagForSummaryHighlight(
        span.innerHTML,
        segment.str,
        'summary-highlight',
        'aqua'
      );
      span.innerHTML = textToBeWrapped;
    });
  }

  /**
   * mathc patterns: Fig, fig, figure, Figure, Table, table, tab
   * @param pageNo current page no
   * @param spans text spans for current page
   * @param AllRefs All reference objects
   */
  highlightReference(pageNo, spans, AllRefs) {
    spans.map((span) => {
      let spanText = span.innerHTML;
      // console.log(spanText);

      // referencing figure
      let restOfTheString = '';
      let startingIndex = spanText.toLowerCase().indexOf('fig');
      let finalIndex = -1;

      if (startingIndex > -1) {
        for (let i = startingIndex; i < spanText.length; i++)
          restOfTheString += spanText[i];
        let remainingWords = restOfTheString.split(/[ .]/);
        if (
          !remainingWords[0].toLocaleLowerCase().localeCompare('fig') ||
          !remainingWords[0].toLocaleLowerCase().localeCompare('figure')
        ) {
          console.log(remainingWords);
          for (let k = 1; k < remainingWords.length; k++) {
            if (remainingWords[k].length > 0) {
              let wordWithNo = remainingWords[k];
              if (
                wordWithNo.charCodeAt(0) >= '0'.charCodeAt(0) &&
                wordWithNo.charCodeAt(0) <= '9'.charCodeAt(0)
              ) {
                console.log('id:', remainingWords[k], 'index:', k);
                break;
              }
            }
          }
          return;
        }
      }

      startingIndex = spanText.toLocaleLowerCase().indexOf('table');
      if (startingIndex > -1) {
        restOfTheString = '';
        for (let i = startingIndex; i < spanText.length; i++)
          restOfTheString += spanText[i];
        let remainingWords = restOfTheString.split(/[ .]/);
        if (
          !remainingWords[0].toLocaleLowerCase().localeCompare('tab') ||
          !remainingWords[0].toLocaleLowerCase().localeCompare('table')
        ) {
          console.log(remainingWords);
          for (let k = 1; k < remainingWords.length; k++) {
            if (remainingWords[k].length > 0) {
              let wordWithNo = remainingWords[k];
              if (
                wordWithNo.charCodeAt(0) >= '0'.charCodeAt(0) &&
                wordWithNo.charCodeAt(0) <= '9'.charCodeAt(0)
              ) {
                console.log('id:', remainingWords[k], 'index:', k);
                break;
              }
            }
          }
          return;
        }
      }
    });
  }

  // Helpers for sumary highlighting

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
    console.log('event received: ', e);
    this.showPreview = e.show;
    if (e.show) {
      this.previewPageNum = e.page;
      this.reference = e.refDestination;
      let entireScreenHeight = this.convertVHToPx(90);
      let entireScreenWidth = this.convertREMToPx(50);
      console.log(entireScreenHeight, entireScreenWidth);
      this.topCSS = -1 * (entireScreenHeight - e.clienY);
      console.log(e.clienY);
      this.leftCSS = e.clientX;
      this.topCSSstr = this.topCSS + 'px';
      this.leftCSSstr = this.leftCSS + 'px';
    }
  }
}
