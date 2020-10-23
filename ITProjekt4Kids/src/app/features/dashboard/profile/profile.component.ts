import { Component, OnInit } from '@angular/core';
import { auth } from 'firebase';
import { Observable } from 'rxjs/internal/Observable';
import { tap } from 'rxjs/internal/operators/tap';
import { User } from 'src/app/interfaces/users.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {


  private user$: Observable<User>;
  
  constructor(public authService: AuthService) {}
  

  ngOnInit(): void {}
   

}
