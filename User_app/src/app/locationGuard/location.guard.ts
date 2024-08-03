import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LocationGuard implements CanActivate {

  constructor(private router: Router) { }

  // canActivate(route: ActivatedRouteSnapshot): any {
  //   const location = localStorage.getItem('location');
  //   console.log('location', localStorage.getItem('location'));
  //   if (location && location != null && location !== 'null') {
  //     return true;
  //   }
  //   this.router.navigate(['/login']);
  //   return false;
  // }

  canActivate(route: ActivatedRouteSnapshot): any {
    const location = localStorage.getItem('uid');
    // console.log('location', localStorage.getItem('location'));
    if (location && location != null && location !== 'null') {
      this.router.navigate(['/home']);
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
