import { PdfShareService } from './../../shared/pdf-share.service';
import { Component, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-pdf-preview',
  templateUrl: './pdf-preview.component.html',
  styleUrls: ['./pdf-preview.component.css']
})
export class PdfPreviewComponent implements OnChanges{
  @Input('pdfPath') pdfPath: any = '../../../../assets/sample.pdf';
  @Input('show') show: Boolean;
  @Input('page') page: number;
  @Input('offsetX') offsetX: number;
  @Input('offsetY') offsetY: number;
  @Input('height') height: number;
  @Input('width') width: number;
  @Input('reference') reference: any;
  heightSTR = '300px';
  widthSTR = '300px';
  styleSTR = "width: 300px; height: 300px; top: -30px;position: relative; left: 30px;"
 // constructor(private pdfShareService: PdfShareService){}
  ngOnInit() {
    this.reference = [
      {num: 1, gen: 0},{name: 'XYZ'},53.798, 713.793, null
    ]
  }
  ngOnChanges() {
   // this.pdfPath = '../../../../assets/sample.pdf';
   console.log(this.page)
   console.log(this.reference)
  }
}
