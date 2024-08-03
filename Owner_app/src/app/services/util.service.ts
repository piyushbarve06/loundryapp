import { Injectable, NgZone } from '@angular/core';
import { LoadingController, AlertController, ToastController, NavController, MenuController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { NavigationExtras, Router } from '@angular/router';
import { AppSettings } from '../interfaces/settings';
import { SupportModel } from '../interfaces/support';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {
  isLoading = false;
  public translations: any[] = [];
  public default_country_code: any = '';
  public user_verification: any = 0;
  public themeColor = [
    { name: 'Default', class: 'default' },
    { name: 'Dark', class: 'dark-theme' },
  ];
  public findType: any = 0;
  public userInfo: any;
  public general: any;
  public cside: any = 'left';
  public currecny: any = '$';
  public appName: any;
  public appLogo: any;
  public direction: any;
  public show_booking: boolean = true;
  public app_color: any;
  public app_status: boolean = true;
  public app_closed_message: any = '';
  public settingInfo: AppSettings;
  public supportData: SupportModel;
  public adminInfo: any;
  public isWebOrPWA: boolean = false;
  public diningInformations: any;
  public appClosedMessage: any = '';

  private orderChange = new Subject<any>();
  public newService = new Subject<any>();
  public slotUpdate = new Subject<any>();
  public loggedIN: boolean = false;
  public home_style: any = 1;
  public countrys: any[] = [];
  public smsGateway: any = '0';
  public login_style: any = 3;
  public user_login_with: any = 0;
  public register_style: any = 3;
  public servingCities: any[] = [];
  public cityName: any = '';
  public cityId: any = '';
  public zipcode: any = '';
  public deliveryAddress: any = '';
  public active_store: any[] = [];
  public favIds: any[] = [];

  public makeOrders: any = 0;
  public reset_pwd: any = 0;
  public haveFav: boolean;

  public allLanguages: any[] = [
    {
      name: 'English',
      code: 'en',
      direction: 'ltr'
    },
    {
      name: 'Español',
      code: 'es',
      direction: 'ltr'
    },
    {
      name: 'عربي',
      code: 'ar',
      direction: 'rtl'
    },
    {
      name: 'हिन्दी',
      code: 'hi',
      direction: 'ltr'
    }
  ];
  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private menuCtrl: MenuController,
    private router: Router,
    private zone: NgZone,
    private translateService: TranslateService
  ) {

  }

  navigateToPage(routes: any, param?: NavigationExtras | undefined) {
    this.zone.run(() => {
      console.log(routes, param);
      this.router.navigate([routes], param);
    });
  }



  navigateRoot(routes: any) {
    this.zone.run(() => {
      this.navCtrl.navigateRoot([routes], { replaceUrl: true });
    });
  }

  onUpdateSlot() {
    this.slotUpdate.next(0);
  }

  subscribeSlot(): Subject<any> {
    return this.slotUpdate;
  }

  orderChanged() {
    this.orderChange.next(0);
  }

  retriveChanges(): Subject<any> {
    return this.orderChange;
  }

  serviceChanged() {
    this.newService.next(0);
  }

  onServiceChanged(): Subject<any> {
    return this.newService;
  }

  getKeys(key: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(localStorage.getItem(key))
    });
  }

  clearKeys(key: any) {
    // this.storage.remove(key);
    localStorage.removeItem(key);
  }

  setKeys(key: any, value: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      resolve(localStorage.setItem(key, value));
    });
  }


  translate(str: any) {
    return this.translateService.instant(str);
  }

  openMenu() {
    this.menuCtrl.open();
  }

  setFav(id: any) {
    this.favIds.push(id);
  }

  removeFav(id: any) {
    this.favIds = this.favIds.filter(x => x !== id);
  }

  async show(msg?: any) {
    this.isLoading = true;
    return await this.loadingCtrl.create({
      message: msg && msg != '' && msg != null ? this.translate(msg) : '',
      spinner: 'bubbles',
    }).then(a => {
      a.present().then(() => {
        //console.log('presented');
        if (!this.isLoading) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async hide() {
    this.isLoading = false;
    return await this.loadingCtrl.dismiss().then(() => console.log('dismissed'));
  }

  /*
    Show Warning Alert Message
    param : msg = message to display
    Call this method to show Warning Alert,
    */
  async showWarningAlert(msg: any) {
    const alert = await this.alertCtrl.create({
      header: this.translate('Warning'),
      message: this.translate(msg),
      buttons: [this.translate('OK')]
    });

    await alert.present();
  }

  async showSimpleAlert(msg: any) {
    const alert = await this.alertCtrl.create({
      header: '',
      message: this.translate(msg),
      buttons: [this.translate('OK')]
    });

    await alert.present();
  }

  /*
   Show Error Alert Message
   param : msg = message to display
   Call this method to show Error Alert,
   */
  async showErrorAlert(msg: any) {
    const alert = await this.alertCtrl.create({
      header: this.translate('Error'),
      message: this.translate(msg),
      buttons: [this.translate('OK')]
    });

    await alert.present();
  }

  /*
     param : email = email to verify
     Call this method to get verify email
     */
  async getEmailFilter(email: any) {
    const emailfilter = /^[\w._-]+[+]?[\w._-]+@[\w.-]+\.[a-zA-Z]{2,6}$/;
    if (!(emailfilter.test(email))) {
      const alert = await this.alertCtrl.create({
        header: this.translate('Warning'),
        message: this.translate('Please enter valid email'),
        buttons: [this.translate('OK')]
      });
      await alert.present();
      return false;
    } else {
      return true;
    }
  }


  /*
    Show Toast Message on Screen
     param : msg = message to display, color= background
     color of toast example dark,danger,light. position  = position of message example top,bottom
     Call this method to show toast message
     */

  async showToast(msg: any, colors: any, positon: any) {
    const toast = await this.toastCtrl.create({
      message: this.translate(msg),
      duration: 2000,
      color: colors,
      position: positon
    });
    toast.present();
    await Haptics.impact({ style: ImpactStyle.Medium });
  }
  async shoNotification(msg: any, colors: any, positon: any) {

    const toast = await this.toastCtrl.create({
      message: this.translate(msg),
      duration: 4000,
      color: colors,
      position: positon,
      buttons: [
        {
          text: this.translate('Ok'),
          role: 'cancel',
          handler: () => {
            // console.log('Cancel clicked');
          }
        }
      ]
    });
    toast.present();
    await Haptics.impact({ style: ImpactStyle.Medium });

  }

  async errorToast(msg: any, color?: any) {

    const toast = await this.toastCtrl.create({
      message: this.translate(msg),
      duration: 2000,
      color: color ? color : 'dark'
    });
    toast.present();
    await Haptics.impact({ style: ImpactStyle.Medium });

  }

  onBack() {
    this.navCtrl.back();
  }

  apiErrorHandler(err: any) {
    // console.log('Error got in service =>', err)
    if (err && err.status === 401 && err.error.error) {
      this.errorToast(err.error.error);
      this.navCtrl.navigateRoot('/login');
      return false;
    }
    if (err && err.status === 500 && err.error.error) {
      this.errorToast(err.error.error);
      return false;
    }
    if (err.status === -1) {
      this.errorToast('Failed To Connect With Server');
    } else if (err.status === 401) {
      this.errorToast('Unauthorized Request!');
      localStorage.removeItem('token');
      localStorage.removeItem('uid');
      this.navCtrl.navigateRoot('/login');
    } else if (err.status === 500) {
      this.errorToast('Something went wrong');
    } else if (err.status === 422 && err.error.error) {
      this.errorToast(err.error.error);
    } else {
      this.errorToast('Something went wrong');
    }

  }

  // setDetails(data) {
  //   this.details = null;
  //   this.details = data;
  // }
  // getDetails() {
  //   return this.details;
  // }

  makeid(length: any) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  public loadScript(url: string) {
    const body = <HTMLDivElement>document.body;
    const script = document.createElement('script');
    script.innerHTML = '';
    script.src = url;
    script.async = false;
    script.defer = true;
    body.appendChild(script);
  }
}
