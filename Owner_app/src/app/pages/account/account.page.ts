import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {

  constructor(
    public util: UtilService,
    public api: ApiService
  ) { }

  ngOnInit() {
  }

  onEditProfile() {
    this.util.navigateToPage('/edit-profile');
  }

  getName() {
    return localStorage.getItem('name');
  }

  getCover() {
    return localStorage.getItem('cover');
  }

  getAddress() {
    return localStorage.getItem('address');
  }

  onServices() {
    this.util.navigateToPage('services');
  }

  onSlot() {
    this.util.navigateToPage('timeslots');
  }

  onOrders() {
    this.util.navigateRoot('/tabs/home');
  }

  onEarnings() {
    this.util.navigateRoot('/tabs/earnings');
  }

  onResetPassword() {
    this.util.navigateRoot('reset-password');
  }

  onLanguage() {
    this.util.navigateToPage('/languages');
  }

  onContact() {
    this.util.navigateToPage('/contact-us');
  }

  onChats() {
    this.util.navigateRoot('/tabs/chats');
  }

  logout() {
    this.util.show();
    this.api.post_private('v1/auth/logout', {}).then((data: any) => {
      console.log(data);
      this.util.hide();
      localStorage.clear();
      this.util.navigateRoot('/login');
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }

  openPage(title: any, id: any) {
    console.log(title, id);
    const param: NavigationExtras = {
      queryParams: {
        "name": this.util.translate(title),
        "id": id
      }
    };
    this.util.navigateToPage('app-pages', param);
  }

}
