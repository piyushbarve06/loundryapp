import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.page.html',
  styleUrls: ['./categories.page.scss'],
})
export class CategoriesPage implements OnInit {
  categories: any[] = [];
  dummyCate: any[] = [];
  cateId: any = '';
  cateName: any = '';
  dummy: any[] = [];
  constructor(
    private modalController: ModalController,
    public util: UtilService,
    public api: ApiService,
    private navParam: NavParams
  ) {
    this.cateId = this.navParam.get('id');
    console.log(this.cateId);
    this.getCategories();
  }

  ngOnInit() {
  }

  getCategories() {
    this.dummy = Array(10);
    this.api.post_private('v1/categories/storesList', { "id": localStorage.getItem("uid") }).then((data: any) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.data) {
        this.categories = data.data;
        this.dummyCate = data.data;
        if (this.categories.length > 0 && this.cateId == '') {
          this.cateId = this.categories[0].id;
        }
      }
    }, error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.dummy = [];
      this.util.apiErrorHandler(error);
    });
  }

  selected() {
    const name = this.categories.filter(x => x.id == this.cateId);
    console.log('name', name);
    this.modalController.dismiss({ id: this.cateId, name: name[0].name }, 'selected');
  }

  onSearchChange(event: any) {
    console.log(event.detail.value);
    this.categories = this.dummyCate.filter((ele: any) => {
      return ele.name.toLowerCase().includes(event.detail.value.toLowerCase());
    });
  }

  close() {
    this.modalController.dismiss('cancel', 'cancel');
  }

}
