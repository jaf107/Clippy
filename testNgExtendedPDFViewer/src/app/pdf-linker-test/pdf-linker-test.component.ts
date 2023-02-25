import { PDFLinkService } from 'pdfjs-dist/lib/web/pdf_link_service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PDFDocumentProxy, PageViewport, RenderTask } from 'pdfjs-dist';
import * as PDFJS from 'pdfjs-dist/legacy/build/pdf';
import { pdfjsWorker } from 'pdfjs-dist/build/pdf.worker.entry'
import { TextLayerRenderedEvent } from 'ngx-extended-pdf-viewer';

@Component({
  selector: 'app-pdf-linker-test',
  template: `
    <div #pdfViewer>
      <canvas #pdfCanvas></canvas>
    </div>
  `,
})
export class PdfLinkerTestComponent implements OnInit{
  @ViewChild('pdfViewer', { static: true })
  private pdfViewerRef: ElementRef<HTMLDivElement>;

  @ViewChild('pdfCanvas', { static: true })
  private pdfCanvasRef: ElementRef<HTMLCanvasElement>;

  private pdfDocument: PDFDocumentProxy;
  private pdfViewer: HTMLDivElement;
  private pdfCanvas: HTMLCanvasElement;
  private pdfLinkService: PDFLinkService;
  private pdfRenderTask:any;
  private  linkAnnotation:any[];
  ngOnInit() {
    this.pdfViewer = this.pdfViewerRef.nativeElement;
    this.pdfCanvas = this.pdfCanvasRef.nativeElement;
    PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    this.loadPDFDocument();

    

  }


  loadPDFDocument() {
    const pdfUrl = '../../assets/pdfs/icse22_toxicity.pdf';
    console.log('called')
    this.pdfDocument = null; // Reset the pdfDocument if it has been set previously
    
    PDFJS.getDocument(pdfUrl).promise.then((pdf: PDFDocumentProxy) => {
      this.pdfDocument = pdf;
      this.pdfLinkService = new PDFLinkService();
      this.pdfLinkService.setDocument(pdf, null);
      this.renderPDF();
    }).catch((err)=> console.log('err: ', err));
    ;
  }

  renderPDF() {
    // Render the first page of the PDF
    const pageNumber = 1;
    
    this.pdfDocument.getPage(pageNumber).then((page) => {
      console.log('1',this)
      page.getAnnotations().then(this.siam.bind(this));
      const viewport = page.getViewport({ scale: 3 });
      this.pdfCanvas.width = viewport.width;
      this.pdfCanvas.height = viewport.height;

      const renderContext = {
        canvasContext: this.pdfCanvas.getContext('2d'),
        viewport: viewport,
      };
      this.pdfRenderTask = page.render(renderContext).promise.then(
        ()=>console.log('rendered')
      );
    });
  }

  
    async siam (annotations) {
      console.log('2',this)
      var linkAnnotation = annotations.filter(function (annotation) {
        return annotation.subtype === "Link";
      });
      console.log(linkAnnotation);
      var x = await this.pdfDocument.getDestination(linkAnnotation[26].dest);
      console.log(x)
      console.log(await this.pdfDocument.getPageIndex(x[0]))
      console.log(await this.pdfDocument.getPageLabels())
      this.pdfLinkService.goToDestination(await this.pdfDocument.getDestination(linkAnnotation[26].dest))
    }
  
  getAnnotation()
  {
    const pageNumber = 1;
    this.pdfDocument.getPage(pageNumber + 1).then(function (page) {
      page.getAnnotations().then(function (annotations) {
        // console.log("annotations:", annotations);
        var linkAnnotation = annotations.filter(function (annotation) {
          return annotation.subtype === "Link";
        });
        console.log(annotations);
       
      });
    })
  }
}
