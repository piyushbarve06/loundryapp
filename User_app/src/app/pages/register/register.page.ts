import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { register } from 'src/app/interfaces/register';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { SelectCountryPage } from '../select-country/select-country.page';
import { VerifyPage } from '../verify/verify.page';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { RedeemSuccessPage } from '../redeem-success/redeem-success.page';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  register: register = {
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    mobile: '',
    fcm_token: 'NA',
    type: '1',
    cover: 'NA',
    status: '1',
    stripe_key: '',
    country_code: '',
    check: false,
    referral: '',
    gender: '3'
  };

  submitted = false;
  isLogin: boolean = false;
  viewPassword: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    public modalController: ModalController,
    private iab: InAppBrowser,
  ) {
    const pushToken = localStorage.getItem('pushToken');
    this.register.fcm_token = pushToken ?? 'NA';

    setTimeout(() => {
      console.log(this.util.settingInfo);
      this.register.country_code = '+' + this.util.settingInfo.default_country_code;
    }, 1000);
  }

  ngOnInit() {
  }

  changeType() {
    this.viewPassword = !this.viewPassword;
  }

  onRegister(form: NgForm) {
    console.log(this.util.settingInfo.user_verify_with);
    this.submitted = true;
    if (form.valid) {
      if (this.register.check == false) {
        this.util.showToast('Please accept terms and condition of apps', 'danger', 'bottom');
        return false;
      }

      const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailfilter.test(this.register.email)) {
        this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
        return false;
      }

      console.log('ok', this.register.check, this.register);
      if (this.util.settingInfo.user_verify_with == 0) {
        console.log('email verification');
        const param = {
          'email': this.register.email,
          'subject': this.util.translate('Verification'),
          'header_text': this.util.translate('Use this code for verification'),
          'thank_you_text': this.util.translate("Don't share this otp to anybody else"),
          'mediaURL': this.api.mediaURL,
          'country_code': this.register.country_code,
          'mobile': this.register.mobile
        };
        this.isLogin = true;
        this.api.post_public('v1/sendVerificationOnMail', param).then((data: any) => {
          console.log(data);
          this.isLogin = false;
          if (data && data.status && data.status == 200 && data.data == true && data.otp_id) {
            this.openVerificationModal(data.otp_id, this.register.email);
          } else if (data && data.status && data.status == 500 && data.data == false) {
            this.util.errorToast(data.message, 'danger');
          }
        }, error => {
          console.log(error);
          this.isLogin = false;
          if (error && error.error && error.error.status == 500 && error.error.message) {
            this.util.errorToast(error.error.message, 'danger');
          } else if (error && error.error && error.error.error && error.error.status == 422) {
            for (let key in error.error.error) {
              console.log(error.error.error[key][0]);
              this.util.errorToast(error.error.error[key][0], 'danger');
            }
          } else {
            this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
          }
        }).catch(error => {
          console.log(error);
          this.isLogin = false;
          if (error && error.error && error.error.status == 500 && error.error.message) {
            this.util.errorToast(error.error.message, 'danger');
          } else if (error && error.error && error.error.error && error.error.status == 422) {
            for (let key in error.error.error) {
              console.log(error.error.error[key][0]);
              this.util.errorToast(error.error.error[key][0], 'danger');
            }
          } else {
            this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
          }
        });
      } else {
        console.log('phone verification');
        if (this.util.settingInfo.sms_name == '2') {
          console.log('firebase verification');
          this.isLogin = true;
          this.api.post_public('v1/auth/verifyPhoneForFirebaseRegistrations', { email: this.register.email, country_code: this.register.country_code, mobile: this.register.mobile }).then((data: any) => {
            console.log(data);
            this.isLogin = false;
            if (data && data.status && data.status == 200 && data.data == true) {
              // send otp from api
              this.openFirebaseAuthModal();
            } else if (data && data.status && data.status == 500 && data.data == false) {
              this.util.errorToast(data.message);
            }
          }, error => {
            console.log(error);
            this.isLogin = false;
            if (error && error.error && error.error.status == 500 && error.error.message) {
              this.util.errorToast(error.error.message);
            } else if (error && error.error && error.error.error && error.error.status == 422) {
              for (let key in error.error.error) {
                console.log(error.error.error[key][0]);
                this.util.errorToast(error.error.error[key][0]);
              }
            } else {
              this.util.errorToast(this.util.translate('Something went wrong'));
            }
          }).catch(error => {
            console.log(error);
            this.isLogin = false;
            if (error && error.error && error.error.status == 500 && error.error.message) {
              this.util.errorToast(error.error.message);
            } else if (error && error.error && error.error.error && error.error.status == 422) {
              for (let key in error.error.error) {
                console.log(error.error.error[key][0]);
                this.util.errorToast(error.error.error[key][0]);
              }
            } else {
              this.util.errorToast(this.util.translate('Something went wrong'));
            }
          });
        } else {
          console.log('other otp');
          const param = {
            'country_code': this.register.country_code,
            'mobile': this.register.mobile,
            'email': this.register.email
          };
          this.isLogin = true;
          this.api.post_public('v1/verifyPhoneSignup', param).then((data: any) => {
            // this.api.post_public('v1/auth/create_account', param).then((data: any) => {
            console.log(data);
            this.isLogin = false;
            if (data && data.status && data.status == 200 && data.data == true && data.otp_id) {
              this.openVerificationModal(data.otp_id, this.register.country_code + this.register.mobile);
            } else if (data && data.status && data.status == 500 && data.data == false) {
              this.util.errorToast(data.message, 'danger');
            }
          }, error => {
            console.log(error);
            this.isLogin = false;
            if (error && error.error && error.error.status == 500 && error.error.message) {
              this.util.errorToast(error.error.message, 'danger');
            } else if (error && error.error && error.error.error && error.error.status == 422) {
              for (let key in error.error.error) {
                console.log(error.error.error[key][0]);
                this.util.errorToast(error.error.error[key][0], 'danger');
              }
            } else {
              this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
            }
          }).catch(error => {
            console.log(error);
            this.isLogin = false;
            if (error && error.error && error.error.status == 500 && error.error.message) {
              this.util.errorToast(error.error.message, 'danger');
            } else if (error && error.error && error.error.error && error.error.status == 422) {
              for (let key in error.error.error) {
                console.log(error.error.error[key][0]);
                this.util.errorToast(error.error.error[key][0], 'danger');
              }
            } else {
              this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
            }
          });
        }
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
      mobile: this.register.country_code + this.register.mobile
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
        console.log('ok create account');
        this.createAccount();
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
        console.log('ok create account now');
        this.createAccount();
      }
    })
    return await modal.present();
  }

  createAccount() {
    this.isLogin = true;

    // no account found create it
    this.api.post_public('v1/auth/create_account', this.register).then((data: any) => {
      this.isLogin = false;
      console.log(data);

      if (data && data.status == 200) {

        this.util.userInfo = data.user;
        localStorage.setItem('uid', data.user.id);
        localStorage.setItem('token', data.token);
        if (this.register.referral != '' && this.register.referral) {
          this.redeemCode();
        }
        this.updateFCMToken();
        this.util.publishNewAddress();
        this.util.navigateRoot('tabs');
      } else if (data && data.error && data.error.msg) {
        this.util.errorToast(data.error.msg);
      } else if (data && data.error && data.error.message == 'Validation Error.') {
        for (let key in data.error[0]) {
          console.log(data.error[0][key][0]);
          this.util.errorToast(data.error[0][key][0]);
        }
      } else {
        this.util.errorToast(this.util.translate('Something went wrong'));
      }
    }, error => {
      console.log(error);
      this.isLogin = false;
      if (error && error.error && error.error.status == 500 && error.error.message) {
        this.util.errorToast(error.error.message);
      } else if (error && error.error && error.error.error && error.error.status == 422) {
        for (let key in error.error.error) {
          console.log(error.error.error[key][0]);
          this.util.errorToast(error.error.error[key][0]);
        }
      } else {
        this.util.errorToast(this.util.translate('Something went wrong'));
      }
    }).catch(error => {
      console.log(error);
      this.isLogin = false;
      if (error && error.error && error.error.status == 500 && error.error.message) {
        this.util.errorToast(error.error.message);
      } else if (error && error.error && error.error.error && error.error.status == 422) {
        for (let key in error.error.error) {
          console.log(error.error.error[key][0]);
          this.util.errorToast(error.error.error[key][0]);
        }
      } else {
        this.util.errorToast(this.util.translate('Something went wrong'));
      }
    });
  }

  redeemCode() {
    this.api.post_private('v1/referral/redeemReferral', { id: localStorage.getItem('uid'), code: this.register.referral }).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        // 1 = inviter
        // 2 = redeemer
        // 3 = both
        let text = '';
        if (data && data.data && data.data.who_received == 1) {
          text = this.util.translate('Congratulations your friend have received the $') + data.data.amount + this.util.translate(' on wallet');
        } else if (data && data.data && data.data.who_received == 2) {
          text = this.util.translate('Congratulations you have received the $') + data.data.amount + this.util.translate(' on wallet');
        } else if (data && data.data && data.data.who_received == 3) {
          text = this.util.translate('Congratulations you & your friend have received the $') + data.data.amount + this.util.translate(' on wallet');
        }
        this.presentModal(text);
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  async presentModal(text: any) {
    const modal = await this.modalController.create({
      component: RedeemSuccessPage,
      componentProps: { txt: text }
    });
    await modal.present();
  }

  updateFCMToken() {

  }

  onLogin() {
    this.util.onBack();
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
        this.register.country_code = '+' + data.data;
      }
    });
    return await modal.present();
  }

  openLink(name: string) {
    console.log(name);
    if (name == 'terms') {
      const param: NavigationExtras = {
        queryParams: {
          "name": this.util.translate("Terms & Conditions"),
          "id": 3
        }
      };
      this.util.navigateToPage('app-pages', param);
    } else if (name == 'privacy') {
      const param: NavigationExtras = {
        queryParams: {
          "name": this.util.translate("Privacy Policy"),
          "id": 2
        }
      };
      this.util.navigateToPage('app-pages', param);
    }
  }

}
