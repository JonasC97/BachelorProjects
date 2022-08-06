import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
// import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { SelectDropDownModule } from 'ngx-select-dropdown';

import { SocketIoModule, SocketIoConfig } from 'ngx-socket-io';

import { AppComponent } from './app.component';
import { SendingService } from './SendingService.service';

// const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    DropDownListModule,
    // ButtonModule,
    // NumericTextBoxModule
    // SocketIoModule.forRoot(config)
  ],
  providers: [SendingService],
  bootstrap: [AppComponent]
})
export class AppModule { }
