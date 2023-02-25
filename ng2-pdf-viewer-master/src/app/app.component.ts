/**
 * Created by vadimdez on 21/06/16.
 */
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import {
  PDFProgressData,
  PDFDocumentProxy,
  PDFSource,
} from './pdf-viewer/pdf-viewer.module';

import { PdfViewerComponent } from './pdf-viewer/pdf-viewer.component';

@Component({
  moduleId: module.id,
  selector: 'pdf-viewer-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  pdfSrc: string | PDFSource | ArrayBuffer = './assets/pdf-test.pdf';

  error: any;
  page = 1;
  rotation = 0;
  zoom = 1.0;
  zoomScale = 'page-width';
  originalSize = false;
  pdf: any;
  renderText = true;
  progressData: PDFProgressData;
  isLoaded = false;
  stickToPage = false;
  showAll = true;
  autoresize = true;
  fitToPage = false;
  outline: any[];
  isOutlineShown = false;
  pdfQuery = '';
  mobile = false;

  @ViewChild(PdfViewerComponent)
  private pdfComponent: PdfViewerComponent;

  ngOnInit() {
    if (window.screen.width <= 768) {
      this.mobile = true;
    }
  }

  // Load pdf
  loadPdf() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/assets/pdf-test.pdf', true);
    xhr.responseType = 'blob';

    xhr.onload = (e: any) => {
      console.log(xhr);
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
        this.pdfSrc = URL.createObjectURL(blob);
      }
    };

    xhr.send();
  }

  /**
   * Set custom path to pdf worker
   */
  setCustomWorkerPath() {
    (window as any).pdfWorkerSrc = '/lib/pdfjs-dist/build/pdf.worker.js';
  }

  incrementPage(amount: number) {
    this.page += amount;
  }

  incrementZoom(amount: number) {
    this.zoom += amount;
  }

  rotate(angle: number) {
    this.rotation += angle;
  }

  /**
   * Render PDF preview on selecting file
   */
  onFileSelected() {
    const $pdf: any = document.querySelector('#file');

    if (typeof FileReader !== 'undefined') {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.pdfSrc = e.target.result;
      };

      reader.readAsArrayBuffer($pdf.files[0]);
    }
  }

  /**
   * Get pdf information after it's loaded
   * @param pdf pdf document proxy
   */
  afterLoadComplete(pdf: PDFDocumentProxy) {
    this.pdf = pdf;

    this.loadOutline();
  }

  /**
   * Get outline
   */
  loadOutline() {
    this.pdf.getOutline().then((outline: any[]) => {
      this.outline = outline;
    });
  }

  /**
   * Handle error callback
   *
   * @param error error message
   */
  onError(error: any) {
    this.error = error; // set error

    if (error.name === 'PasswordException') {
      const password = prompt(
        'This document is password protected. Enter the password:'
      );

      if (password) {
        this.error = null;
        this.setPassword(password);
      }
    }
  }

  setPassword(password: string) {
    let newSrc;

    if (this.pdfSrc instanceof ArrayBuffer) {
      newSrc = { data: this.pdfSrc };
    } else if (typeof this.pdfSrc === 'string') {
      newSrc = { url: this.pdfSrc };
    } else {
      newSrc = { ...this.pdfSrc };
    }

    newSrc.password = password;

    this.pdfSrc = newSrc;
  }

  /**
   * Pdf loading progress callback
   * @param progressData pdf progress data
   */
  onProgress(progressData: PDFProgressData) {
    console.log(progressData);
    this.progressData = progressData;

    this.isLoaded = progressData.loaded >= progressData.total;
    this.error = null; // clear error
  }

  getInt(value: number): number {
    return Math.round(value);
  }

  /**
   * Navigate to destination
   * @param destination pdf navigate to
   */
  navigateTo(destination: any) {
    this.pdfComponent.pdfLinkService.goToDestination(destination);
  }

  /**
   * Scroll view
   */
  scrollToPage() {
    this.pdfComponent.pdfViewer.scrollPageIntoView({
      pageNumber: 3,
    });
  }

  /**
   * Page rendered callback, which is called when a page is rendered (called multiple times)
   *
   * @param e custom event
   */
  pageRendered(e: CustomEvent) {
    console.log('(page-rendered)', e);
    // Select page container
    let pages = Array.from(document.querySelectorAll('.page'));
    let [page1] = pages.filter(
      (p: HTMLElement) => p.dataset.pageNumber === '1'
    );

    let textLayer: Element;
    for (let i = 0; i < page1.children.length; i++) {
      let child: Element = page1.children[i];
      if (child.classList.contains('textLayer')) {
        textLayer = child;
        break;
      }
    }

    let textChunkSpans = Array.from(textLayer.children).filter(
      (t) => t.nodeName === 'SPAN'
    );

    // textChunkSpans.map((span, index, arr) => {
    //   console.log(span.innerHTML, index);
    // });

    let sens = [];
    for (let i = 0; i < textChunkSpans.length; i++) {
      sens.push(
        textChunkSpans[i].innerHTML
          .split(/[.?!]/g)
          .filter((item) => item.length > 0)
      );
    }
    console.log(sens);

    for (let i = 0; i < sens.length; i++) {
      let start = i,
        end = 0;
      let lenth = sens[i].length;
      // for (let j=0; j<lenth ;j++) {

      // }
      if (lenth === 2) {
        let leftSen = sens[i][0],
          rihtSens = sens[i][1];
        let sentence = rihtSens;
        start = i;
        for (let j = i + 1; j < sens.length; j++) {
          sentence += `${sens[j][0]}`;
          if (sens[j].length > 1) {
            end = j;
            break;
          }
        }
        console.log(sentence, `chnnk start ${start} end ${end}`);
      }
    }

    // if (textChunkSpans.length > 0) {
    //   let [targetChunk] = textChunkSpans.filter((chunk) =>
    //     chunk.innerHTML.includes('Figure 1. ')
    //   );

    //   this.replaceTextChunk(targetChunk);
    // }

    // let anchor = document.querySelector('.clickable-text');
    // let modal = document.querySelector('.modal');

    // if (modal)
    //   modal.addEventListener('click', (event) => {
    //     event.preventDefault();
    //     modal.classList.add('hidden');
    //   });

    // if (anchor) {
    //   anchor.addEventListener('mouseenter', (event) => {
    //     event.preventDefault();
    //     modal.classList.remove('hidden');
    //   });
    //   anchor.addEventListener('mouseleave', (event) => {
    //     event.preventDefault();
    //     modal.classList.add('hidden');
    //   });
    // }
  }

  replaceTextChunk(spanElement: Element) {
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
    console.log('(page-initialized)', e);
  }

  /**
   * Page change callback, which is called when a page is changed (called multiple times)
   *
   * @param e number
   */
  pageChange(e: number) {
    console.log('(page-change)', e);
  }

  searchQueryChanged(newQuery: string) {
    const type = newQuery !== this.pdfQuery ? '' : 'again';
    this.pdfQuery = newQuery;

    this.pdfComponent.eventBus.dispatch('find', {
      type,
      query: this.pdfQuery,
      highlightAll: true,
      caseSensitive: false,
      phraseSearch: true,
      // findPrevious: undefined,
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.mobile = event.target.innerWidth <= 768;
  }
}
