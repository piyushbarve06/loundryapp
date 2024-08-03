import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { TranslateService } from '@ngx-translate/core';
import { login } from 'src/app/interfaces/login';
import { mobile } from 'src/app/interfaces/mobile';
import { mobileLogin } from 'src/app/interfaces/mobileLogin';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { VerifyPage } from '../verify/verify.page';
import { SelectCountryPage } from '../select-country/select-country.page';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  login: login = { email: '', password: '' };
  mobileLogin: mobile = { country_code: '', mobile: '', password: '' };
  mobileOTPLogin: mobileLogin = { country_code: '', mobile: '' };
  submitted = false;
  isLogin: boolean = false;
  viewPassword: boolean = false;
  selectedLanguages: any = 'en';
  constructor(
    public util: UtilService,
    public api: ApiService,
    private chMod: ChangeDetectorRef,
    private modalController: ModalController,
    private iab: InAppBrowser,
    private translate: TranslateService,
  ) {
    this.selectedLanguages = localStorage.getItem('selectedLanguage');
    setTimeout(() => {
      console.log(this.util.settingInfo);
      this.mobileLogin.country_code = '+' + this.util.settingInfo.default_country_code;
      this.mobileOTPLogin.country_code = '+' + this.util.settingInfo.default_country_code;
    }, 1000);
  }

  ngOnInit() {
  }

  onRegister() {
    this.util.navigateRoot('register');
  }

  resetPassword() {
    this.util.navigateRoot('reset-password');
  }

  onSocial() {

  }

  changeType() {
    this.viewPassword = !this.viewPassword;
  }

  updateFCMToken() {
    const param = {
      id: localStorage.getItem('uid'),
      fcm_token: localStorage.getItem('pushToken') && localStorage.getItem('pushToken') != null ? localStorage.getItem('pushToken') : 'NA'
    }
    this.api.post_private('v1/profile/update', param).then((data: any) => {
      // console.log(data);
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }

  onLogin(form: NgForm) {
    // console.log('form', form);
    this.submitted = true;
    this.chMod.detectChanges();
    if (form.valid) {
      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.login.email)) {
        this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
        return false;
      }
      console.log('login');
      this.isLogin = true;

      this.api.post_public('v1/auth/login', this.login).then((data: any) => {
        this.isLogin = false;
        // console.log(data);
        if (data && data.status && data.status == 200 && data.user && data.user.type == 'user') {
          this.util.userInfo = data.user;
          localStorage.setItem('uid', data.user.id);
          localStorage.setItem('token', data.token);
          this.util.navigateRoot('tabs');
          this.updateFCMToken();
          this.util.publishNewAddress();
        } else if (data && data.status == 401 && data.error.error) {
          this.util.errorToast(data.error.error, 'danger');
        } else if (data && data.user && data.user.type != 'user') {
          this.util.errorToast(this.util.translate('Access denied'), 'danger');
        } else {
          this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
        }
      }, error => {
        this.isLogin = false;
        console.log('Error', error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        this.isLogin = false;
        console.log('Err', error);
        this.util.apiErrorHandler(error);
      });

    }
  }

  onMobilePassword(form: NgForm) {
    console.log('form', form);
    this.submitted = true;
    this.chMod.detectChanges();
    if (form.valid) {
      console.log('login');
      this.isLogin = true;

      this.api.post_public('v1/auth/loginWithPhonePassword', this.mobileLogin).then((data: any) => {
        this.isLogin = false;
        console.log(data);
        if (data && data.status && data.status == 200 && data.user && data.user.type == 'user') {
          this.util.userInfo = data.user;
          localStorage.setItem('uid', data.user.id);
          localStorage.setItem('token', data.token);
          this.util.navigateRoot('home');
          this.updateFCMToken();
          this.util.publishNewAddress();
        } else if (data && data.status == 401 && data.error.error) {
          this.util.errorToast(data.error.error, 'danger');
        } else if (data && data.user && data.user.type != 'user') {
          this.util.errorToast(this.util.translate('Access denied'), 'danger');
        } else {
          this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
        }
      }, error => {
        this.isLogin = false;
        console.log('Error', error);
        this.util.apiErrorHandler(error);
      }).catch(error => {
        this.isLogin = false;
        console.log('Err', error);
        this.util.apiErrorHandler(error);
      });

    }
  }

  onMobileOTPLogin(form: NgForm) {
    console.log('form', form);
    this.submitted = true;
    this.chMod.detectChanges();
    if (form.valid) {
      console.log('login');
      this.isLogin = true;

      if (this.util.settingInfo.sms_name == '2') {
        console.log('firebase verification');
        this.api.post_public('v1/auth/verifyPhoneForFirebase', this.mobileOTPLogin).then((data: any) => {
          this.isLogin = false;
          console.log(data);
          if (data && data.status && data.status == 200 && data.data) {
            console.log('open firebase modal');
            this.openFirebaseAuthModal();
          } else if (data && data.status == 401 && data.error.error) {
            this.util.errorToast(data.error.error, 'danger');
          } else if (data && data.user && data.user.type != 'user') {
            this.util.errorToast(this.util.translate('Access denied'), 'danger');
          } else {
            this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
          }
        }, error => {
          this.isLogin = false;
          console.log('Error', error);
          this.util.apiErrorHandler(error);
        }).catch(error => {
          this.isLogin = false;
          console.log('Err', error);
          this.util.apiErrorHandler(error);
        });
      } else {
        console.log('other otp');
        this.api.post_public('v1/otp/verifyPhone', this.mobileOTPLogin).then((data: any) => {
          this.isLogin = false;
          console.log(data);
          if (data && data.status && data.status == 200 && data.data) {
            this.openVerificationModal(data.otp_id, this.mobileOTPLogin.country_code + this.mobileOTPLogin.mobile);
          } else if (data && data.status == 401 && data.error.error) {
            this.util.errorToast(data.error.error, 'danger');
          } else if (data && data.user && data.user.type != 'user') {
            this.util.errorToast(this.util.translate('Access denied'), 'danger');
          } else {
            this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
          }
        }, error => {
          this.isLogin = false;
          console.log('Error', error);
          this.util.apiErrorHandler(error);
        }).catch(error => {
          this.isLogin = false;
          console.log('Err', error);
          this.util.apiErrorHandler(error);
        });
      }
    }
  }

  async openFirebaseAuthModal() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const param = {
      mobile: this.mobileOTPLogin.country_code + this.mobileOTPLogin.mobile
    }
    const browser = this.iab.create(this.api.baseUrl + 'v1/auth/firebaseauth?' + this.api.JSON_to_URLEncoded(param), '_blank', options);
    console.log('opended');
    console.log('browser=>');
    browser.on('loadstop').subscribe(event => {
      console.log('event?;>11', event);
      const navUrl = event.url;
      if (navUrl.includes('success_verified')) {
        const urlItems = new URL(event.url);
        console.log(urlItems);
        console.log('ok login now');
        this.loginWithPhoneOTPVerified();
        browser.close();
      }
    });
    console.log('browser=> end');
  }

  async openVerificationModal(id: any, to: any) {
    const modal = await this.modalController.create({
      component: VerifyPage,
      backdropDismiss: false,
      componentProps: {
        'id': id,
        'to': to
      }
    });
    modal.onDidDismiss().then((data) => {
      console.log(data.data, data.role);
      if (data && data.data && data.role && data.role == 'ok') {
        console.log('ok login now');
        this.loginWithPhoneOTPVerified();
      }
    })
    return await modal.present();
  }

  loginWithPhoneOTPVerified() {
    this.isLogin = true;
    this.api.post_public('v1/auth/loginWithMobileOtp', this.mobileOTPLogin).then((data: any) => {
      this.isLogin = false;
      console.log(data);
      if (data && data.status && data.status == 200 && data.user && data.user.type == 'user') {
        this.util.userInfo = data.user;
        localStorage.setItem('uid', data.user.id);
        localStorage.setItem('token', data.token);
        this.util.navigateRoot('tabs');
        this.updateFCMToken();
        this.util.publishNewAddress();
      } else if (data && data.status == 401 && data.error.error) {
        this.util.errorToast(data.error.error, 'danger');
      } else if (data && data.user && data.user.type != 'user') {
        this.util.errorToast(this.util.translate('Access denied'), 'danger');
      } else {
        this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
      }
    }, error => {
      this.isLogin = false;
      console.log('Error', error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      this.isLogin = false;
      console.log('Err', error);
      this.util.apiErrorHandler(error);
    });
  }

  async onCountryCode() {
    const modal = await this.modalController.create({
      component: SelectCountryPage,
      backdropDismiss: false,
      showBackdrop: true,
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.role == 'selected') {
        console.log('ok');
        this.mobileLogin.country_code = '+' + data.data;
        this.mobileOTPLogin.country_code = '+' + data.data;
      }
    });
    return await modal.present();
  }

  translateApp() {
    console.log(this.selectedLanguages);
    const selected = this.util.allLanguages.filter(x => x.code == this.selectedLanguages);
    console.log(selected);
    if (selected && selected.length > 0) {
      localStorage.setItem('selectedLanguage', this.selectedLanguages);
      localStorage.setItem('direction', selected[0].direction);
      this.translate.use(localStorage.getItem('selectedLanguage') || 'en');
      document.documentElement.dir = selected[0].direction;
    }
  }

}
