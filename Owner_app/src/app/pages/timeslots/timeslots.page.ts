import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { NavigationExtras } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-timeslots',
  templateUrl: './timeslots.page.html',
  styleUrls: ['./timeslots.page.scss'],
})
export class TimeslotsPage implements OnInit {
  dayList: any[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  apiCalled: boolean = false;
  list: any[] = [];
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.getSlots();
    this.util.subscribeSlot().subscribe((data: any) => {
      this.getSlots();
    });
  }

  getSlots() {
    this.apiCalled = false;
    this.list = [];
    this.api.post_private('v1/timeslots/getByUid', { "id": localStorage.getItem('uid') }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        data.data.forEach((element: any) => {
          if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(element.slots)) {
            element.slots = JSON.parse(element.slots);
          }
        });
        this.list = data.data;
        console.log(this.list);
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

  addNew() {
    this.util.navigateToPage('add-timeslots');
  }

  deleteSlot(index: any, item: any) {
    console.log(index);
    console.log(item);
    console.log(this.list[index]);
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
        this.list[index].slots = this.list[index].slots.filter((x: any) => x != item);
        console.log(this.list);
        const param = {
          "id": this.list[index].id,
          "week_id": this.list[index].week_id,
          "slots": JSON.stringify(this.list[index].slots)
        };
        this.util.show();
        this.api.post_private('v1/timeslots/update', param).then((data: any) => {
          console.log(data);
          this.util.hide();
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

  onEditSlot(index: any) {
    console.log(index);
    const param: NavigationExtras = {
      queryParams: {
        "id": this.list[index].id
      }
    };
    this.util.navigateToPage('add-timeslots', param);
  }

  onDestroySlot(index: any) {
    console.log(index);
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
        this.util.show();
        this.api.post_private('v1/timeslots/destroy', { "id": this.list[index].id }).then((data: any) => {
          console.log(data);
          this.util.hide();
          this.getSlots();
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
}
