import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { NavigationExtras } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  currentId: any = 'new';
  dummy: any[] = [];
  newOrders: any[] = [];
  oldOrders: any[] = [];
  limit: any;
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
    public api: ApiService
  ) {
    this.util.retriveChanges().subscribe(() => {
      this.dummy = Array(15);
      this.getOrders('', false);
    })
  }

  ionViewWillEnter() {
    this.limit = 1;
    this.dummy = Array(15);
    this.getOrders('', false);
  }
  getOrders(event: any, haveRefresh: any) {
    this.api.post_private('v1/orders/getStoreOrders', { "id": localStorage.getItem('uid'), "limit": this.limit * 10 }).then((data: any) => {
      console.log(data);
      this.dummy = [];
      this.newOrders = [];
      this.oldOrders = [];
      if (data && data.status && data.status == 200 && data.data) {
        data.data.forEach((element: any) => {
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.items)) {
            element.items = JSON.parse(element.items);
          }
          element.pickup_date = moment(element.pickup_date).format('LL');
          element.delivery_date = moment(element.delivery_date).format('LL');
          if (element.status == 0 || element.status == 1 || element.status == 3 || element.status == 7) {
            this.newOrders.push(element);
          } else {
            this.oldOrders.push(element);
          }
        });

      }
      if (haveRefresh) {
        event.target.complete();
      }
      console.log(this.newOrders);
    }, error => {
      console.log(error);
      this.dummy = [];
      this.newOrders = [];
      this.oldOrders = [];
      if (haveRefresh) {
        event.target.complete();
      }
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.dummy = [];
      this.newOrders = [];
      this.oldOrders = [];
      if (haveRefresh) {
        event.target.complete();
      }
      this.util.apiErrorHandler(error);
    });
  }

  doRefresh(event: any) {
    console.log(event);
    this.limit = this.limit + 1;
    this.getOrders(event, true);
  }

  openDetails(id: any) {
    const param: NavigationExtras = {
      queryParams: {
        "id": id
      }
    };
    this.util.navigateToPage('history-details', param);
  }

  ngOnInit() {
  }

  segmentChanged(event: any) {

  }

}
