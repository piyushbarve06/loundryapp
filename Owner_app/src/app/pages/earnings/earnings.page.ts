import { Component, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartDataset } from 'chart.js';
import * as moment from 'moment';
import { ApiService } from 'src/app/services/api.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-earnings',
  templateUrl: './earnings.page.html',
  styleUrls: ['./earnings.page.scss'],
})
export class EarningsPage implements OnInit {
  currentStat: any = 'daily';
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartPlugins = [];
  public barChartLegend = false;
  public barChartType: ChartType = 'bar';
  public barChartDataMonths: ChartDataset[] = [
    { data: [], label: this.util.translate('Monthly Orders'), borderColor: 'rgb(54, 162, 235)', tension: 0.1, fill: true, backgroundColor: 'rgb(54, 162, 235)' }
  ];
  public barChartLabelsMonths: string[] = [];

  public barChartDataDaily: ChartDataset[] = [
    { data: [], label: this.util.translate('Daily Orders'), borderColor: 'rgb(54, 162, 235)', tension: 0.1, fill: true, backgroundColor: 'rgb(54, 162, 235)' }
  ];
  public barChartLabelsDaily: string[] = [];

  public barChartDataAll: ChartDataset[] = [
    { data: [], label: this.util.translate('All Orders'), borderColor: 'rgb(54, 162, 235)', tension: 0.1, fill: true, backgroundColor: 'rgb(54, 162, 235)' }
  ];
  public barChartLabelsAll: string[] = [];


  public months: any[] = [];
  public monthName: any = '';
  public pickerYear: any = '';

  dailyAPICalled: boolean = false;
  allAPICalled: boolean = false;
  yearlyAPICalled: boolean = false;

  totalPrice: any = 0;
  averagePrice: any = 0;

  allTotalPrice: any = 0;
  allAveratePrice: any = 0;

  yearlyTotalPrice: any = 0;
  yearlyAveragePrice: any = 0;

  earningList: any[] = [];
  yearlyEarningList: any[] = [];
  allEarningList: any[] = [];

  currenyYear: any = '';
  constructor(
    public util: UtilService,
    public api: ApiService
  ) {
    this.pickerYear = parseInt(moment().format('YYYY'));
    this.monthName = parseInt(moment().format('M'));

    this.currenyYear = parseInt(moment().format('YYYY'));
    console.log(this.monthName);
    this.generateRowOfMonths(0, 11);
    console.log(this.months);
    this.getStats();
  }

  generateRowOfMonths(from: any, to: any) {
    this.months = [];
    for (let i = from; i <= to; i++) {
      const dateTime = new Date(parseInt(this.pickerYear), i, 1);
      this.months.push(moment(dateTime).format('MMMM YYYY'))
    }
  }

  ngOnInit() {
  }

