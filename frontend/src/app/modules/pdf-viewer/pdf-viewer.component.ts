import { Component, AfterViewInit, OnInit } from '@angular/core';
import { PdfShareService } from '../shared/pdf-share.service';
import * as HL from '../../../assets/highlight.json'
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
    console.log(HL)
    this.pdfPath = this.pdfShareService.getFile();
    console.log(this.pdfPath);

    // this.pdfPath = "./assets/SCORE_intro.pdf";

    this.summarizerOn = false;

    this.pdfShareService.getSummarizerStatus().subscribe((value) => {
      this.summarizerOn = value;
      console.log('Summary is on ' + this.summarizerOn);
    });
  }

  ngAfterViewInit() {
    console.log('View is initialized ' + this.pdfPath);
  }

  constructor(public pdfShareService: PdfShareService) {}

  loaded() {
    console.log('Loaded ' + this.pdfPath);
  }

  failed() {
    console.log('Failed ' + this.pdfPath);
  }

  starts() {
    console.log('Started ' + this.pdfPath);
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
    let [page1] = pages.filter((p: any) => p.dataset.pageNumber === '1');

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

    if (textChunkSpans.length > 0) {
      let [targetChunk] = textChunkSpans.filter((chunk) =>
        chunk.innerHTML.includes('Figure 1. ')
      );

      this.replaceTextChunk(targetChunk);
    }

    let anchor = document.querySelector('.clickable-text');
    let modal = document.querySelector('.modal');

    if (modal)
      modal.addEventListener('click', (event) => {
        event.preventDefault();
        modal.classList.add('hidden');
      });

    if (anchor) {
      anchor.addEventListener('mouseenter', (event) => {
        event.preventDefault();
        modal.classList.remove('hidden');
      });
      anchor.addEventListener('mouseleave', (event) => {
        event.preventDefault();
        modal.classList.add('hidden');
      });
    }
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
}
