import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-sub-categories',
  templateUrl: './sub-categories.page.html',
  styleUrls: ['./sub-categories.page.scss'],
})
export class SubCategoriesPage implements OnInit {
  categories: any[] = [];
  dummyCate: any[] = [];
  dummy: any[] = [];
  id: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService,
    private modalController: ModalController,
    private navParams: NavParams
  ) {
    const cateId = this.navParams.get('cateId');
    this.id = this.navParams.get('subId');
    this.getList(cateId);
  }

  getList(id: any) {
    this.dummy = Array(10);
    this.api.post_private('v1/sub_categories/getByCateID', { "id": id }).then((data: any) => {
      console.log(data);
      this.dummy = [];
      if (data && data.status && data.status == 200 && data.data) {
        this.categories = data.data;
        this.dummyCate = data.data;
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

  ngOnInit() {
  }

  close() {
    this.modalController.dismiss('cancel', 'cancel');
  }

  selected() {
    const name = this.categories.filter(x => x.id === this.id);
    console.log('name', name);
    this.modalController.dismiss({ id: this.id, name: name[0].name }, 'selected');
  }

  onSearchChange(event: any) {
    console.log(event.detail.value);
    this.categories = this.dummyCate.filter((ele: any) => {
      return ele.name.toLowerCase().includes(event.detail.value.toLowerCase());
    });
  }

}
