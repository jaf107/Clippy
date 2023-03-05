import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from 'src/app/token-storage.service';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit{

  constructor(private tokenStorage: TokenStorageService, private route: Router, public userService : UserService){}

  public userName: string;

  ngOnInit(){
    this.userName = this.tokenStorage.getUser().username;
    if(this.userName == null){
      this.userName = 'Guest';
    }
    
    this.userService.setUsername(this.userName);
  }

  logout(){
    this.tokenStorage.signOut();
    this.route.navigate(['login']);

  }
}
