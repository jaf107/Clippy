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
  @Input('offsetX') offsetX: string; 
  @Input('offsetY') offsetY: string;
  @Input('height') height: string;
  @Input('width') width: string;
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