  getStats() {
    console.log('get status');
    console.log(this.monthName);
    console.log(this.pickerYear);
    const param = { 'id': localStorage.getItem('uid'), "month": this.monthName, "year": this.pickerYear };
    this.dailyAPICalled = false;
    this.barChartDataDaily[0].data = [];
    this.barChartLabelsDaily = [];
    this.totalPrice = 0;
    this.averagePrice = 0;
    this.earningList = [];
    this.api.post_private('v1/orders/getStats', param).then((data: any) => {
      console.log(data);
      this.dailyAPICalled = true;
      if (data && data.status && data.status == 200) {
        const chart = data.chart;
        console.log(chart);
        if (chart && chart['data'] && chart['label']) {
          this.barChartDataDaily[0].data = chart['data'];
          this.barChartLabelsDaily = chart['label'];
          const total = chart['total'];
          this.totalPrice = total.reduce(function (prev: any, curr: any) {
            return (Number(prev) || 0) + (Number(curr) || 0);
          });

          this.averagePrice = (this.totalPrice / total.length).toFixed(2);
          console.log(this.totalPrice, this.averagePrice);
        }
        this.earningList = data.data;
        console.log(this.earningList);
      }
    }, error => {
      console.log(error);
      this.dailyAPICalled = true;
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.dailyAPICalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  getMonthsStats() {
    const param = { 'id': localStorage.getItem('uid'), "year": this.currenyYear };
    this.yearlyAPICalled = false;
    this.barChartDataMonths[0].data = [];
    this.barChartLabelsMonths = [];
    this.yearlyTotalPrice = 0;
    this.yearlyAveragePrice = 0;
    this.api.post_private('v1/orders/getMonthsStats', param).then((data: any) => {
      this.yearlyAPICalled = true;
      console.log(data);
      if (data && data.status && data.status == 200) {
        const chart = data.chart;
        console.log(chart);
        if (chart && chart['data'] && chart['label']) {
          this.barChartDataMonths[0].data = chart['data'];
          this.barChartLabelsMonths = chart['label'];
          const total = chart['total'];
          this.yearlyTotalPrice = total.reduce(function (prev: any, curr: any) {
            return (Number(prev) || 0) + (Number(curr) || 0);
          });

          this.yearlyAveragePrice = (this.yearlyTotalPrice / total.length).toFixed(2);
          console.log(this.yearlyTotalPrice, this.yearlyAveragePrice);
        }
        this.yearlyEarningList = data.data;
        console.log(this.yearlyEarningList);
      }
    }, error => {
      console.log(error);
      this.yearlyAPICalled = true;
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.yearlyAPICalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  getAllStats() {
    this.allAPICalled = false;
    this.allAveratePrice = 0;
    this.allTotalPrice = 0;
    this.allEarningList = [];
    this.barChartDataAll[0].data = [];
    this.barChartLabelsAll = [];
    this.api.post_private('v1/orders/getAllStats', { "id": localStorage.getItem('uid') }).then((data: any) => {
      console.log(data);
      this.allAPICalled = true;
      if (data && data.status && data.status == 200) {
        const chart = data.chart;
        console.log(chart);
        if (chart && chart['data'] && chart['label']) {
          this.barChartDataAll[0].data = chart['data'];
          this.barChartLabelsAll = chart['label'];
          const total = chart['total'];
          this.allTotalPrice = total.reduce(function (prev: any, curr: any) {
            return (Number(prev) || 0) + (Number(curr) || 0);
          });

          this.allAveratePrice = (this.allTotalPrice / total.length).toFixed(2);
          console.log(this.allTotalPrice, this.allAveratePrice);
        }
        this.allEarningList = data.data;
        console.log(this.allEarningList);
      }
    }, error => {
      console.log(error);
      this.allAPICalled = true;
      this.util.apiErrorHandler(error);
    }).catch((error: any) => {
      console.log(error);
      this.allAPICalled = true;
      this.util.apiErrorHandler(error);
    });
  }

  segmentChanged(event: any) {
    console.log(this.currentStat);
    this.pickerYear = parseInt(moment().format('YYYY'));
    this.monthName = parseInt(moment().format('M'));
    if (this.currentStat == 'daily') {
      this.getStats();
    } else if (this.currentStat == 'monthly') {
      this.getMonthsStats();
    } else if (this.currentStat == 'yearly') {
      this.getAllStats();
    }
  }

  getName() {
    return this.months[this.monthName - 1];
  }

  backMonth() {
    console.log(this.monthName);
    if (this.monthName > 1) {
      this.monthName = this.monthName - 1;
    } else {
      console.log('prev month');
      this.pickerYear = this.pickerYear - 1;
      this.monthName = this.monthName = 12;
      this.generateRowOfMonths(0, 11);
    }
    this.getStats();
  }

  nextMonth() {
    console.log(this.monthName);
    if (this.monthName == 12) {
      console.log('next year');
      this.pickerYear = this.pickerYear + 1;
      this.monthName = this.monthName = 1;
      this.generateRowOfMonths(0, 11);
    } else {
      this.monthName = this.monthName + 1;
    }
    this.getStats();
  }

  getDateTime(date: any) {
    return moment(date).format('dddd,DD');
  }

  backYear() {
    this.currenyYear = this.currenyYear - 1;
    this.getMonthsStats();
  }

  nextYear() {
    this.currenyYear = this.currenyYear + 1;
    this.getMonthsStats();
  }

  getMonthName(month: any) {
    const dateTime = new Date(1997, month, 1);
    return moment(dateTime).format('MMMM');
  }

}
