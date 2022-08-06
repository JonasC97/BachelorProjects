import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';

@Component({
    selector: 'app-landing',
    templateUrl: './landingPage.component.html',
    styleUrls: ['./landingPage.component.css']
})

export class LandingPageComponent implements OnInit, AfterViewInit {

    public domainObjectTypes: string[] = [];
    public ddWidth = "200px";
  
    @ViewChild('domainObjectTypesDropdown')
    domainObjectTypesDropdown!: DropDownListComponent;
  
    ngOnInit(): void {
      // Load all the available DomainObjectTypes
      this.domainObjectTypes = ["sensor", "machine", "door", "forklift", "package"];
      localStorage.setItem("currentDomainObjectType", this.domainObjectTypes[0]);
    }

    ngAfterViewInit(){
      console.log(this.domainObjectTypesDropdown);
      this.domainObjectTypesDropdown.addEventListener("change", (args) => this.onDomainObjectTypeChanged(args));
    }

    onDomainObjectTypeChanged(args){
      if(args.value !== null){
        localStorage.setItem("currentDomainObjectType", args.value);
      }
    }
  
    navigateToEditor(){
      if(this.domainObjectTypesDropdown.value === null){
        return;
      }
      else {
        window.location.href = "editor";
      }
    }
  
    navigateToMonitor(){
      window.location.href = "monitoring";
    }

  }
