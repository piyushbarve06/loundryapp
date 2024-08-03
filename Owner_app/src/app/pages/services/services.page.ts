import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';
import Swal from 'sweetalert2';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-services',
  templateUrl: './services.page.html',
  styleUrls: ['./services.page.scss'],
})
export class ServicesPage implements OnInit {
  cateId: any = '';
  apiCalled: boolean = false;
  servicesCalled: boolean = false;
  categories: any[] = [];
  services: any[] = [];
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getCategories();
    this.util.onServiceChanged().subscribe(() => {
      this.getCategories();
    });
  }

  ngOnInit() {
  }

  getCategories() {
    this.apiCalled = false;
    this.api.post_private('v1/categories/storesList', { "id": localStorage.getItem("uid") }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        this.categories = data.data;
        if (this.categories.length > 0) {
          this.cateId = this.categories[0].id;
          this.getItems();
        }
      }
    }, error => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  getItems() {
    this.servicesCalled = false;
    this.api.post_private('v1/services/getListItems', { "id": this.cateId, "uid": localStorage.getItem('uid') }).then((data: any) => {
      this.servicesCalled = true;
      console.log(data);
      if (data && data.status && data.status == 200) {
        // data.data.forEach(element => {
        //   if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.variations)) {
        //     element.variations = JSON.parse(element.variations);
        //   }
        // });
        this.services = data.data;
      }
    }, error => {
      console.log(error);
      this.servicesCalled = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.servicesCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  deleteItem(id: any) {
    Swal.fire({
      title: this.util.translate('Are you sure?'),
      text: this.util.translate('To delete this item?'),
      icon: 'question',
      showConfirmButton: true,
      confirmButtonText: this.util.translate('Yes'),
      showCancelButton: true,
      cancelButtonText: this.util.translate('Cancel'),
      backdrop: false,
      background: 'white'
    }).then((data) => {
      if (data && data.value) {
        console.log('update it');
        this.util.show();
        this.api.post_private('v1/services/destroy', { "id": id }).then((data: any) => {
          console.log(data);
          this.util.hide();
          this.getItems();
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
    });

  }

  onBack() {
    this.util.onBack();
  }

  editService(id: any) {
    const param: NavigationExtras = {
      queryParams: {
        "id": id
      }
    };
    this.util.navigateToPage('new-services', param);
  }

  addNew() {
    this.util.navigateToPage('new-services');
  }

  segmentChanged() {
    console.log(this.cateId);
    this.getItems();
  }
}
