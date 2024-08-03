import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import { InAppBrowser, InAppBrowserOptions } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { SelectDriverPage } from '../select-driver/select-driver.page';

@Component({
  selector: 'app-history-details',
  templateUrl: './history-details.page.html',
  styleUrls: ['./history-details.page.scss'],
})
export class HistoryDetailsPage implements OnInit {
  id: any = '';
  apiCalled: boolean = false;
  userName: any = '';
  userCover: any = '';
  userMobile: any = '';
  userEmail: any = '';
  userId: any = '';
  userFCMToken: any = '';

  deliveryAddress: any = '';
  deliveryLat: any = '';
  deliveryLng: any = '';
  items: any[] = [];
  pickupDateTime: any = '';
  deliveryDateTime: any = '';

  driverName: any = '';
  driverId: any = '';
  driverCover: any = '';
  driverEmail: any = '';
  driverMobile: any = '';
  driverLat: any = '';
  driverLng: any = '';
  haveDriver: boolean = false;

  totalPrice: any = 0;
  discount: any = 0;
  deliveryCost: any = 0;
  serviceTax: any = 0;
  grandTotal: any = 0;
  walletPrice: any = 0;
  notes: any = '';
  paid: any = '';
  status: any = 0;
  statusNumber: any = 0;
  changeStatusOrder: any = 0;
  statusName: any[] = [
    'created', // 0
    'accepted', // 1
    'rejected', // 2
    'ongoing', // 3
    'completed', // 4
    'cancelled', // 5
    'refunded', // 6
    'delayed', // 7
    'awaiting payment', // 8
  ];
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
    this.api.post_private('v1/orders/getStoreOrderDetails', { "id": this.id }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        console.log(info);
        this.userCover = info.user_cover;
        this.userName = info.first_name + ' ' + info.last_name;
        this.userMobile = info.user_mobile;
        this.userEmail = info.user_email;
        this.userId = info.uid;
        this.userFCMToken = info.user_fcm_token;
        this.discount = info.discount;
        this.deliveryCost = info.distance_cost;
        this.grandTotal = info.grand_total;
        this.notes = info.notes && info.notes != null && info.notes != '' ? info.notes : '';
        this.totalPrice = info.total;
        this.walletPrice = info.wallet_price;
        this.statusNumber = info.status;
        this.status = this.util.translate(this.statusName[info.status]);
        if (info.paid != 'cod') {
          this.paid = 'Paid';
        } else {
          this.paid = 'COD';
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
            this.deliveryLat = address.lat;
            this.deliveryLng = address.lng;
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

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose Action'),
      mode: 'ios',
      buttons: [{
        text: this.util.translate('Make Phone Call'),
        icon: 'call-outline',
        handler: () => {
          console.log('Call clicked');
          window.open('tel:' + this.userMobile, '_blank');
        }
      }, {
        text: this.util.translate('Send Email'),
        icon: 'mail-unread-outline',
        handler: () => {
          console.log('Email clicked');
          window.open('mailto:' + this.userEmail, '_blank');
        }
      }, {
        text: this.util.translate('Send Chat Message'),
        icon: 'chatbubble-ellipses-outline',
        handler: () => {
          console.log('Chat clicked');
          const param: NavigationExtras = {
            queryParams: {
              "id": this.userId,
              "name": this.userName
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
      buttons: [
        {
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

  changeStatus(number: any) {
    console.log(number);
    if (number == 1) {
      console.log('accept');
      this.acceptOrder();
    } else {
      console.log('reject');
      this.presentAlertConfirm();
    }
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      header: this.util.translate('Confirm!'),
      message: this.util.translate('Are you sure to reject this order?'),
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
            this.rejectOrder();
          }
        }
      ]
    });

    await alert.present();
  }

  async acceptOrder() {
    const actionSheet = await this.actionSheetController.create({
      header: this.util.translate('Choose Action'),
      mode: "ios",
      buttons: [{
        text: this.util.translate('Delivered By Driver?'),
        role: 'destructive',
        icon: 'bicycle-outline',
        handler: () => {
          console.log('Open Driver clicked');
          this.openDriverModal();
        }
      }, {
        text: this.util.translate('Self Pickup & Deliver'),
        icon: 'golf-outline',
        handler: () => {
          console.log('Self Pickup clicked');
          this.updateAcceptOrder();
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

  updateAcceptOrder() {
    const param = {
      "id": this.id,
      "status": 1,
      "self_pickup": 1
    };
    this.util.show('Accepting Order');
    this.api.post_private('v1/orders/update', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.sendNotification(1);
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

  sendNotification(statusName: any) {
    console.log(statusName);
    const name = this.statusName[statusName];
    console.log(name);
    const param = {
      id: this.userFCMToken,
      title: this.util.translate('Order ') + ' #' + this.id,
      message: this.util.translate('Order Status Changed to') + ' ' + name
    };
    this.api.post_private('v1/notification/sendNotification', param).then((data: any) => {
      console.log('notification response', data);
    }, error => {
      console.log('error in notification', error);
    }).catch(error => {
      console.log('error in notification', error);
    });
  }

  sendNotificationToDriver(token: any) {
    const param = {
      id: token,
      title: this.util.translate('New Order ') + ' #' + this.id,
      message: this.util.translate('You Got New Order')
    };
    this.api.post_private('v1/notification/sendNotification', param).then((data: any) => {
      console.log('notification response', data);
    }, error => {
      console.log('error in notification', error);
    }).catch(error => {
      console.log('error in notification', error);
    });
  }

  rejectOrder() {
    const param = {
      "id": this.id,
      "status": 2
    };
    this.util.show('Rejecting Order');
    this.api.post_private('v1/orders/update', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.sendNotification(2);
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

  async openDriverModal() {
    const modal = await this.modalController.create({
      component: SelectDriverPage,
      componentProps: {
        "lat": this.deliveryLat,
        "lng": this.deliveryLng
      }
    });
    modal.onDidDismiss().then((data) => {
      console.log(data);
      if (data && data.data && data.role == 'ok') {
        console.log(data.data.id);
        console.log(data.data.token);
        const token = data.data.token;
        const param = {
          "id": this.id,
          "status": 1,
          "driver_id": data.data.id
        };
        this.util.show('Accepting Order');
        this.api.post_private('v1/orders/update', param).then((data: any) => {
          console.log(data);
          this.util.hide();
          this.sendNotification(1);
          this.sendNotificationToDriver(token);
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
    })
    await modal.present();

  }

  changeOrderStatus() {
    console.log(this.changeStatusOrder);
    if (this.changeStatusOrder == 0) {
      this.util.errorToast('Please select status', 'danger');
      return false;
    }
    const param = {
      "id": this.id,
      "status": this.changeStatusOrder
    };
    this.util.show('Updating Order status');
    this.api.post_private('v1/orders/update', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.sendNotification(this.changeStatusOrder);
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

  openLocation() {
    const googleUrl =
      'https://www.google.com/maps/search/?api=1&query=' + this.deliveryLat + ',' + this.deliveryLng;
    window.open(googleUrl, '_blank');
  }

}
