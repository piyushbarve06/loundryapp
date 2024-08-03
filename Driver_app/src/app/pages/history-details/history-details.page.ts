import { Component, OnInit } from '@angular/core';
import { ActionSheetController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import * as moment from 'moment';

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

  storeName: any = '';
  storeUID: any = '';
  storeCover: any = '';
  storeEmail: any = '';
  storeMobile: any = '';
  storeLat: any = '';
  storeLng: any = '';
  storeAddress: any = '';

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
    private actionSheetController: ActionSheetController,
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
    this.api.post_private('v1/orders/getDriverOrderDetails', { "id": this.id }).then((data: any) => {
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

        if (info && info.storeInfo && info.storeInfo.name) {
          const storeInfo = info.storeInfo;
          console.log(storeInfo);
          this.storeCover = storeInfo.cover;
          this.storeEmail = info.store_email;
          this.storeName = storeInfo.name;
          this.storeMobile = info.store_mobile;
          this.storeUID = storeInfo.uid;
          this.storeLat = storeInfo.lat;
          this.storeLng = storeInfo.lng;
          this.storeAddress = storeInfo.address;
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
      },
      {
        text: this.util.translate('Navigate'),
        icon: 'navigate-circle-outline',
        handler: () => {
          const googleUrl =
            'https://www.google.com/maps/search/?api=1&query=' + this.storeLat + ',' + this.storeLng;
          window.open(googleUrl, '_blank');
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
