import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilService } from 'src/app/services/util.service';
import { ApiService } from 'src/app/services/api.service';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular';

@Component({
  selector: 'app-inbox',
  templateUrl: './inbox.page.html',
  styleUrls: ['./inbox.page.scss'],
})
export class InboxPage implements OnInit {
  @ViewChild(IonContent, { read: IonContent, static: false }) myContent: IonContent;
  receiverId: any = '';
  receiverName: any = '';
  uid: any = '';
  roomId: any = '';
  apiCalled: boolean = false;
  interval: any;

  message: any = '';
  messageList: any[] = [];
  yourMessage: boolean = false;
  constructor(
    public util: UtilService,
    public api: ApiService,
    public route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((data: any) => {
      console.log(data);
      if (data && data.name && data.id) {
        this.receiverId = data.id;
        this.receiverName = data.name;
        this.uid = localStorage.getItem('uid');
        console.log(this.receiverId, this.receiverName, this.uid);
        this.getChatRooms();
      }
    });
  }

  getChatRooms() {
    const param = {
      "sender_id": this.uid,
      "receiver_id": this.receiverId
    }
    this.apiCalled = false;
    this.api.post_private('v1/chats/getChatRooms', param).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200) {
        const data1 = data.data;
        const data2 = data.data2;
        if (data1 && data1 != null && data1.id) {
          this.apiCalled = true;
          this.roomId = data1.id;
          this.getChatList();
          this.interval = setInterval(() => {
            console.log('calling in interval');
            this.getChatList();
          }, 12000);
        } else if (data2 && data2 != null && data2.id) {
          this.apiCalled = true;
          this.roomId = data2.id;
          this.getChatList();
          this.interval = setInterval(() => {
            console.log('calling in interval');
            this.getChatList();
          }, 12000);
        } else {
          this.apiCalled = true;
          this.util.errorToast('Something went wrong', 'danger');
        }
      }
    }, error => {
      console.log(error);
      this.createChatRooms();
    }).catch((error: any) => {
      console.log(error);
      this.createChatRooms();
    });
  }

  createChatRooms() {
    const param = { 'sender_id': this.uid, 'receiver_id': this.receiverId, 'status': 1 };
    this.api.post_private('v1/chats/createChatRooms', param).then((data: any) => {
      console.log(data);
      if (data && data.status && data.status == 200 && data.data) {
        this.roomId = data.data.id;
        this.getChatList();
        this.interval = setInterval(() => {
          console.log('calling in interval');
          this.getChatList();
        }, 12000);
      } else {
        this.apiCalled = true;
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

  getChatList(event?: any) {
    this.api.post_private('v1/chats/getById', { "room_id": this.roomId }).then((data: any) => {
      console.log(data);
      if (event) {
        event.target.complete();
      }
      this.apiCalled = true;
      if (data && data.status && data.status == 200) {
        this.messageList = data.data;
      }
    }, error => {
      console.log(error);
      if (event) {
        event.target.complete();
      }
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      if (event) {
        event.target.complete();
      }
      this.apiCalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  ngOnInit() {
  }

  ionViewWillLeave() {
    console.log('will leave');
    clearInterval(this.interval);
  }

  ionViewDidLeave() {
    console.log('did leave');
    clearInterval(this.interval);
  }

  onBack() {
    this.util.onBack();
  }


  sendMessage() {
    console.log(this.message);
    if (!this.message || this.message === '') {
      return false;
    }
    const msg = this.message;
    this.message = '';
    const param = {
      'room_id': this.roomId,
      'uid': this.uid,
      'sender_id': this.uid,
      'message': msg,
      'message_type': 0,
      'reported': 0,
      'status': 1,
    };
    this.myContent.scrollToBottom(300);
    this.yourMessage = false;
    this.api.post_private('v1/chats/sendMessage', param).then((data: any) => {
      console.log(data);
      this.yourMessage = true;
      if (data && data.status == 200) {
        this.getChatList();
      } else {
        this.yourMessage = true;
      }
    }, error => {
      console.log(error);
      this.yourMessage = true;
      this.util.apiErrorHandler(error);
    }).catch(error => {
      console.log(error);
      this.yourMessage = true;
      this.util.apiErrorHandler(error);
    });
  }

}
