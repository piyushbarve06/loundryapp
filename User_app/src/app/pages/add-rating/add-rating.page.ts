import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'app-add-rating',
  templateUrl: './add-rating.page.html',
  styleUrls: ['./add-rating.page.scss'],
})
export class AddRatingPage implements OnInit {
  to: any = '';
  id: any = '';
  name: any = '';
  items: any[] = [];

  rate: any = 2;
  comment: any = '';

  service_id: any = '';
  rating: any[] = [];
  constructor(
    public util: UtilService,
    public api: ApiService,
    public navParams: NavParams,
    private modalController: ModalController
  ) {
    this.to = this.navParams.get('to');
    this.id = this.navParams.get('id');
    this.name = this.navParams.get('name');
    if (this.to == 'service') {
      this.items = this.navParams.get('items');
    }
    if (this.to == 'store') {
      this.getRating();
    }
    console.log(this.to);
    console.log(this.id);
    console.log(this.name);
    console.log(this.items);
  }

  getRating() {
    this.api.post_private('v1/ratings/getSaveStoreReview', { "id": this.id }).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        this.rating = data.data.map(function (x: any) {
          return parseFloat(x.rate);
        });
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

  close() {
    this.modalController.dismiss('close', 'close');
  }

  onRatingChange(event: any) {
    console.log(event);
    this.rate = event;
  }

  submit() {
    console.log(this.rate);
    console.log(this.comment);
    console.log(this.service_id);
    if (this.comment == '') {
      this.util.errorToast('Please add comments', 'danger');
      return false;
    }
    if (this.to == 'store') {
      console.log('add to store');
      this.rating.push(this.rate);
      const sumOfRatingCount = this.rating.length * 5;
      const sumOfStars = this.rating.reduce((a, b) => parseFloat(a) + parseFloat(b), 0);
      const ratings = ((sumOfStars * 5) / sumOfRatingCount).toFixed(2);
      const param = {
        "uid": localStorage.getItem('uid'),
        "total_rating": this.rating.length,
        "rating": ratings,
        "service_id": 0,
        "store_id": this.id,
        "driver_id": 0,
        "rate": this.rate,
        "msg": this.comment,
        "from": 1
      };
      console.log(param);
      this.util.show('Saving your review');
      this.api.post_private('v1/ratings/saveStoreRatings', param).then((data: any) => {
        console.log(data);
        this.util.hide();
        this.modalController.dismiss('ok', 'ok');
      }, error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      }).catch((error: any) => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
    } else if (this.to == 'service') {
      console.log('add to service');
      if (this.service_id == '') {
        this.util.errorToast('Please select service', 'danger');
        return false;
      }

      const param = {
        "uid": localStorage.getItem('uid'),
        "service_id": this.service_id,
        "store_id": 0,
        "driver_id": 0,
        "rate": this.rate,
        "msg": this.comment,
        "from": 1
      };
      console.log(param);
      this.util.show('Saving your review');
      this.api.post_private('v1/ratings/saveServiceRating', param).then((data: any) => {
        console.log(data);
        this.util.hide();
        this.modalController.dismiss('ok', 'ok');
      }, error => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      }).catch((error: any) => {
        console.log(error);
        this.util.hide();
        this.util.apiErrorHandler(error);
      });
    } else if (this.to == 'driver') {
      console.log('add to driver');
      const param = {
        "uid": localStorage.getItem('uid'),
        "service_id": 0,
        "store_id": 0,
        "driver_id": this.id,
        "rate": this.rate,
        "msg": this.comment,
        "from": 1
      };
      console.log(param);
      this.util.show('Saving your review');
      this.api.post_private('v1/ratings/saveDriversRatings', param).then((data: any) => {
        console.log(data);
        this.util.hide();
        this.modalController.dismiss('ok', 'ok');
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
  }

}
