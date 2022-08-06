import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';

import { DropDownListModule } from "@syncfusion/ej2-angular-dropdowns";
import { DialogModule } from "@syncfusion/ej2-angular-popups";
import { CommonModule } from '@angular/common';
import { ColorPickerModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ContextMenuModule } from '@syncfusion/ej2-angular-navigations';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';
@NgModule({
  declarations: [
    AppComponent,
    routingComponents
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    DropDownListModule,
    DialogModule,
    ColorPickerModule,
    ContextMenuModule,
    CheckBoxModule,
    ColorPickerModule,
    TextBoxModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
