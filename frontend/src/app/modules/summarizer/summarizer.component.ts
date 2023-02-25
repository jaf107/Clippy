import { Component, OnInit } from '@angular/core';
import * as extractiveSummary from '../../../assets/preprocessed.json';


interface chunk {
  "title": String,
  "noOfSentences": Number,
  "text": String,
  "summaryText": String
}

@Component({
  selector: 'app-summarizer',
  templateUrl: './summarizer.component.html',
  styleUrls: ['./summarizer.component.css']
})
export class SummarizerComponent implements OnInit{

  public summary : any = (extractiveSummary as any).default;

  ngOnInit(){
    // this.summary = extractiveSummary;
    console.log(extractiveSummary);
    
    // for(let i=0; i<this.summary.length; i++){
    //   console.log(this.summary);
    // }
  }
}
