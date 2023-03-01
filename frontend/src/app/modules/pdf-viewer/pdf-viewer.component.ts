import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FeaturesService } from '../shared/features.service';
import { PdfShareService } from '../shared/pdf-share.service';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

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

    if (this.pdfPath == null) {
      this.pdfPath = './assets/SCORE_intro.pdf';
    }

    this.summarizerOn = false;
    this.graphOn = false;

    this.featureService.getSummarizerStatus().subscribe((value) => {
      this.summarizerOn = value;
      //console.log('Summary is on ' + this.summarizerOn);
    });

    this.featureService.getKnowledgeGraphStatus().subscribe((value) => {
      this.graphOn = value;
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
    //console.log('(page-rendered)', e);
    // Select page container
    // let spans = e.source.textLayer.textDivs;
    // this.highlightSummary(e.pageNumber, spans, Array.from(HL));
    // this.highlightReference(e.pageChange, spans, Array.from(refs));
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
  // highlightReference(pageNo, spans, AllRefs) {
  //   spans.map((span) => {
  //     let spanText = span.innerHTML;

  //     // referencing figure
  //     let restOfTheString = '';
  //     let startingIndex = spanText.toLowerCase().indexOf('fig');
  //     let finalIndex = -1;

  //     if (startingIndex > -1) {
  //       for (let i = startingIndex; i < spanText.length; i++)
  //         restOfTheString += spanText[i];
  //       let remainingWords = restOfTheString.split(/[ .]/);
  //       if (
  //         !remainingWords[0].toLocaleLowerCase().localeCompare('fig') ||
  //         !remainingWords[0].toLocaleLowerCase().localeCompare('figure')
  //       ) {
  //         for (let i = startingIndex; i < spanText.length; i++) {
  //           if (
  //             spanText.charCodeAt(i) >= '0'.charCodeAt(0) &&
  //             spanText.charCodeAt(i) <= '9'.charCodeAt(0)
  //           ) {
  //             finalIndex = i;
  //             break;
  //           }
  //         }

  //         span.innerHTML = this.placeWrappingTagForRefrence(
  //           span.innerHTML,
  //           startingIndex,
  //           finalIndex
  //         );
  //       }
  //     }

  //     startingIndex = spanText.toLocaleLowerCase().indexOf('table');
  //     if (startingIndex > -1) {
  //       restOfTheString = '';
  //       for (let i = startingIndex; i < spanText.length; i++)
  //         restOfTheString += spanText[i];
  //       let remainingWords = restOfTheString.split(/[ .]/);
  //       if (
  //         !remainingWords[0].toLocaleLowerCase().localeCompare('tab') ||
  //         !remainingWords[0].toLocaleLowerCase().localeCompare('table')
  //       ) {
  //         for (let i = startingIndex; i < spanText.length; i++) {
  //           if (
  //             spanText.charCodeAt(i) >= '0'.charCodeAt(0) &&
  //             spanText.charCodeAt(i) <= '9'.charCodeAt(0)
  //           ) {
  //             finalIndex = i;
  //             break;
  //           }
  //         }

  //         span.innerHTML = this.placeWrappingTagForRefrence(
  //           span.innerHTML,
  //           startingIndex,
  //           finalIndex
  //         );
  //        // console.log(startingIndex, restOfTheString, finalIndex);
  //       }
  //     }
  //   });

  //   this.addEventHandler();
  // }

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

  // placeWrappingTagForRefrence(spanStr, startingIndex, finalIndex) {
  //   let finalStr = '';
  //   for (let i = 0; i < startingIndex; i++) finalStr += spanStr[i];
  //   finalStr += `<a href="" #manualRefererencingNeeded class="reference-text" style="backgournd-color: yellow !important;">`;
  //   for (let i = startingIndex; i <= finalIndex; i++) finalStr += spanStr[i];
  //   finalStr += `</a>`;
  //   for (let i = finalIndex + 1; i < spanStr.length; i++)
  //     finalStr += spanStr[i];
  //   return finalStr;
  // }

  // addEventHandler() {
  //   let AllRefs = Array.from(refs);
  //   let refTextAnchors = document.querySelectorAll('.reference-text');
  //   refTextAnchors.forEach((anchor) => {
  //     anchor.addEventListener('mouseenter', (event: any) => {
  //       event.preventDefault();
  //       let text = event.target.innerText;
  //       let splittedStr = text.split(' ');

  //       let type, id;
  //       if (splittedStr[0].toLocaleLowerCase().includes('fig')) type = 'figure';
  //       else if (splittedStr[0].toLocaleLowerCase().includes('tab'))
  //         type = 'table';

  //       let refDatas = AllRefs.filter((ref) => ref.str.includes(type));
  //       let data: any = {};
  //       let key = splittedStr[1];

  //       for (let r = 0; r < refDatas.length; r++) {
  //         if (refDatas[r].str.includes(key)) {
  //           data = refDatas[r];
  //           break;
  //         }
  //       }

  //       this.reference = { ...data, requireManualAnnotaion: true };
  //       //this.showPreview = true;
  //       this.previewPageNum = data.page;
  //       this.leftCSSstr = data.x + 'px';
  //       this.topCSSstr = data.y + 'px';
  //       this.heightStr = data.height + 'px';
  //       this.widthStr = data.width + 'px';

  //       //console.log({ ...data, requireManualAnnotaion: true });
  //       //console.log(event);
  //     });
  //   });
  // }

  addWrappingTagForSummaryHighlight(
    spanStr,
    segStr,
    selectionClass,
    highlightColor
  ) {
    let startingIndex = spanStr.indexOf(segStr);
    let wrappedText = ``;
    for (let i = 0; i < startingIndex; i++) wrappedText += spanStr[i];
    wrappedText += `<a class="highlighed-text ${selectionClass}" #manual style="background-color: ${highlightColor} !important; color: ${highlightColor} !important;">`;
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
  }

  openFileDialog() {
    document.getElementById('upload').click();
  }

  downloadPdf() {
    console.log(this.pdfPath);
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
    console.log('event received: ', e);
    this.showPreview = e.show;
    if (e.show) {
      this.previewPageNum = e.page;
      this.reference = e.refDestination;
      this.reference.requireManualAnnotation = false;
      let entireScreenHeight = this.convertVHToPx(90);
      let entireScreenWidth = this.convertREMToPx(50);
      //console.log(e);
      this.topCSS = -1 * (entireScreenHeight - e.clienY);
      //console.log(e.clienY);
      this.leftCSS = e.clientX;
      this.topCSSstr = this.topCSS + 'px';
      this.leftCSSstr = this.leftCSS + 'px';
      this.heightStr = e.height + 'px';
      this.widthStr = e.width + 'px';
    }
  }
}
