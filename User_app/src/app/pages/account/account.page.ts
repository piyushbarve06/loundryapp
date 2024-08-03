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

  onLogin() {
    this.util.navigateToPage('login');
  }

  onLanguage() {
    this.util.navigateToPage('/languages');
  }

  onContact() {
    this.util.navigateToPage('/contact-us');
  }

  onOrders() {
    this.util.navigateRoot('/tabs/history');
  }

  onResetPassword() {
    this.util.navigateRoot('reset-password');
  }

  editProfile() {
    this.util.navigateToPage('edit-profile');
  }

  onChats() {
    this.util.navigateToPage('/chats');
  }

  onWallet() {
    this.util.navigateToPage('/wallet');
  }

  onReferral() {
    this.util.navigateToPage('/referral');
  }

  logout() {
    this.util.show();
    this.api.post_private('v1/auth/logout', {}).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.util.userInfo = null;
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      this.util.navigateRoot('/tabs');
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
