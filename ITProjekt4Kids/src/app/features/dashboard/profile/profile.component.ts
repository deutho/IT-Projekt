import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/users.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {


  public user: User;
  
  constructor(public authService: AuthService) { 
    this.authService.user$.subscribe((user) => {
      this.user = user;
    })
  }
  

  ngOnInit(): void {
  }

}
