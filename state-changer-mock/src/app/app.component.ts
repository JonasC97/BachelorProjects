import { Component, OnInit } from '@angular/core';
import { SendingService } from './SendingService.service';

import { io } from "socket.io-client";
const socket = io("http://localhost:3000");

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  // sendingService: SendingService;

  constructor(){
  }

  title = 'angular-monitoring-server';

  public domainObjectsMock: any[] = [
    {
        text: "Machine 1",
        id: "machine1",
        domainObjectType: "machine",
        propertyDefinitions: [
          {
            propertyName: "State",
            propertyId: "34",
            stateName: "On",
            stateId: "34a",
          },
          {
            propertyName: "Heat",
            propertyId: "35",
            stateName: "[50°, ...]",
            stateId: "35c",
          },
          {
            propertyName: "Position",
            propertyId: "36",
            isPosition: true,
            position: [-2.6,11.5,-3.7]
          }
        ]
    },
    {
        text: "Machine 2",
        id: "machine2",
        domainObjectType: "machine",
        propertyDefinitions: [
          {
            propertyName: "State",
            propertyId: "34",
            stateName: "Off",
            stateId: "34b",
          },
          {
            propertyName: "Heat",
            propertyId: "35",
            stateName: "[..., 20°[",
            stateId: "35a",
          },
          {
            propertyName: "Position",
            propertyId: "36",
            isPosition: true,
            position: [-2.5,18.5,6.8]
          }
        ]
    },        
    {
        text: "Machine 3",
        id: "machine3",
        domainObjectType: "machine",
        propertyDefinitions: [
          {
            propertyName: "State",
            propertyId: "34",
            stateName: "Off",
            stateId: "34b",
          },
          {
            propertyName: "Heat",
            propertyId: "35",
            stateName: "[50°, ...]",
            stateId: "35c",
          },
          {
            propertyName: "Position",
            propertyId: "36",
            isPosition: true,
            position: [6.3,1.5,-1.8]
          }
        ]
    },        
    {
        text: "Machine 4",
        id: "machine4",
        domainObjectType: "machine",
        propertyDefinitions: [
          {
            propertyName: "State",
            propertyId: "34",
            stateName: "Off",
            stateId: "34a",
          },
          {
            propertyName: "Heat",
            propertyId: "35",
            stateName: "[50°, ...]",
            stateId: "35d",
          },
          {
            propertyName: "Position",
            propertyId: "36",
            isPosition: true,
            position: [-9,1.5,-8.5]
          }
        ]
    },
    {
        text: "Sensor 1",
        id: "sensor1",
        domainObjectType: "sensor",
        propertyDefinitions: [
            {
                propertyId: "12",
                propertyName: "Status",
                stateId: "12b",
                stateName: "Okay"
            }
        ]
        
    },
    {
        text: "Sensor 2",
        id: "sensor2",
        domainObjectType: "sensor",
        propertyDefinitions: [
            {
                propertyId: "12",
                propertyName: "Status",
                stateId: "12c",
                stateName: "Kritisch",
            },
            {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [6.3,1.5,-1.8]
            }
        ]
    },
    {
        text: "Forklift 1",
        id: "forklift1",
        domainObjectType: "forklift",
        propertyDefinitions: [
            {
                propertyId: "80",
                propertyName: "efficiency",
                stateId: "80c",
                stateName: "Very Efficient",
            },
            {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [1.7,1.5,7.8]
            }
        ]
    },
    {
        text: "Forklift 2",
        id: "forklift2",
        domainObjectType: "forklift",
        propertyDefinitions: [
            {
                propertyId: "80",
                propertyName: "efficiency",
                stateId: "80b",
                stateName: "Okay",
            },
            {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [1.7,11.5,7.8]
            }
        ]
    },
    {
        text: "Package 1",
        id: "package1",
        domainObjectType: "package",
        propertyDefinitions: [
            {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [1.7,0.5,-7.8]
            }
        ]
    },
    {
        text: "Package 2",
        id: "package2",
        domainObjectType: "package",
        propertyDefinitions: [
            {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [1.7,10.5,-7.8]
            }
        ]
    },
    {
        text: "Package 3",
        id: "package3",
        domainObjectType: "package",
        propertyDefinitions: [
            {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [-1.7,10.5,7.8]
            }
        ]
    },
    {
        text: "Package 4",
        id: "package4",
        domainObjectType: "package",
        propertyDefinitions: [
            {
                propertyName: "Position",
                propertyId: "36",
                isPosition: true,
                position: [-1.7,0.5,7.8]
            }
        ]
    }
];

  
  fields: Object = {
    text: "stateName",
    value: "stateId"
  }


  getDropdownDatasourceFor(type, propId){
    switch(type){
      case "sensor":
        switch(propId){
          case "12":
            return [
              { stateId: "12a", stateName: "Ideal" },
              { stateId: "12b", stateName: "Okay" },
              { stateId: "12c", stateName: "Kritisch" },
          ];
        }
        break;
      case "machine":
        switch(propId){
          case "34":
            return [
            { stateId: "34a", stateName: "On" },
            { stateId: "34b", stateName: "Off" },
          ];
          case "35":
            return [
              { stateId: "35a", stateName: "[..., 20°[" },
              { stateId: "35b", stateName: "[20°, 50°[" },
              { stateId: "35c", stateName: "[50°, ...]" },
          ];
        }
        break;
      case "forklift":
        switch(propId){
          case "80":
            return [
            { stateId: "80a", stateName: "Unefficient" },
            { stateId: "80b", stateName: "Okay" },
            { stateId: "80c", stateName: "Very Efficient" }
          ];
        }
        break;
  
    }    
  }

  onPositionChange(buttonArgs, domainObjectId, domainObjectType){
    // Get the coordinates from the according input fields
    var coordinates = [
      buttonArgs.srcElement.parentElement.querySelector(".x-coordinate-input").value,
      buttonArgs.srcElement.parentElement.querySelector(".y-coordinate-input").value,
      buttonArgs.srcElement.parentElement.querySelector(".z-coordinate-input").value
    ];

    // Prepare the change arguments
    var changeArgs = {
      domainObjectId: domainObjectId,
      domainObjectType: domainObjectType,
      coordinates: coordinates
    };
    
    // Send the change arguments via the server to the monitoring system
    socket.emit("position-change", changeArgs); 
  }

  onSelectionChange(event, domainObjectId, domainObjectType, propertyId, propertyName){
    // Prepare the change arguments    
    var changeArgs = {
      domainObjectId: domainObjectId,
      domainObjectType: domainObjectType,
      propertyId: propertyId,
      propertyName: propertyName,
      stateId: event.itemData.stateId,
      stateName: event.itemData.stateName
    }

    // Send the change arguments via the server to the monitoring system
    socket.emit("change", changeArgs);
  }
}
