import { Component } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { UtilService } from './services/util.service';
import { ApiService } from './services/api.service';
import { CartService } from './services/cart.service';
import { TranslateService } from '@ngx-translate/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { StatusBar } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  selectedIndex: any;
  public appPages: any[] = [];
  constructor(
    public util: UtilService,
    public api: ApiService,
    public cart: CartService,
    private alertController: AlertController,
    private translate: TranslateService,
  ) {
    const defaultSettings = {
      id: 1,
      name: '',
      mobile: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      tax: 1,
      delivery_charge: 1,
      currencySymbol: '',
      currencySide: '',
      currencyCode: '',
      appDirection: '',
      logo: '',
      sms_name: '',
      have_shop: 1,
      findType: 1,
      reset_pwd: 1,
      user_login: 1,
      freelancer_login: 1,
      user_verify_with: 1,
      search_radius: 1,
      country_modal: '',
      default_country_code: '',
      default_city_id: '',
      default_delivery_zip: '',
      social: '',
      app_color: '',
      app_status: 1,
      status: 1,
      allowDistance: 1,
      searchResultKind: 1,
      extra_field: ''
    };
    const isPushNotificationsAvailable = Capacitor.isPluginAvailable('PushNotifications');
    if (isPushNotificationsAvailable) {
      const addListeners = async () => {
        await PushNotifications.addListener('registration', token => {
          console.info('Registration token: ', token.value);
          localStorage.setItem('pushToken', token.value);
          const uid = localStorage.getItem('uid');
          if (uid != null && uid && uid != '' && uid != 'null') {
            this.updateFCMToken();
          }
        });

        await PushNotifications.addListener('registrationError', err => {
          console.error('Registration error: ', err.error);
        });

        await PushNotifications.addListener('pushNotificationReceived', notification => {
          console.log('Push notification received: ', notification);
          this.presentAlertConfirm(notification.title, notification.body);
        });

        await PushNotifications.addListener('pushNotificationActionPerformed', notification => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
        });
      }

      const registerNotifications = async () => {
        let permStatus = await PushNotifications.checkPermissions();

        if (permStatus.receive == 'prompt') {
          permStatus = await PushNotifications.requestPermissions();
        }

        if (permStatus.receive != 'granted') {
          throw new Error('User denied permissions!');
        }

        await PushNotifications.register();
      }

      addListeners();
      registerNotifications().then(data => {
        console.log('registering data', data);
      }).catch((error: any) => {
        console.log('registering error', error);
      });
    }

    StatusBar.setBackgroundColor({ "color": '#3880ff' }).then((data: any) => {
      console.log('statusbar data', data);
    }, error => {
      console.log('statusbar color', error);
    }).catch((error: any) => {
      console.log('statusbar color', error);
    });
    this.util.settingInfo = defaultSettings;
    this.appPages = this.util.appPage;
    if (localStorage.getItem('uid') != null && localStorage.getItem('uid') && localStorage.getItem('uid') !== '' && localStorage.getItem('uid') !== 'null') {
      this.getUserByID();
    }
    this.api.get_public('v1/settings/getDefault').then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200) {
        const settings = data && data.data && data.data.settings ? data.data.settings : null;
        const support = data && data.data && data.data.support ? data.data.support : null;
        if (settings) {
          this.util.appName = settings.name;
          this.util.appLogo = settings.logo;
          this.util.direction = settings.appDirection;
          this.util.app_status = settings.app_status == 1 ? true : false;
          this.util.app_color = settings.app_color;
          this.util.cside = settings.currencySide;
          this.util.currecny = settings.currencySymbol;
          this.util.settingInfo = settings;
          document.documentElement.dir = this.util.direction;
          this.cart.serviceTax = this.util.settingInfo.tax;
          const lng = localStorage.getItem('selectedLanguage');
          if (!lng || lng == null) {
            localStorage.setItem('selectedLanguage', 'en');
            localStorage.setItem('direction', 'ltr');
          }

          const direaction = localStorage.getItem('direction') as string;
          this.translate.use(localStorage.getItem('selectedLanguage') || 'en');
          document.documentElement.dir = direaction;

        }

        if (support) {
          this.util.supportData = support;
        }
      }
    }, error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.util.apiErrorHandler(error);
    });
  }

  async presentAlertConfirm(title: any, body: any) {
    const alert = await this.alertController.create({
      header: this.util.translate('Notification'),
      subHeader: title,
      message: body,
      buttons: [
        {
          text: this.util.translate('Cancel'),
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: this.util.translate('Okay'),
          handler: () => {
            console.log('Confirm Okay');
          }
        }
      ]
    });

    await alert.present();
  }

  getTranslate(str: any) {
    return this.util.translate(str);
  }

  haveSignedIn() {
    const uid = localStorage.getItem('uid');
    if (uid && uid != null && uid !== 'null') {
      return true;
    }
    return false;
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

  updateFCMToken() {
    const param = {
      id: localStorage.getItem('uid'),
      fcm_token: localStorage.getItem('pushToken') && localStorage.getItem('pushToken') != null ? localStorage.getItem('pushToken') : 'NA'
    }
    this.api.post_private('v1/profile/update', param).then((data: any) => {
      console.log(data);
    }, error => {
      console.log(error);
    }).catch(error => {
      console.log(error);
    });
  }

  getUserByID() {
    this.api.post_private('v1/profile/getProfile', { "id": localStorage.getItem('uid') }).then((data: any) => {
      console.log(">>>>><<<<<", data);
      if (data && data.success && data.status === 200) {
        this.util.userInfo = data.data;
      } else {
        localStorage.removeItem('uid');
        localStorage.removeItem('token');
      }
    }, err => {
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      this.util.userInfo = null;
      console.log(err);
    }).catch((err) => {
      localStorage.removeItem('uid');
      localStorage.removeItem('token');
      this.util.userInfo = null;
      console.log(err);
    });
  }

  onPage(name: any) {
    this.util.navigateRoot(name);
  }
}
