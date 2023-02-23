import { Component } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, TextLayerRenderedEvent } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent {
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
      span.innerHTML = span.innerText.replace("\n", '');
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

  public highlightWords(event: TextLayerRenderedEvent): void {
    event.source.textDivs.forEach((span) => {
      this.alreadyRendered.push(span);
    });

    if (this.showTextLayer) {
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

  constructor(private pdfService: NgxExtendedPdfViewerService) {
    /* More likely than not you don't need to tweak the pdfDefaultOptions.
       They are a collecton of less frequently used options.
       To illustrate how they're used, here are two example settings: */
    pdfDefaultOptions.doubleTapZoomFactor = '150%'; // The default value is '200%'
    pdfDefaultOptions.maxCanvasPixels = 4096 * 4096 * 5; // The default value is 4096 * 4096 pixels,
    // but most devices support much higher resolutions.
    // Increasing this setting allows your users to use higher zoom factors,
    // trading image quality for performance.

    
    }
}
