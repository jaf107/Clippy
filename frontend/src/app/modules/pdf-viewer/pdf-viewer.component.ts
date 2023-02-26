import { Component, AfterViewInit, OnInit } from '@angular/core';
import {
  NgxExtendedPdfViewerService,
  pdfDefaultOptions,
  TextLayerRenderedEvent,
} from 'ngx-extended-pdf-viewer';
import { PdfShareService } from '../shared/pdf-share.service';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css'],
})
export class PdfViewerComponent implements AfterViewInit, OnInit {
  pdfPath: any;

  public summarizerOn: boolean;

  ngOnInit() {
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

  constructor(
    private pdfService: NgxExtendedPdfViewerService,
    public pdfShareService: PdfShareService
  ) {
    /* More likely than not you don't need to tweak the pdfDefaultOptions.
       They are a collecton of less frequently used options.
       To illustrate how they're used, here are two example settings: */
    pdfDefaultOptions.doubleTapZoomFactor = '150%'; // The default value is '200%'
    pdfDefaultOptions.maxCanvasPixels = 4096 * 4096 * 5; // The default value is 4096 * 4096 pixels,
    // but most devices support much higher resolutions.
    // Increasing this setting allows your users to use higher zoom factors,
    // trading image quality for performance.
  }

  loaded() {
    console.log('Loaded ' + this.pdfPath);
  }

  failed() {
    console.log('Failed ' + this.pdfPath);
  }

  starts() {
    console.log('Started ' + this.pdfPath);
  }

  pageRendered() {
    console.log('page renderd');
  }

  private alreadyRendered: Array<HTMLSpanElement> = [];

  private _showBoxes = false;
  private _showTextLayer = false;
  public _markLongWords = false;

  public get markLongWords(): boolean {
    return this._markLongWords;
  }

  public set markLongWords(mark: boolean) {
    this._markLongWords = mark;
    this.alreadyRendered.forEach((span) => this.doMarkLongWordsInSpan(span));
  }

  public doMarkLongWordsInSpan(span: HTMLSpanElement): void {
    if (!this._markLongWords) {
      span.innerHTML = span.innerText.replace('\n', '');
    } else {
      const withMarks = span.innerText
        .split(' ')
        .map((t) => this.markOneLongWord(t))
        .join(' ');
      span.innerHTML = withMarks;
    }
  }

  private markOneLongWord(word: string): string {
    if (word.length > 6) {
      return `<div class="long-word">${word}</div>`;
    }
    return word;
  }

  public get showTextLayer(): boolean {
    return this._showTextLayer;
  }

  public set showTextLayer(layer: boolean) {
    this._showTextLayer = layer;
    const divs = document.getElementsByClassName('textLayer');
    for (let i = 0; i < divs.length; i++) {
      const div = divs.item(i);
      if (layer) {
        div.classList.add('show-text-layer');
      } else {
        div.classList.remove('show-text-layer');
      }
    }
  }

  public get showBoxes(): boolean {
    return this._showBoxes;
  }

  public set showBoxes(show: boolean) {
    if (show) {
      this.alreadyRendered.forEach((span) => {
        span.classList.add('box');
      });
    } else {
      this.alreadyRendered.forEach((span) => {
        span.classList.remove('box');
      });
    }
  }

  textLayerRendered(event: any) {
    console.log(event);
    let textSpans = event.source.textLayer.textDivs;
    // console.log(textSpans);
    textSpans.map((item) => {
      // console.log(
      //   item.offsetHeight,
      //   item.offsetTop,
      //   item.offsetLeft,
      //   item.offsetWidth
      // );
    });

    textSpans.map((span) => {
      let spanStr = span.innerText;
      // console.log(spanStr);
      if (spanStr.toLowerCase().includes('abstract')) {
        console.log('found you');
        span.innerHTML = `ab<a class="clickable-text" data-bs-toggle="popover" data-bs-trigger="hover" title="Popover title" data-bs-content="And here's some amazing content. It's very engaging. Right?">str</a>act`;

        // let anchor = document.querySelector('.clickable-text');
        // let modal = document.querySelector('.modal');
        // console.log(modal, anchor);

        // if (modal)
        //   modal.addEventListener('click', (event) => {
        //     event.preventDefault();
        //     modal.classList.add('hidden');
        //   });

        // if (anchor) {
        //   anchor.addEventListener('mouseenter', (event) => {
        //     event.preventDefault();
        //     console.log('entered');
        //     modal.classList.remove('hidden');
        //   });
        //   anchor.addEventListener('mouseleave', (event) => {
        //     event.preventDefault();
        //     console.log('exited');
        //     modal.classList.add('hidden');
        //   });
        // }
        // anchor.addEventListener('', )
      }
    });
  }

  public highlightWords(event: any): void {
    console.log(event);
    event.source.textLayer.textDivs.forEach((span) => {
      this.alreadyRendered.push(span);
    });

    if (this._showTextLayer) {
      event.source.textDivs.forEach((span) => {
        span.classList.add('box');
      });
    }

    if (this._markLongWords) {
      event.source.textDivs.forEach((span) => {
        this.doMarkLongWordsInSpan(span);
      });
    }
  }
}
