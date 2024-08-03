import { Component, OnInit } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { NavigationExtras } from '@angular/router';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.page.html',
  styleUrls: ['./chats.page.scss'],
})
export class ChatsPage implements OnInit {
  apiCalled: boolean = false;
  chatList: any[] = [];
  uid: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService,
  ) {
    this.uid = localStorage.getItem('uid');
    this.getChatList();

  }

  getChatList() {
    this.api.post_private('v1/chats/getChatListBUid', { "id": localStorage.getItem('uid') }).then((data: any) => {
      console.log(data);
      this.apiCalled = true;
      if (data && data.status && data.status == 200 && data.data) {
        this.chatList = data.data;
      }
    }, error => {
      console.log(error);
      this.apiCalled = false;
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.apiCalled = false;
      this.util.apiErrorHandler(error);
    });
  }

  openChat(uid: any, name: any) {
    console.log(uid, name);
    const param: NavigationExtras = {
      queryParams: {
        "id": uid,
        "name": name
      }
    };
    this.util.navigateToPage('inbox', param);
  }

  ngOnInit() {
  }

}
