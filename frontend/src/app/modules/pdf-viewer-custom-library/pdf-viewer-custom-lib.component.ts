import {
  Component,
  Input,
  Output,
  ElementRef,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
  OnDestroy,
  ViewChild,
  AfterViewChecked,
  NgZone,
  Renderer2,
} from '@angular/core';
import { from, fromEvent, Subject } from 'rxjs';
import { debounceTime, filter, takeUntil } from 'rxjs/operators';
import * as PDFJS from 'pdfjs-dist/build/pdf';
import * as PDFJSViewer from 'pdfjs-dist/web/pdf_viewer';

//import * as PopOverPDFJSViewer from 'pdfjs-dist/web/pdf_viewer';
import { getManualReferences } from './manual-referencing';

import { createEventBus } from '../utils/event-bus-utils';
import { assign, isSSR } from '../utils/helpers';

import type {
  PDFSource,
  PDFPageProxy,
  PDFProgressData,
  PDFDocumentProxy,
  PDFDocumentLoadingTask,
  PDFViewerOptions,
} from './typings';
import { PDFSinglePageViewer } from 'pdfjs-dist/web/pdf_viewer';

if (!isSSR()) {
  assign(PDFJS, 'verbosity', PDFJS.VerbosityLevel.INFOS);
}

export enum RenderTextMode {
  DISABLED,
  ENABLED,
  ENHANCED,
}

interface IReference {
  TargetXCoordinate: number;
  TargetYCoordinate: number;
  rectangleOfOccurance: number[];
  destintationString: string;
  destinationPageNumber: string;
}

