import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import * as moment from 'moment';
import { AddRatingPage } from '../add-rating/add-rating.page';

@Component({
  selector: 'app-history-details',
  templateUrl: './history-details.page.html',
  styleUrls: ['./history-details.page.scss'],
})
export class HistoryDetailsPage implements OnInit {
  id: any = '';
  apiCalled: boolean = false;
  storeName: any = '';
  storeAddress: any = '';
  storeCover: any = '';
  storeMobile: any = '';
  storeFCM: any = '';
  storeEmail: any = '';
  storeUID: any = '';

  deliveryAddress: any = '';
  items: any[] = [];
  pickupDateTime: any = '';
  deliveryDateTime: any = '';

  totalPrice: any = 0;
  discount: any = 0;
  deliveryCost: any = 0;
  serviceTax: any = 0;
  grandTotal: any = 0;
  walletPrice: any = 0;
  notes: any = '';
  paid: any = '';
  status: any = 0;
  statusName: any[] = [
    'created',
    'accepted',
    'rejected',
    'ongoing',
    'completed',
    'cancelled',
    'refunded',
    'delayed',
    'awaiting payment',
  ];

  canCancle: boolean;
  isDelivered: boolean;

  driverName: any = '';
  driverId: any = '';
  driverCover: any = '';
  driverEmail: any = '';
  driverMobile: any = '';
  driverLat: any = '';
  driverLng: any = '';
  haveDriver: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    public route: ActivatedRoute,
    private alertController: AlertController,
    private actionSheetController: ActionSheetController,
    private iab: InAppBrowser,
    private modalController: ModalController
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.id) {
        this.id = data.id;
        this.getOrderDetails();
      }
    });
  }

  getOrderDetails() {
    this.apiCalled = false;
    this.api.post_private('v1/orders/getOrderDetails', { "id": this.id }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        console.log(info);
        this.storeAddress = info.store_address;
        this.storeCover = info.store_cover;
        this.storeName = info.store_name;
        this.storeEmail = info.store_email;
        this.storeMobile = info.store_mobile;
        this.storeUID = info.store_id;
        this.storeFCM = info.store_fcm_token;

        this.discount = info.discount;
        this.deliveryCost = info.distance_cost;
        this.grandTotal = info.grand_total;
        this.notes = info.notes && info.notes != null && info.notes != '' ? info.notes : '';
        this.totalPrice = info.total;
        this.walletPrice = info.wallet_price;
        this.status = this.statusName[info.status];
        if (info.paid != 'cod') {
          this.paid = this.util.translate('Paid');
        } else {
          this.paid = this.util.translate('COD');
        }
        if (this.status == 'created') {
          this.canCancle = true;
        } else {
          this.canCancle = false;
        }

        if (this.status == 'completed') {
          this.isDelivered = true;
        } else {
          this.isDelivered = false;
        }

        if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.items)) {
          this.items = JSON.parse(info.items);
        }
        this.pickupDateTime = moment(info.pickup_date).format('LL') + ' | ' + info.pickup_slot;
        this.deliveryDateTime = moment(info.delivery_date).format('LL') + ' | ' + info.delivery_slot;
        if (info && info.order_to == 1) {
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.address)) {
            const address = JSON.parse(info.address);
            console.log(address);
            this.deliveryAddress = address.house + ' ' + address.address + ' ' + address.landmark + ' ' + address.pincode;
          } else {
            this.deliveryAddress = this.util.translate('Self Drop & Pickup');
          }
        } else {
          this.deliveryAddress = this.util.translate('Self Drop & Pickup');
        }
        if (info && info.driverInfo && info.driverInfo.first_name) {
          this.haveDriver = true;
          const driverInfo = info.driverInfo;
          console.log(driverInfo);
          this.driverCover = driverInfo.cover;
          this.driverEmail = driverInfo.email;
          this.driverName = driverInfo.first_name + ' ' + driverInfo.last_name;
          this.driverMobile = driverInfo.mobile;
          this.driverId = driverInfo.id;
          this.driverLat = driverInfo.lat;
          this.driverLng = driverInfo.lng;
        }
        console.log(this.items);
      }
    }, error => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  ngOnInit() {
  }

  onBack() {
    this.util.onBack();
  }

  async presentAlertConfirm() {
    let buttons: any[] = [];
    buttons.push({
      text: this.util.translate('Give Review to Store'),
      icon: 'star-outline',
      handler: () => {
        console.log('Store clicked');
        this.reviewModal("store", this.storeUID, this.storeName, 'NA');
      }
    });
    buttons.push({
      text: this.util.translate('Give Review to Services'),
      icon: 'star-outline',
      handler: () => {
        console.log('Service clicked');
        this.reviewModal("service", 0, 'Service', this.items);
      }
    });
    if (this.haveDriver == true) {
      buttons.push({
        text: this.util.translate('Give Review to Driver'),
        icon: 'star-outline',
        handler: () => {
          console.log('Driver clicked');
          this.reviewModal("driver", this.driverId, this.driverName, 'Na');
        }
      });
    }
    buttons.push({
      text: this.util.translate('Cancel'),
      icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    });
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Give Review'),
      buttons: buttons
    });

    await actionSheet.present();
  }

  async reviewModal(to: any, id: any, name: any, items: any) {
    const modal = await this.modalController.create({
      component: AddRatingPage,
      componentProps: {
        "to": to,
        "id": id,
        "name": name,
        "items": items
      }
    });

    await modal.present();

  }

  async changeStatus() {
    const alert = await this.alertController.create({
      header: this.util.translate('Are you sure?'),
      message: this.util.translate('Are you sure to cancel order this order?'),
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
            this.cancelOrder();
          }
        }
      ]
    });

    await alert.present();
  }

  sendNotification() {
    const param = {
      id: this.storeFCM,
      title: this.util.translate('Order Cancelled ') + ' #' + this.id,
      message: this.util.translate('Order Cancelled')
    };
    this.api.post_private('v1/notification/sendNotification', param).then((data: any) => {
      console.log('notification response', data);
    }, error => {
      console.log('error in notification', error);
    }).catch(error => {
      console.log('error in notification', error);
    });
  }


  cancelOrder() {
    this.util.show();
    this.api.post_private('v1/orders/update', { "id": this.id, "status": 5 }).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.sendNotification();
      this.util.errorToast('Order Cancelled', 'success');
      this.util.orderChanged();
      this.util.onBack();
    }, error => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.util.hide();
      this.util.apiErrorHandler(error);
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose Action'),
      mode: 'ios',
      buttons: [{
        text: this.util.translate('Make Phone Call'),
        icon: 'call-outline',
        handler: () => {
          console.log('Call clicked');
          window.open('tel:' + this.storeMobile, '_blank');
        }
      }, {
        text: this.util.translate('Send Email'),
        icon: 'mail-unread-outline',
        handler: () => {
          console.log('Email clicked');
          window.open('mailto:' + this.storeEmail, '_blank');
        }
      }, {
        text: this.util.translate('Send Chat Message'),
        icon: 'chatbubble-ellipses-outline',
        handler: () => {
          console.log('Chat clicked');
          const param: NavigationExtras = {
            queryParams: {
              "id": this.storeUID,
              "name": this.storeName
            }
          };
          this.util.navigateToPage('inbox', param);
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

  async presentDriverActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose Action'),
      mode: 'ios',
      buttons: [{
        text: this.util.translate('Make Phone Call'),
        icon: 'call-outline',
        handler: () => {
          console.log('Call clicked');
          window.open('tel:' + this.driverMobile, '_blank');
        }
      }, {
        text: this.util.translate('Send Email'),
        icon: 'mail-unread-outline',
        handler: () => {
          console.log('Email clicked');
          window.open('mailto:' + this.driverEmail, '_blank');
        }
      }, {
        text: this.util.translate('Send Chat Message'),
        icon: 'chatbubble-ellipses-outline',
        handler: () => {
          console.log('Chat clicked');
          const param: NavigationExtras = {
            queryParams: {
              "id": this.driverId,
              "name": this.driverName
            }
          };
          this.util.navigateToPage('inbox', param);
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

  async openHelp() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose Action'),
      mode: 'ios',
      buttons: [{
        text: this.util.translate('Complaints'),
        role: 'destructive',
        icon: 'at-outline',
        handler: () => {
          console.log('Complaints clicked');
          const param: NavigationExtras = {
            queryParams: {
              "id": this.id,
            }
          };
          this.util.navigateToPage('complaints', param);
        }
      }, {
        text: this.util.translate('Support Chat'),
        icon: 'chatbubble-ellipses-outline',
        handler: () => {
          console.log('Share clicked');
          console.log(this.util.supportData.id);
          const param: NavigationExtras = {
            queryParams: {
              "id": this.util.supportData.id,
              "name": "Support"
            }
          };
          this.util.navigateToPage('inbox', param);
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

  async invoice() {
    const options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      zoom: 'yes',
      toolbar: 'yes',
      closebuttoncaption: 'close'
    };
    const param = {
      "id": this.id,
      "token": localStorage.getItem('token')
    }
    await this.iab.create(this.api.baseUrl + 'v1/orders/getOrderInvoice?' + this.api.JSON_to_URLEncoded(param), '_blank', options);
  }

}
