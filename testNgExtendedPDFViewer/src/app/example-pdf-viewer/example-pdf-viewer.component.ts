import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NgxExtendedPdfViewerService, pdfDefaultOptions, TextLayerRenderedEvent } from 'ngx-extended-pdf-viewer';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { PDFLinkService } from 'pdfjs-dist/lib/web/pdf_link_service';

let PDFDocumentProxy:any;

@Component({
  selector: 'app-example-pdf-viewer',
  templateUrl: './example-pdf-viewer.component.html',
  styleUrls: ['./example-pdf-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExamplePdfViewerComponent {
  /** In most cases, you don't need the NgxExtendedPdfViewerService. It allows you
   *  to use the "find" api, to extract text and images from a PDF file,
   *  to print programmatically, and to show or hide layers by a method call.
  */

  private _showTextLayer = false;
  pdfLinkService: PDFLinkService;
  pdfDocument: PDFDocumentProxy;

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

  public highlightWords(event: TextLayerRenderedEvent): void {
    if (this.showTextLayer) {
      event.source.textDivs.forEach((span) => {
        span.classList.add('box');
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
    this.pdfLinkService = new PDFLinkService();
    this.pdfDocument = null;
    
  }

    loadPDFDocument() {
      const pdfUrl = 'path/to/your/pdf/document.pdf';
      this.pdfDocument = null; // Reset the pdfDocument if it has been set previously
    
      PDFDocumentProxy.load(pdfUrl).then(pdf => {
        this.pdfDocument = pdf;
        this.pdfLinkService.setDocument(pdf);
        // Other code to render the PDF document in your viewer
      });
    }

    navigateToLink(link: any) {
      const dest = link.dest; // Get the destination object from the link
      const pageNumber = dest[0] + 1; // Get the page number from the destination object
    
      // Navigate to the specified page and zoom level
      this.pdfLinkService.navigateTo(`#page=${pageNumber}&zoom=100`);
    }
    
}
