import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-search',
  templateUrl: './search.page.html',
  styleUrls: ['./search.page.scss'],
})
export class SearchPage implements OnInit {
  searchContent: any = '';
  list: any[] = [];
  distanceType: any = '';
  constructor(
    private modalCrtl: ModalController,
    public util: UtilService,
    public api: ApiService
  ) { }

  ngOnInit() {
  }

  onClose() {
    this.modalCrtl.dismiss();
  }

  onSearchChange(event: any) {
    console.log(event);
    if (event && event.detail && event.detail.value && event.detail.value != '') {
      const uid = localStorage.getItem('uid') && localStorage.getItem('uid') != null && localStorage.getItem('uid') != 'null' ? localStorage.getItem('uid') : 'NA';
      const param = {
        "param": event.detail.value,
        "lat": localStorage.getItem('lat'),
        "lng": localStorage.getItem('lng'),
        "uid": uid
      };
      this.api.get_public('v1/freelancer/searchResult?' + this.api.JSON_to_URLEncoded(param)).then((data: any) => {
        console.log(data);
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
        this.util.apiErrorHandler(error);
      }).catch((error: any) => {
        console.log(error);
        this.list = [];
        this.util.apiErrorHandler(error);
      });
    } else {
      this.list = [];
    }
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

  getService(id: any) {
    this.modalCrtl.dismiss();
    const param: NavigationExtras = {
      queryParams: {
        "id": id
      }
    };
    this.util.navigateToPage('services', param);
  }

}
