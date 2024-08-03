import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { register } from 'src/app/interfaces/register';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SelectCountryPage } from '../select-country/select-country.page';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { NgForm } from '@angular/forms';
import { StoreCategoriesPage } from '../store-categories/store-categories.page';
import { VerifyPage } from '../verify/verify.page';
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
    lat: '',
    lng: '',
    cover: '',
    address: '',
    cid: '',
    about: '',
    name: '',
    country_code: '',
    categories: '',
    zipcode: '',
    check: false
  };
  submitted = false;
  isLogin: boolean = false;
  viewPassword: boolean = false;

  categories: any[] = [];

  cities: any[] = [];

  emailVerify: boolean = false;
  mobileVerify: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    public modalController: ModalController,
    private iab: InAppBrowser,
    private actionSheetController: ActionSheetController
  ) {
    setTimeout(() => {
      console.log(this.util.settingInfo);
      this.register.country_code = '+' + this.util.settingInfo.default_country_code;
    }, 1000);
    this.getCities();
  }

  getCities() {
    this.api.get_public('v1/cities/getActive').then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        this.cities = data.data;
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  ngOnInit() {
  }

  changeType() {
    this.viewPassword = !this.viewPassword;
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
          "name": this.util.translate('Terms & Conditions'),
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
        // this.createAccount();
        browser.close();
      }
    });
    console.log('browser=> end');
  }

  onRegister(form: NgForm) {
    console.log(this.register);
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

      if (this.register.cover == '') {
        this.util.errorToast('Please upload cover image', 'danger');
        return false;
      }

      if (this.emailVerify == false) {
        this.util.errorToast('Please verify email', 'danger');
        return false;
      }

      if (this.mobileVerify == false) {
        this.util.errorToast('Please verify mobile number', 'danger');
        return false;
      }

      this.isLogin = true;
      const savedCategories = [...new Set(this.categories.map(item => item.id))];
      console.log(savedCategories);
      console.log(savedCategories.join(','));
      this.register.categories = savedCategories.join(',')
      // no account found create it
      this.api.post_public('v1/user/sendMyRequest', this.register).then((data: any) => {
        this.isLogin = false;
        console.log(data);

        if (data && data.status == 200) {
          this.util.showToast('Your Request Is Saved', 'success', 'bottom');
          this.util.onBack();
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
  }

  onLogin() {
    this.util.onBack();
  }

  async updateProfile() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose from'),
      buttons: [{
        text: this.util.translate('Camera'),
        icon: 'camera',
        handler: () => {
          console.log('camera clicked');
          this.upload(CameraSource.Camera);
        }
      }, {
        text: this.util.translate('Gallery'),
        icon: 'images',
        handler: () => {
          console.log('gallery clicked');
          this.upload(CameraSource.Photos);
        }
      }, {
        text: this.util.translate('Cancel'),
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });

    await actionSheet.present();
  }

  async upload(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        source,
        quality: 50,
        resultType: CameraResultType.Base64
      });
      console.log('image output', image);
      if (image && image.base64String) {
        const blobData = this.b64toBlob(image.base64String, `image/${image.format}`);
        this.util.show(this.util.translate('Uploading..'));
        this.api.uploadImage('v1/uploadImage', blobData, image.format).then((data) => {
          console.log('image upload', data);
          this.util.hide();
          if (data && data.status === 200 && data.success === true && data.data.image_name) {
            this.register.cover = data.data.image_name;
            console.log('cover', this.register.cover);
          } else {
            console.log('NO image selected');
          }
        }, error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        }).catch(error => {
          console.log('error', error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        });
      }
    } catch (error) {
      console.log(error);
      this.util.apiErrorHandler(error);
    }
  }

  b64toBlob(b64Data: any, contentType = '', sliceSize = 512) {
    const byteCharacters = atob(b64Data);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);

      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }

  async openCategories() {
    const modal = await this.modalController.create({
      component: StoreCategoriesPage,
      componentProps: { categories: this.categories }
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.data && data.role == 'ok') {
        console.log('selected data', data.data);
        this.categories = data.data;
      }
    });
    await modal.present();
  }

  openWeb() {
    window.open('https://www.mapcoordinates.net/en', '_blank');
  }

  // verifyEmail() {
  //   if (this.register.email == '') {
  //     this.util.errorToast('Please enter email address', 'danger');
  //     return false;
  //   }

  //   const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
  //   if (!emailfilter.test(this.register.email)) {
  //     this.util.showToast(this.util.translate('Please enter valid email'), 'danger', 'bottom');
  //     return false;
  //   }

  //   console.log('verify email');
  //   this.util.show();
  //   this.api.post_public('v1/user/verifyEmailRegister', this.register).then((data: any) => {
  //     console.log(data);
  //     this.util.hide();
  //     if (data && data.status == 200) {
  //       const param = {
  //         'email': this.register.email,
  //         'subject': this.util.translate('Verification'),
  //         'header_text': this.util.translate('Use this code for verification'),
  //         'thank_you_text': this.util.translate("Don't share this otp to anybody else"),
  //         'mediaURL': this.api.mediaURL,
  //       };
  //       this.isLogin = true;
  //       this.api.post_public('v1/user/sendRegisterEmail', param).then((data: any) => {
  //         console.log(data);
  //         this.isLogin = false;
  //         if (data && data.status && data.status == 200 && data.data == true && data.otp_id) {
  //           // this.openVerificationModal(data.otp_id, this.register.email, 'email');
  //           this.emailVerify = true;
  //         } else if (data && data.status && data.status == 500 && data.data == false) {
  //           this.util.errorToast(data.message, 'danger');
  //         }
  //       }, error => {
  //         console.log(error);
  //         this.isLogin = false;
  //         if (error && error.error && error.error.status == 500 && error.error.message) {
  //           this.util.errorToast(error.error.message, 'danger');
  //         } else if (error && error.error && error.error.error && error.error.status == 422) {
  //           for (let key in error.error.error) {
  //             console.log(error.error.error[key][0]);
  //             this.util.errorToast(error.error.error[key][0], 'danger');
  //           }
  //         } else {
  //           this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
  //         }
  //       }).catch(error => {
  //         console.log(error);
  //         this.isLogin = false;
  //         if (error && error.error && error.error.status == 500 && error.error.message) {
  //           this.util.errorToast(error.error.message, 'danger');
  //         } else if (error && error.error && error.error.error && error.error.status == 422) {
  //           for (let key in error.error.error) {
  //             console.log(error.error.error[key][0]);
  //             this.util.errorToast(error.error.error[key][0], 'danger');
  //           }
  //         } else {
  //           this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
  //         }
  //       });
  //     } else if (data && data.error && data.error.msg) {
  //       this.util.errorToast(data.error.msg);
  //     } else if (data && data.error && data.error.message == 'Validation Error.') {
  //       for (let key in data.error[0]) {
  //         console.log(data.error[0][key][0]);
  //         this.util.errorToast(data.error[0][key][0]);
  //       }
  //     } else {
  //       this.util.errorToast(this.util.translate('Something went wrong'));
  //     }
  //   }, error => {
  //     console.log(error);
  //     this.util.hide();
  //     if (error && error.error && error.error.status == 500 && error.error.message) {
  //       this.util.errorToast(error.error.message);
  //     } else if (error && error.error && error.error.error && error.error.status == 422) {
  //       for (let key in error.error.error) {
  //         console.log(error.error.error[key][0]);
  //         this.util.errorToast(error.error.error[key][0]);
  //       }
  //     } else {
  //       this.util.errorToast(this.util.translate('Something went wrong'));
  //     }
  //   }).catch(error => {
  //     console.log(error);
  //     this.util.hide();
  //     if (error && error.error && error.error.status == 500 && error.error.message) {
  //       this.util.errorToast(error.error.message);
  //     } else if (error && error.error && error.error.error && error.error.status == 422) {
  //       for (let key in error.error.error) {
  //         console.log(error.error.error[key][0]);
  //         this.util.errorToast(error.error.error[key][0]);
  //       }
  //     } else {
  //       this.util.errorToast(this.util.translate('Something went wrong'));
  //     }
  //   });
  // }

  verifyEmail() {
    this.emailVerify = true;
  }

  // verifyMobile() {
  //   console.log('verify phone');
  //   if (this.register.mobile == '') {
  //     this.util.errorToast('Mobile Number is required', 'danger');
  //     return false;
  //   }
  //   if (this.util.settingInfo.sms_name == '2') {
  //     console.log('firebase verification');
  //     this.isLogin = true;
  //     this.api.post_public('v1/auth/sendRegisterMobile', { country_code: this.register.country_code, mobile: this.register.mobile }).then((data: any) => {
  //       console.log(data);
  //       this.isLogin = false;
  //       if (data && data.status && data.status == 200 && data.data == true) {
  //         // send otp from api
  //         // this.openFirebaseAuthModal();
  //       } else if (data && data.status && data.status == 500 && data.data == false) {
  //         this.util.errorToast(data.message);
  //       }
  //     }, error => {
  //       console.log(error);
  //       this.isLogin = false;
  //       if (error && error.error && error.error.status == 500 && error.error.message) {
  //         this.util.errorToast(error.error.message);
  //       } else if (error && error.error && error.error.error && error.error.status == 422) {
  //         for (let key in error.error.error) {
  //           console.log(error.error.error[key][0]);
  //           this.util.errorToast(error.error.error[key][0]);
  //         }
  //       } else {
  //         this.util.errorToast(this.util.translate('Something went wrong'));
  //       }
  //     }).catch(error => {
  //       console.log(error);
  //       this.isLogin = false;
  //       if (error && error.error && error.error.status == 500 && error.error.message) {
  //         this.util.errorToast(error.error.message);
  //       } else if (error && error.error && error.error.error && error.error.status == 422) {
  //         for (let key in error.error.error) {
  //           console.log(error.error.error[key][0]);
  //           this.util.errorToast(error.error.error[key][0]);
  //         }
  //       } else {
  //         this.util.errorToast(this.util.translate('Something went wrong'));
  //       }
  //     });
  //   } else {
  //     console.log('other otp');
  //     const param = {
  //       'country_code': this.register.country_code,
  //       'mobile': this.register.mobile,
  //       'email': this.register.email
  //     };
  //     this.isLogin = true;
  //     this.api.post_public('v1/user/sendVerifyOTPMobile', param).then((data: any) => {
  //       console.log(data);
  //       this.isLogin = false;
  //       if (data && data.status && data.status == 200 && data.data == true && data.otp_id) {
  //         this.openVerificationModal(data.otp_id, this.register.country_code + this.register.mobile, 'phone');
  //       } else if (data && data.status && data.status == 500 && data.data == false) {
  //         this.util.errorToast(data.message, 'danger');
  //       }
  //     }, error => {
  //       console.log(error);
  //       this.isLogin = false;
  //       if (error && error.error && error.error.status == 500 && error.error.message) {
  //         this.util.errorToast(error.error.message, 'danger');
  //       } else if (error && error.error && error.error.error && error.error.status == 422) {
  //         for (let key in error.error.error) {
  //           console.log(error.error.error[key][0]);
  //           this.util.errorToast(error.error.error[key][0], 'danger');
  //         }
  //       } else {
  //         this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
  //       }
  //     }).catch(error => {
  //       console.log(error);
  //       this.isLogin = false;
  //       if (error && error.error && error.error.status == 500 && error.error.message) {
  //         this.util.errorToast(error.error.message, 'danger');
  //       } else if (error && error.error && error.error.error && error.error.status == 422) {
  //         for (let key in error.error.error) {
  //           console.log(error.error.error[key][0]);
  //           this.util.errorToast(error.error.error[key][0], 'danger');
  //         }
  //       } else {
  //         this.util.errorToast(this.util.translate('Something went wrong'), 'danger');
  //       }
  //     });
  //   }
  // }

  verifyMobile() {
    this.mobileVerify = true;
  }

  async openVerificationModal(id: any, to: any, verify: any) {
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
        if (verify == 'email') {
          this.emailVerify = true;
        } else if (verify == 'phone') {
          this.mobileVerify = true;
        }
      }
    })
    return await modal.present();
  }

}
