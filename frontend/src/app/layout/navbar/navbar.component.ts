import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from 'src/app/token-storage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{

  constructor(private tokenStorage: TokenStorageService, private route: Router){}

  public userName: string;

  ngOnInit(){
    this.userName = this.tokenStorage.getUser().username;
    console.log(this.userName);
  }

  logout(){
    this.tokenStorage.signOut();
    this.route.navigate(['login']);

  }
}
