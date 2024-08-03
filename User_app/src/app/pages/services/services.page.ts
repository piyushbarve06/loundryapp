import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute, NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit {
  storeId: any = '';
  apiCalled: boolean = false;
  list: any[] = [];
  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.id) {
        this.storeId = data.id;
        this.apiCalled = false;
        this.getCategories();
      }
    });
  }

  getCategories() {
    this.apiCalled = false;
    this.list = [];
    this.api.post_public('v1/categories/storeCategories', { "id": this.storeId }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        this.list = data.data;
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

  onCategories(cateId: any) {
    const param: NavigationExtras = {
      queryParams: {
        "cate_id": cateId,
        "store_id": this.storeId
      }
    };
    this.util.navigateToPage('categories', param);
  }
}
