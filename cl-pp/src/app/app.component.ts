import { Component, OnInit } from '@angular/core';
import { data } from './datalog';
import Chart from 'chart.js';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  name = 'Cole Parmer Product Alarm Report';

  public items: any;
  public s1arr: any;
  public s2arr: any;
  public reportarray: any;

  ngOnInit() {
    this.items = data;

    var mainstartTime = this.items.startTime;
    var mainEndTime = this.items.endTime;

    var sensor1Min = 0;
    var sensor1Max = 0;

    var sensor2Min = 0;
    var sensor2Max = 0;

    var temparr1 = [];
    var temparr2 = [];

    var chartuploadDataTime = [];
    var chartuploadData = [];

    var tripSettings = this.items.tripSettings.forEach(tripsetting => {
      if (tripsetting.channelName == "sensor1") {
        sensor1Min = tripsetting.min;
        sensor1Max = tripsetting.max;
      }
      if (tripsetting.channelName == "sensor2") {
        sensor2Min = tripsetting.min;
        sensor2Max = tripsetting.max;
      }
    });

    temparr1.push({
      channel: "sensor1",
      eventType: "",
      timestamp: mainstartTime,
      data: 0,
      min: sensor1Min,
      max: sensor1Max,
      dataType: "humidity"
    });
    temparr1.push({
      channel: "sensor1",
      eventType: "",
      timestamp: mainEndTime,
      data: 0,
      min: sensor1Min,
      max: sensor1Max,
      dataType: "humidity"
    });

    temparr2.push({
      channel: "sensor2",
      eventType: "",
      timestamp: mainstartTime,
      data: 0,
      min: sensor1Min,
      max: sensor1Max,
      dataType: "temprature"
    });
    temparr2.push({
      channel: "sensor2",
      eventType: "",
      timestamp: mainEndTime,
      data: 0,
      min: sensor1Min,
      max: sensor1Max,
      dataType: "temprature"
    });

    var uploadEvents = this.items.tripUploadEvents.forEach((item, index) => {
      if (item.channel == "sensor1") {
        temparr1.push({
          channel: item.channel,
          eventType: item.eventTypeName,
          timestamp: item.timestamp,
          data: item.alarmData,
          min: sensor1Min,
          max: sensor1Max,
          dataType: "humidity"
        });
      }
      if (item.channel == "sensor2") {
        temparr2.push({
          channel: item.channel,
          eventType: item.eventTypeName,
          timestamp: item.timestamp,
          data: item.alarmData,
          min: sensor2Min,
          max: sensor2Max,
          dataType: "temprature"
        });
      }
      chartuploadDataTime.push(item.timestamp);
      chartuploadData.push(item.alarmData);
    });

    var uploadData = this.items.tripUploadData.forEach(item => {
      if (item.channel == "sensor1") {
        temparr1.push({
          channel: item.channel,
          eventType: "",
          timestamp: item.timestamp,
          data: item.data,
          min: sensor1Min,
          max: sensor1Max,
          dataType: "humidity"
        });
      }
      if (item.channel == "sensor2") {
        temparr2.push({
          channel: item.channel,
          eventType: "",
          timestamp: item.timestamp,
          data: item.data,
          min: sensor2Min,
          max: sensor2Max,
          dataType: "temprature"
        });
      }
      chartuploadDataTime.push(item.timestamp);
      chartuploadData.push(item.data);
    });
    this.s1arr = temparr1;
    this.s2arr = temparr2;

    this.sortdata("timestamp");

    

    this.s1arr.forEach((item, index) => {
      if (index < (this.s1arr.length - 1)) {
        if (item.data < item.max) {
          if (this.s1arr[index + 1].data > this.s1arr[index + 1].max) {
            item["eventType"] = "MaxAlarmIn";
          }
        }
        if (item.data > item.max) {
          if (this.s1arr[index + 1].data < this.s1arr[index + 1].max) {
            item["eventType"] = "MaxAlarmOut";
          }
        }
      }
    });
    this.s2arr.forEach((item, index) => {
      if (index < (this.s2arr.length - 1)) {
        if (item.data < item.max) {
          if (this.s2arr[index + 1].data > this.s2arr[index + 1].max) {
            item["eventType"] = "MaxAlarmIn";
          }
        }
        if (item.data > item.max) {
          if (this.s2arr[index + 1].data < this.s2arr[index + 1].max) {
            item["eventType"] = "MaxAlarmOut";
          }
        }
      }
    });

    var calculateTimestamp = 0;
    var alarmInTime = 0;
    var calarr = [];
    var chartdata = [];
    var charttime = [];

    this.s2arr.forEach((item, index) => {
      var alarmreset = true;
      var flag = 0;
      var time = "";
    
      if (item.eventType == "MaxAlarmIn" || item.eventType == "MaxAlarmOut" || flag == 1) {
        flag = 1;
        if (item.eventType == "MaxAlarmIn") {
          alarmInTime = item.timestamp;
          calarr.push({
            channel: item.channel,
            data: item.data,
            min: item.min,
            max: item.max,
            alarmouttime: "",
            dataType: item.dataType,
            eventType: item.eventType,
            timestamp: item.timestamp
          });
          charttime.push(item.timestamp);
          chartdata.push(item.data);
        }
        if (item.eventType == "MaxAlarmOut") {
          flag = 0;
          var alarmouttime = ((new Date(alarmInTime).getTime() - new Date(item.timestamp).getTime()) / 1000);
          calculateTimestamp = calculateTimestamp + alarmouttime;
          calarr.push({
            channel: item.channel,
            data: item.data,
            min: item.min,
            max: item.max,
            alarmouttime: alarmouttime + " seconds",
            dataType: item.dataType,
            eventType: item.eventType,
            timestamp: item.timestamp
          });
          charttime.push(item.timestamp);
          chartdata.push(item.data);
          alarmInTime = 0;
        }
        else {
         
        }
       
      }
    });
    this.reportarray = calarr;
    console.log(calarr);
    this.setChart(charttime, chartdata, chartuploadDataTime, chartuploadData);
  }
  sortdata(property: string) {
    this.s1arr.sort((a, b) => b[property].toLowerCase() !== a[property].toLowerCase() ? b[property].toLowerCase() < a[property].toLowerCase() ? -1 : 1 : 0);
    this.s2arr.sort((a, b) => b[property].toLowerCase() !== a[property].toLowerCase() ? b[property].toLowerCase() < a[property].toLowerCase() ? -1 : 1 : 0);
  }

  setChart(charttime, chartdata, uploadDataTime, uploadData) {
    var ctx = document.getElementById('myChart');
    var ctx2 = document.getElementById('myChart2');
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: charttime, 
        datasets: [{
          label: 'temprature',
          data: chartdata, 
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
    var myChart2 = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: uploadDataTime,
        datasets: [{
          label: 'temprature',
          data: uploadData,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }
}


//if (index == 0) {
//  if (event.channel == "sensor1") {
//    sensor1eventTimeStampCal = event.timestamp;
//  }
//  if (event.channel == "sensor2") {
//    sensor2eventTimeStampCal = event.timestamp;
//  }
//}
//else {
//  if (event.channel == "sensor1") {
//    sensor1eventTimeStampCal = new Date(sensor1eventTimeStampCal).valueOf() - new Date(event.timestamp).valueOf();
//  }
//  if (event.channel == "sensor2") {
//    sensor2eventTimeStampCal = new Date(sensor1eventTimeStampCal).getTime() - new Date(event.timestamp).getTime();
//    console.log(sensor2eventTimeStampCal / 1000);
//  }
//}
