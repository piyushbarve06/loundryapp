import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-store-categories',
  templateUrl: './store-categories.page.html',
  styleUrls: ['./store-categories.page.scss'],
})
export class StoreCategoriesPage implements OnInit {
  saveCategories: any[] = [];
  savedCategoriesId: any[] = [];
  apiCalled: boolean = false;
  categories: any[] = [];
  dummyCate: any[] = [];
  constructor(
    private modalController: ModalController,
    private navParam: NavParams,
    public api: ApiService,
    public util: UtilService
  ) {
    this.saveCategories = this.navParam.get('categories');
    this.savedCategoriesId = [...new Set(this.saveCategories.map(item => item.id))];
    console.log(this.saveCategories);
    console.log(this.savedCategoriesId);
    this.getCategories();
  }

  getCategories() {
    this.apiCalled = false;
    this.api.get_public('v1/getActiveCategories/getActive').then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        this.categories = data.data;
        this.dummyCate = data.data;
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

  onSearchChange(event: any) {
    console.log(event.detail.value);
    this.categories = this.dummyCate.filter((ele: any) => {
      return ele.name.toLowerCase().includes(event.detail.value.toLowerCase());
    });
  }

  ngOnInit() {
  }

  checkChange(event: any, id: any) {
    console.log(event);
    if (event && event.detail && event.detail.checked == false) {
      console.log('remove it');
      this.savedCategoriesId = this.savedCategoriesId.filter(x => x != id);
    } else if (event && event.detail && event.detail.checked == true) {
      console.log('add it');
      this.savedCategoriesId.push(id);
    } else {
      console.log('nothing');
    }
  }

  close() {
    this.modalController.dismiss('close', 'close');
  }

  selected() {
    console.log(this.savedCategoriesId);
    let selectedCategories: any[] = [];
    this.categories.forEach((element) => {
      if (this.savedCategoriesId.includes(element.id)) {
        selectedCategories.push(element);
      }
    });
    this.modalController.dismiss(selectedCategories, 'ok');
  }

}
