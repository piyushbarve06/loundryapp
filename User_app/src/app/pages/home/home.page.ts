import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { CartService } from 'src/app/services/cart.service';
import { NavigationExtras } from '@angular/router';
import { SearchPage } from '../search/search.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  addressTitle: any = '';
  apiCalled: boolean = false;
  list: any[] = [];
  distanceType: any = '';
  constructor(
    public util: UtilService,
    private modalController: ModalController,
    public api: ApiService,
    public cart: CartService
  ) {
    this.addressTitle = localStorage.getItem('address');
  }

  ngOnInit() {
    this.getList();
    this.util.subscribeNewAddress().subscribe((data: any) => {
      console.log('New Address Fetched');
      this.getList();
    });
  }

  getList() {
    this.apiCalled = false;
    const uid = localStorage.getItem('uid') && localStorage.getItem('uid') != null && localStorage.getItem('uid') != 'null' ? localStorage.getItem('uid') : 'NA';
    this.api.post_public('v1/freelancer/getStoresList', { "lat": localStorage.getItem('lat'), "lng": localStorage.getItem('lng'), "uid": uid }).then((data: any) => {
      // console.log(data);
      this.list = [];
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data && data.data.length) {
        this.list = data.data;
        this.distanceType = data.distanceType;
        this.list = this.list.sort((a, b) =>
          parseFloat(a.distance) < parseFloat(b.distance) ? -1
            : (parseFloat(a.distance) > parseFloat(b.distance) ? 1 : 0));
        console.log(this.list);
      }
    }, error => {
      console.log(error);
      this.list = [];
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.list = [];
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  findLocation() {
    this.util.navigateRoot('location');
  }

  getService(id: any) {
    const param: NavigationExtras = {
      queryParams: {
        "id": id
      }
    };
    this.util.navigateToPage('services', param);
  }

  async openSearch() {
    const modal = await this.modalController.create({
      component: SearchPage,
      backdropDismiss: false,
    });
    return await modal.present();
  }

  addLike(index: any) {
    console.log(this.list[index]);
    const uid = localStorage.getItem('uid');
    if (uid && uid !== null && uid !== 'null') {
      if (this.list[index].liked == true) {
        console.log('remove like');
        this.util.show();
        this.api.post_private('v1/favourite/deleteLikes', { "uid": localStorage.getItem('uid'), "store_uid": this.list[index].uid, "status": 1 }).then((data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status && data.status == 200) {
            this.list[index].liked = false;
          }
        }, error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        }).catch(error => {
          console.log(error);
          this.util.hide();
          this.util.apiErrorHandler(error);
        });
      } else {
        console.log('add like');
        this.util.show();
        this.api.post_private('v1/favourite/create', { "uid": localStorage.getItem('uid'), "store_uid": this.list[index].uid, "status": 1 }).then((data: any) => {
          console.log(data);
          this.util.hide();
          if (data && data.status && data.status == 200) {
            this.list[index].liked = true;
          }
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
    } else {
      this.util.navigateToPage('/login');
    }

  }

  onCheckout() {
    const uid = localStorage.getItem('uid');
    if (uid && uid !== null && uid !== 'null') {
      this.util.navigateToPage('checkout');
    } else {
      this.util.navigateRoot('login');
    }
  }

}
