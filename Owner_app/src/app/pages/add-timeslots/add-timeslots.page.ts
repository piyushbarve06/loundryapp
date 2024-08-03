import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';

@Component({
  selector: 'app-add-timeslots',
  templateUrl: './add-timeslots.page.html',
  styleUrls: ['./add-timeslots.page.scss'],
})
export class AddTimeslotsPage implements OnInit {
  day: any = '';
  dayList: any[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  openTime: any = '';
  closeTime: any = '';

  slots: any[] = [];
  slotId: any = '';
  action: any = 'new';
  constructor(
    public util: UtilService,
    public api: ApiService,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.id) {
        this.slotId = data.id;
        console.log(this.slotId);
        this.action = 'update';
        this.getSlotInfo();
      }
    });
  }

  getSlotInfo() {
    this.util.show();
    this.api.post_private('v1/timeslots/getById', { "id": this.slotId }).then((data: any) => {
      console.log(data);
      this.util.hide();
      if (data && data.status && data.status == 200 && data.data) {
        const info = data.data;
        this.day = this.dayList[info.week_id];
        if (((x) => { try { JSON.parse(x); return true; } catch (e) { return false } })(info.slots)) {
          this.slots = JSON.parse(info.slots);
        }
      }
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

  ngOnInit() {
  }

  addSlot() {
    console.log(this.day);
    console.log(this.openTime);
    console.log(this.closeTime);
    if (this.day == '' || this.day == null || this.openTime == '' || this.closeTime == '') {
      this.util.errorToast('All fields are required');
      return false;
    }
    const openTime = moment('1997-07-15' + ' ' + this.openTime).format('hh:mm A');
    const closeTime = moment('1997-07-15' + ' ' + this.closeTime).format('hh:mm A');
    console.log(openTime);
    console.log(closeTime);
    const isExist = this.slots.filter(x => x.start_time == openTime && x.end_time == closeTime);
    console.log(isExist);
    if (isExist && isExist.length > 0) {
      this.util.errorToast('Already exist', 'danger');
      return false;
    }
    const body = {
      "start_time": openTime,
      "end_time": closeTime,
    };
    this.slots.push(body);
    this.openTime = '';
    this.closeTime = '';
    console.log(this.slots);
  }

  removeSlot(item: any) {
    this.slots = this.slots.filter(x => x != item);
    console.log(this.slots);
  }

  onSave() {
    if (this.day == '' || this.day == null) {
      this.util.errorToast('Day Name Missing', 'danger');
      return false;
    }
    if (this.slots.length == 0) {
      this.util.errorToast('Slots are empty', 'danger');
      return false;
    }
    const param = {
      "uid": localStorage.getItem('uid'),
      "week_id": this.dayList.indexOf(this.day),
      "slots": JSON.stringify(this.slots)
    };
    console.log(param);
    this.util.show();
    this.api.post_private('v1/timeslots/create', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.util.onUpdateSlot();
      this.util.onBack();
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

  onUpdate() {
    if (this.day == '' || this.day == null) {
      this.util.errorToast('Day Name Missing', 'danger');
      return false;
    }
    if (this.slots.length == 0) {
      this.util.errorToast('Slots are empty', 'danger');
      return false;
    }
    const param = {
      "id": this.slotId,
      "week_id": this.dayList.indexOf(this.day),
      "slots": JSON.stringify(this.slots)
    };
    console.log(param);
    this.util.show();
    this.api.post_private('v1/timeslots/update', param).then((data: any) => {
      console.log(data);
      this.util.hide();
      this.util.onUpdateSlot();
      this.util.onBack();
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

  onBack() {
    this.util.onBack();
  }

}