@Component({
  selector: 'pdf-viewer',
  template: `
    <div #pdfViewerContainer class="ng2-pdf-viewer-container">
      <div
        #pdfViewer
        class="pdfViewer"
        (mouseover)="handlePopOver($event)"
      ></div>
    </div>
  `,
  styleUrls: ['./pdf-viewer-custom-lib.component.scss'],
})
export class PdfViewerComponent
  implements OnChanges, OnInit, OnDestroy, AfterViewChecked
{
  static CSS_UNITS = 96.0 / 72.0;
  static BORDER_WIDTH = 9;

  @ViewChild('pdfViewerContainer') pdfViewerContainer;
  @ViewChild('popOverContainer') pdfPopOverContainer: ElementRef;
  @ViewChild('pdfViewer') pdfViewerElement: ElementRef;
  public eventBus: PDFJSViewer.EventBus;
  public popOverEventBus: PDFJSViewer.EventBus;
  public pdfLinkService: PDFJSViewer.PDFLinkService;
  public popOverPdfLinkService: PDFJSViewer.PDFLinkService;
  public pdfFindController: PDFJSViewer.PDFFindController;
  public pdfViewer: PDFJSViewer.PDFViewer | PDFSinglePageViewer;
  public popOverPDFViewer: PDFJSViewer.PDFViewer | PDFSinglePageViewer;
  private isVisible = false;
  public popOverPDFFindControler: PDFJSViewer.PDFFindController;

  private _cMapsUrl =
    typeof PDFJS !== 'undefined'
      ? `https://unpkg.com/pdfjs-dist@${(PDFJS as any).version}/cmaps/`
      : null;
  private _imageResourcesPath =
    typeof PDFJS !== 'undefined'
      ? `https://unpkg.com/pdfjs-dist@${(PDFJS as any).version}/web/images/`
      : null;
  private _renderText = true;
  private _renderTextMode: RenderTextMode = RenderTextMode.ENABLED;
  private _stickToPage = false;
  private _originalSize = true;
  private _pdf: PDFDocumentProxy;
  private _pdfClone: PDFDocumentProxy;
  private _page = 1;
  private _zoom = 1;
  private _zoomScale: 'page-height' | 'page-fit' | 'page-width' = 'page-width';
  private _rotation = 0;
  private _showAll = true;
  private _canAutoResize = true;
  private _fitToPage = false;
  private _externalLinkTarget = 'blank';
  private _showBorders = false;
  private lastLoaded: string | Uint8Array | PDFSource;
  private _latestScrolledPage: number;

  private resizeTimeout: number | null = null;
  private pageScrollTimeout: number | null = null;
  private isInitialized = false;
  private loadingTask: PDFDocumentLoadingTask;
  private destroy$ = new Subject<void>();
  private destroyPopOver$ = new Subject<void>();
  refs: any[] = [];
  flag1 = false;
  flag2 = false;

  @Output('after-load-complete') afterLoadComplete =
    new EventEmitter<PDFDocumentProxy>();
  @Output('page-rendered') pageRendered = new EventEmitter<CustomEvent>();
  @Output('pages-initialized') pageInitialized =
    new EventEmitter<CustomEvent>();
  @Output('text-layer-rendered') textLayerRendered =
    new EventEmitter<CustomEvent>();
  @Output('error') onError = new EventEmitter<any>();
  @Output('on-progress') onProgress = new EventEmitter<PDFProgressData>();
  @Output() pageChange: EventEmitter<number> = new EventEmitter<number>(true);
  @Input() src: string | Uint8Array | PDFSource;
  @Output('references') references: EventEmitter<any> = new EventEmitter<any>();
  @Output('hover') hover: EventEmitter<any> = new EventEmitter<any>();
  @Output('metadata') metadata: EventEmitter<any> = new EventEmitter<any>();

  @Input('c-maps-url')
  set cMapsUrl(cMapsUrl: string) {
    this._cMapsUrl = cMapsUrl;
  }

  @Input('page')
  set page(_page) {
    _page = parseInt(_page, 10) || 1;
    const originalPage = _page;

    if (this._pdf) {
      _page = this.getValidPageNumber(_page);
    }

    this._page = _page;
    if (originalPage !== _page) {
      this.pageChange.emit(_page);
    }
  }

  @Input('render-text')
  set renderText(renderText: boolean) {
    this._renderText = renderText;
  }

  @Input('render-text-mode')
  set renderTextMode(renderTextMode: RenderTextMode) {
    this._renderTextMode = renderTextMode;
  }

  @Input('original-size')
  set originalSize(originalSize: boolean) {
    this._originalSize = originalSize;
  }

  @Input('startingPosition') startingPosition: any;

  @Input('show-all')
  set showAll(value: boolean) {
    this._showAll = value;
  }

  @Input('stick-to-page')
  set stickToPage(value: boolean) {
    this._stickToPage = value;
  }

  @Input('zoom')
  set zoom(value: number) {
    if (value <= 0) {
      return;
    }

    this._zoom = value;
  }

  get zoom() {
    return this._zoom;
  }

  @Input('zoom-scale')
  set zoomScale(value: 'page-height' | 'page-fit' | 'page-width') {
    this._zoomScale = value;
  }

  get zoomScale() {
    return this._zoomScale;
  }

  @Input('rotation')
  set rotation(value: number) {
    if (!(typeof value === 'number' && value % 90 === 0)) {
      return;
    }

    this._rotation = value;
  }

  @Input('external-link-target')
  set externalLinkTarget(value: string) {
    this._externalLinkTarget = value;
  }

  @Input('autoresize')
  set autoresize(value: boolean) {
    this._canAutoResize = Boolean(value);
  }

  @Input('fit-to-page')
  set fitToPage(value: boolean) {
    this._fitToPage = Boolean(value);
  }

  @Input('show-borders')
  set showBorders(value: boolean) {
    this._showBorders = Boolean(value);
  }

  async getMetaData() {
    let metData: any = await this._pdf.getMetadata();
    this.metadata.emit(metData.info.Title);
  }

  async handlePopOver(event: any) {
    if (event.type != 'mouseover') {
      return;
    }
    let refParent: HTMLElement;
    if (event.target.hash != undefined) {
      this.initPopOverEventBus();
      this.initPopOverPDFService();

      const referenceID = event.target.hash.substring(1);
      refParent = event.target.parentElement;
      let refBoundingRect = refParent.getBoundingClientRect();
      const refDestination = await this._pdf.getDestination(referenceID);
      if (refDestination == null) {
        //do nothing, this condition is handled already
      } else {
        let maxHeight, maxwidth, x, y;
        const pageNum = this.pdfLinkService._cachedPageNumber(
          refDestination[0]
        );
        this._pdf.getPage(pageNum).then((pdfPage) => {
          let viewPort = pdfPage.getViewport({ scale: 1.0 });
          maxHeight =
            viewPort.height < pdfPage.view[3] * 0.5
              ? viewPort.height
              : pdfPage.view[3] * 0.5;
          maxwidth = viewPort.width;
          x = refBoundingRect.x + refBoundingRect.width / 2;
          y = refBoundingRect.y + refBoundingRect.height / 2;
          this.hover.emit({
            show: true,
            page: pageNum,
            refDestination: refDestination,
            clientX: event.clientX,
            clienY: event.clientY,
            height: maxHeight,
            width: maxwidth,
            manual: false,
          });
        });

        refParent.addEventListener('mouseleave', () => {
          this.hover.emit({
            show: false,
          });
        });
      }
    }
  }

  static getLinkTarget(type: string) {
    switch (type) {
      case 'blank':
        return (PDFJSViewer as any).LinkTarget.BLANK;
      case 'none':
        return (PDFJSViewer as any).LinkTarget.NONE;
      case 'self':
        return (PDFJSViewer as any).LinkTarget.SELF;
      case 'parent':
        return (PDFJSViewer as any).LinkTarget.PARENT;
      case 'top':
        return (PDFJSViewer as any).LinkTarget.TOP;
    }

    return null;
  }

  constructor(
    private element: ElementRef<HTMLElement>,
    private ngZone: NgZone,
    private renderer: Renderer2
  ) {
    if (isSSR()) {
      return;
    }

    let pdfWorkerSrc: string;

    if (
      window.hasOwnProperty('pdfWorkerSrc') &&
      typeof (window as any).pdfWorkerSrc === 'string' &&
      (window as any).pdfWorkerSrc
    ) {
      pdfWorkerSrc = (window as any).pdfWorkerSrc;
    } else {
      pdfWorkerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${
        (PDFJS as any).version
      }/legacy/build/pdf.worker.min.js`;
    }

    assign(PDFJS.GlobalWorkerOptions, 'workerSrc', pdfWorkerSrc);
  }

  ngAfterViewChecked(): void {
    if (this.isInitialized) {
      return;
    }

    const offset = this.pdfViewerContainer.nativeElement.offsetParent;
    if (this.isVisible === true && offset == null) {
      this.isVisible = false;
      return;
    }

    if (this.isVisible === false && offset != null) {
      this.isVisible = true;

      setTimeout(() => {
        this.initialize();
        this.ngOnChanges({ src: this.src } as any);
      });
    }
  }

  ngOnInit() {
    this.initialize();
    this.setupResizeListener();
  }

  ngOnDestroy() {
    this.clear();
    this.destroy$.next();
    this.loadingTask = null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (isSSR() || !this.isVisible) {
      return;
    }
    if ('src' in changes) {
      this.loadPDF();
    } else if (this._pdf) {
      if ('renderText' in changes) {
        this.pdfViewer.textLayerMode = this._renderText
          ? this._renderTextMode
          : RenderTextMode.DISABLED;
        this.resetPdfDocument();
      } else if ('showAll' in changes) {
        this.setupViewer();
        this.resetPdfDocument();
      }
      if ('page' in changes) {
        const { page } = changes;
        if (page.currentValue === this._latestScrolledPage) {
          return;
        }

        // New form of page changing: The viewer will now jump to the specified page when it is changed.
        // This behavior is introduced by using the PDFSinglePageViewer
        this.pdfViewer.scrollPageIntoView({ pageNumber: this._page });
      }

      this.update();
    }
  }

  /*
  returns the references from the pdf as an event. 
  return type event: {data: references[]}
  */
  public getReferences() {
    let references = [];
    this.destinations = [];
    this.annotations = [];
    for (let i = 1; i <= this._pdf.numPages; i++) {
      this._pdf.getPage(i).then((page) => {
        page.getAnnotations().then(this.getRefPositions.bind(this));
      });
    }
    setTimeout(() => {
      if (this.references.length == 0) {
      }
      this.references.emit({ data: this.destinations });
    }, 1000);
  }
  destinations = [];
  annotations = [];
  async getRefPositions(annotations) {
    var linkAnnotations = annotations.filter(function (annotation) {
      return annotation.subtype === 'Link';
    });
    this.annotations.push(linkAnnotations);
    for (let i = 0; i < linkAnnotations.length; i++) {
      if (linkAnnotations[i].dest != undefined) {
        var x = await this._pdf.getDestination(linkAnnotations[i].dest);
        this.destinations.push(x);
      }
    }
  }

  public updateSize() {
    from(
      this._pdf.getPage(
        this.pdfViewer.currentPageNumber
      ) as unknown as Promise<PDFPageProxy>
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (page: PDFPageProxy) => {
          const rotation = this._rotation || page.rotate;
          const viewportWidth =
            (page as any).getViewport({
              scale: this._zoom,
              rotation,
            }).width * PdfViewerComponent.CSS_UNITS;
          let scale = this._zoom;
          let stickToPage = true;

          // Scale the document when it shouldn't be in original size or doesn't fit into the viewport
          if (
            !this._originalSize ||
            (this._fitToPage &&
              viewportWidth > this.pdfViewerContainer.nativeElement.clientWidth)
          ) {
            const viewPort = (page as any).getViewport({ scale: 1, rotation });
            scale = this.getScale(viewPort.width, viewPort.height);
            stickToPage = !this._stickToPage;
          }

          this.pdfViewer._setScale(scale, stickToPage);
        },
      });
  }

  public clear() {
    if (this.loadingTask && !this.loadingTask.destroyed) {
      this.loadingTask.destroy();
    }

    if (this._pdf) {
      this._latestScrolledPage = 0;
      this._pdf.destroy();
      this._pdf = null;
      this.pdfViewer.setDocument(null);
      this.pdfLinkService.setDocument(null, null);
      this.pdfFindController.setDocument(null);
    }
  }

  private getPDFLinkServiceConfig() {
    const linkTarget = PdfViewerComponent.getLinkTarget(
      this._externalLinkTarget
    );

    if (linkTarget) {
      return { externalLinkTarget: linkTarget };
    }

    return {};
  }

  placeWrappingTagForRefrence(spanStr, startingIndex, finalIndex) {
    let finalStr = '';
    for (let i = 0; i < startingIndex; i++) finalStr += spanStr[i];
    finalStr += `<a href="" #manualRefererencingNeeded class="reference-text" style="backgournd-color: yellow !important;">`;
    for (let i = startingIndex; i <= finalIndex; i++) finalStr += spanStr[i];
    finalStr += `</a>`;
    for (let i = finalIndex + 1; i < spanStr.length; i++)
      finalStr += spanStr[i];
    return finalStr;
  }

  addEventHandler() {
    let AllRefs = Array.from(this.refs);
    let refTextAnchors = document.querySelectorAll('.reference-text');
    refTextAnchors.forEach((anchor) => {
      anchor.addEventListener('mouseenter', (event: any) => {
        event.preventDefault();
        let text = event.target.innerText;
        let splittedStr = text.split(' ');

        let type, id;
        if (splittedStr[0].toLocaleLowerCase().includes('fig')) type = 'figure';
        else if (splittedStr[0].toLocaleLowerCase().includes('tab'))
          type = 'table';

        let refDatas = AllRefs.filter((ref) => ref.str.includes(type));
        let data: any = {};
        let key = splittedStr[1];

        for (let r = 0; r < refDatas.length; r++) {
          if (refDatas[r].str.includes(key)) {
            data = refDatas[r];
            break;
          }
        }

        if (data.str == undefined) {
          return;
        }
        var ref = [];
        this._pdf.getPage(data.page).then((page: PDFPageProxy) => {
          const pageInfo = page._pageInfo;
          const obj = { num: pageInfo.ref.num, gen: pageInfo.ref.gen };
          ref.push(obj);
          ref.push({ name: 'XYZ' });
          ref.push(data.x);
          ref.push(data.y);
          ref.push(null);
          this.hover.emit({
            show: true,
            page: data.page,
            refDestination: ref,
            clientX: event.clientX,
            clienY: event.clientY,
            height: data.height,
            width: data.width,
            manual: true,
          });
        });
      });

      anchor.addEventListener('click', (event: any) => {
        event.preventDefault();
      });

      anchor.addEventListener('mouseleave', (event: any) => {
        this.hover.emit({
          show: false,
        });
      });
    });
  }

  highlightReference(pageNo, spans, AllRefs) {
    spans.map((span) => {
      let spanText = span.innerHTML;

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
          let foundNumber = false;
          for (let i = startingIndex; i < spanText.length; i++) {
            if (
              spanText.charCodeAt(i) >= '0'.charCodeAt(0) &&
              spanText.charCodeAt(i) <= '9'.charCodeAt(0)
            ) {
              foundNumber = true;
              // finalIndex = i;
              // break;
            }

            if (
              foundNumber &&
              !(
                spanText.charCodeAt(i) >= '0'.charCodeAt(0) &&
                spanText.charCodeAt(i) <= '9'.charCodeAt(0)
              )
            ) {
              finalIndex = i - 1;
              break;
            }
          }

          if (span.children.length === 0)
            span.innerHTML = this.placeWrappingTagForRefrence(
              span.innerHTML,
              startingIndex,
              finalIndex
            );
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
          for (let i = startingIndex; i < spanText.length; i++) {
            if (
              spanText.charCodeAt(i) >= '0'.charCodeAt(0) &&
              spanText.charCodeAt(i) <= '9'.charCodeAt(0)
            ) {
              finalIndex = i;
              break;
            }
          }

          if (span.children.length === 0)
            span.innerHTML = this.placeWrappingTagForRefrence(
              span.innerHTML,
              startingIndex,
              finalIndex
            );
        }
      }
    });

    this.addEventHandler();
  }

  private initEventBus() {
    this.eventBus = createEventBus(PDFJSViewer, this.destroy$);

    // fromEvent<CustomEvent>(this.eventBus, 'pagerendered')
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((event: any) => {
    //     setTimeout(async () => {
    //       if (this.destinations.length == 0) {
    //         this.refs = await getManualReferences(this.src);
    //         let spans = event.source.textLayer.textDivs;
    //         this.highlightReference(
    //           event.pageChange,
    //           spans,
    //           Array.from(this.refs)
    //         );
    //         this.pageRendered.emit(event);
    //       }
    //     }, 1100);
    //   });
    fromEvent<CustomEvent>(this.eventBus, 'pagerendered')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: any) => {
        setTimeout(async () => {
          if (this.destinations.length == 0) {
            this.refs = await getManualReferences(this.src);
            let spans = event.source.textLayer.textDivs;
            this.highlightReference(
              event.pageChange,
              spans,
              Array.from(this.refs)
            );
          }
          this.pageRendered.emit(event);
        }, 1100);
      });
    fromEvent(this.pdfViewerElement.nativeElement, 'mouseover')
      .pipe(debounceTime(1000))
      .subscribe((event: MouseEvent) => {
        this.handlePopOver(event);
      });

    fromEvent<CustomEvent>(this.eventBus, 'pagesinit')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.getMetaData();
        this.pageInitialized.emit(event);
      });

    fromEvent(this.eventBus, 'pagechanging')
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ pageNumber }) => {
        if (this.pageScrollTimeout) {
          clearTimeout(this.pageScrollTimeout);
        }

        this.pageScrollTimeout = window.setTimeout(() => {
          this._latestScrolledPage = pageNumber;
          this.pageChange.emit(pageNumber);
        }, 100);
      });

    fromEvent<CustomEvent>(this.eventBus, 'textlayerrendered')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        this.textLayerRendered.emit(event);
      });
  }

  private initPopOverEventBus() {
    this.popOverEventBus = createEventBus(PDFJSViewer, this.destroyPopOver$);

    fromEvent<CustomEvent>(this.eventBus, 'pagerendered')
      .pipe(takeUntil(this.destroyPopOver$))
      .subscribe((event) => {
        setTimeout(() => {
          this.pageRendered.emit(event);
        }, 500);
      });

    fromEvent<CustomEvent>(this.eventBus, 'pagesinit')
      .pipe(takeUntil(this.destroyPopOver$))
      .subscribe((event) => {
        // this.pageInitialized.emit(event);
      });

    fromEvent(this.eventBus, 'pagechanging')
      .pipe(takeUntil(this.destroyPopOver$))
      .subscribe(({ pageNumber }) => {
        if (this.pageScrollTimeout) {
          clearTimeout(this.pageScrollTimeout);
        }

        this.pageScrollTimeout = window.setTimeout(() => {
          this._latestScrolledPage = pageNumber;
          //  this.pageChange.emit(pageNumber);
        }, 100);
      });

    fromEvent<CustomEvent>(this.eventBus, 'textlayerrendered')
      .pipe(takeUntil(this.destroyPopOver$))
      .subscribe((event) => {
        // this.textLayerRendered.emit(event);
      });
  }

  private initPDFServices() {
    this.pdfLinkService = new PDFJSViewer.PDFLinkService({
      eventBus: this.eventBus,
      ...this.getPDFLinkServiceConfig(),
    });
    this.pdfFindController = new PDFJSViewer.PDFFindController({
      eventBus: this.eventBus,
      linkService: this.pdfLinkService,
    });
  }

  private initPopOverPDFService() {
    this.popOverPdfLinkService = new PDFJSViewer.PDFLinkService({
      eventBus: this.popOverEventBus,
      ...this.getPDFLinkServiceConfig(),
    });
    this.popOverPDFFindControler = new PDFJSViewer.PDFFindController({
      eventBus: this.popOverEventBus,
      linkService: this.popOverPdfLinkService,
    });
  }
  private getPDFOptions(): PDFViewerOptions {
    return {
      eventBus: this.eventBus,
      container: this.element.nativeElement.querySelector('div'),
      removePageBorders: !this._showBorders,
      linkService: this.pdfLinkService,
      textLayerMode: this._renderText
        ? this._renderTextMode
        : RenderTextMode.DISABLED,
      findController: this.pdfFindController,
      renderer: 'canvas',
      l10n: undefined,
      imageResourcesPath: this._imageResourcesPath,
    };
  }

  private getPopOverPDFOptions(): PDFViewerOptions {
    return {
      eventBus: this.popOverEventBus,
      container: this.pdfPopOverContainer.nativeElement,
      removePageBorders: true,
      linkService: this.popOverPdfLinkService,
      textLayerMode: this._renderText
        ? this._renderTextMode
        : RenderTextMode.DISABLED,
      renderer: 'canvas',
      l10n: undefined,
      imageResourcesPath: this._imageResourcesPath,
    };
  }

  private setupViewer() {
    assign(PDFJS, 'disableTextLayer', !this._renderText);

    this.initPDFServices();

    if (this._showAll) {
      this.pdfViewer = new PDFJSViewer.PDFViewer(this.getPDFOptions());
    } else {
      this.pdfViewer = new PDFJSViewer.PDFSinglePageViewer(
        this.getPDFOptions()
      );
    }
    this.pdfLinkService.setViewer(this.pdfViewer);

    this.pdfViewer._currentPageNumber = this._page;
  }

  private getValidPageNumber(page: number): number {
    if (page < 1) {
      return 1;
    }

    if (page > this._pdf.numPages) {
      return this._pdf.numPages;
    }

    return page;
  }

  private getDocumentParams() {
    const srcType = typeof this.src;

    if (!this._cMapsUrl) {
      return this.src;
    }

    const params: any = {
      cMapUrl: this._cMapsUrl,
      cMapPacked: true,
      enableXfa: true,
    };

    if (srcType === 'string') {
      params.url = this.src;
    } else if (srcType === 'object') {
      if ((this.src as any).byteLength !== undefined) {
        params.data = this.src;
      } else {
        Object.assign(params, this.src);
      }
    }

    return params;
  }

  private loadPDF() {
    if (!this.src) {
      return;
    }

    if (this.lastLoaded === this.src) {
      this.update();
      this.getReferences();
      return;
    }

    this.clear();

    this.setupViewer();

    this.loadingTask = PDFJS.getDocument(this.getDocumentParams());

    this.loadingTask.onProgress = (progressData: PDFProgressData) => {
      this.onProgress.emit(progressData);
    };

    const src = this.src;

    from(this.loadingTask.promise as Promise<PDFDocumentProxy>)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdf) => {
          this._pdf = pdf;
          this.getReferences();
          this._pdfClone = Object.assign(
            Object.create(Object.getPrototypeOf(this._pdf)),
            this._pdf
          );
          this.lastLoaded = src;

          this.afterLoadComplete.emit(pdf);
          this.resetPdfDocument();

          this.update();
        },
        error: (error) => {
          this.lastLoaded = null;
          this.onError.emit(error);
        },
      });
  }

  private update() {
    this.page = this._page;

    this.render();
  }

  private render() {
    this._page = this.getValidPageNumber(this._page);

    if (
      this._rotation !== 0 ||
      this.pdfViewer.pagesRotation !== this._rotation
    ) {
      setTimeout(() => {
        this.pdfViewer.pagesRotation = this._rotation;
      });
    }

    if (this._stickToPage) {
      setTimeout(() => {
        this.pdfViewer.currentPageNumber = this._page;
      });
    }

    this.updateSize();
    //preview required
    if (this.startingPosition) {
      //document has annotaitons, no manual annotation creation required
      if (!this.startingPosition.requireManualAnnotaion) {
        this.pdfLinkService.goToDestination(this.startingPosition);
      } else {
        let pageNum = this.startingPosition.page;
        let ref = [];
        if (pageNum != undefined) {
          this._pdf.getPage(pageNum).then((page: PDFPageProxy) => {
            const pageInfo = page._pageInfo;
            const obj = { num: pageInfo.ref.num, gen: pageInfo.ref.gen };
            ref.push(obj);
            ref.push({ name: 'XYZ' });
            ref.push(this.startingPosition.x);
            ref.push(this.startingPosition.y);
            this.pdfLinkService.goToDestination(ref);

            this.hover.emit({
              show: true,
              page: pageNum,
              refDestination: ref,
              clientX: this.startingPosition.x,
              clienY: this.startingPosition.y,
              height: this.startingPosition.height,
              width: this.startingPosition.width,
              manual: false,
            });
          });
        }
      }
    }
    this.getReferences();
  }

  private getScale(viewportWidth: number, viewportHeight: number) {
    const borderSize = this._showBorders
      ? 2 * PdfViewerComponent.BORDER_WIDTH
      : 0;
    const pdfContainerWidth =
      this.pdfViewerContainer.nativeElement.clientWidth - borderSize;
    const pdfContainerHeight =
      this.pdfViewerContainer.nativeElement.clientHeight - borderSize;

    if (
      pdfContainerHeight === 0 ||
      viewportHeight === 0 ||
      pdfContainerWidth === 0 ||
      viewportWidth === 0
    ) {
      return 1;
    }

    let ratio = 1;
    switch (this._zoomScale) {
      case 'page-fit':
        ratio = Math.min(
          pdfContainerHeight / viewportHeight,
          pdfContainerWidth / viewportWidth
        );
        break;
      case 'page-height':
        ratio = pdfContainerHeight / viewportHeight;
        break;
      case 'page-width':
      default:
        ratio = pdfContainerWidth / viewportWidth;
        break;
    }

    return (this._zoom * ratio) / PdfViewerComponent.CSS_UNITS;
  }

  private resetPdfDocument() {
    this.pdfLinkService.setDocument(this._pdf, null);
    this.pdfFindController.setDocument(this._pdf);
    this.pdfViewer.setDocument(this._pdf);
  }

  private initialize(): void {
    if (isSSR() || !this.isVisible) {
      return;
    }

    this.isInitialized = true;
    this.initEventBus();
    this.setupViewer();
  }

  private setupResizeListener(): void {
    if (isSSR()) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      fromEvent(window, 'resize')
        .pipe(
          debounceTime(100),
          filter(() => this._canAutoResize && !!this._pdf),
          takeUntil(this.destroy$)
        )
        .subscribe(() => {
          this.updateSize();
        });
    });
  }
}
