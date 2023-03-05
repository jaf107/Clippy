import { PdfShareService } from './../../shared/pdf-share.service';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css'],
})
export class PdfPreviewComponent implements OnChanges {
  @Input('pdfPath') pdfPath: any;
  @Input('show') show: Boolean;
  @Input('page') page: number;
  @Input('offsetX') offsetX: string;
  @Input('offsetY') offsetY: string;
  @Input('height') height: string;
  @Input('width') width: string;
  @Input('reference') reference: any;
  //heightSTR = '300px';
  //widthSTR = '300px';
  shadowSTR = '7px 8px 13px -3px rgba(0,0,0,0.72)';
  ngOnInit() {
  }
  ngOnChanges() {
    // this.pdfPath = '../../../../assets/sample.pdf';
    //  console.log(this.page)
    //  console.log(this.reference)
  }

  getReferences(e: any) {
  }
}
