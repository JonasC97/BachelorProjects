import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorComponent } from './editor.component';
import { LandingPageComponent } from './landingPage.component';
import { MonitoringComponent } from './monitoring.component';

const routes: Routes = [
  { path: "landing", component: LandingPageComponent },
  { path: "editor", component: EditorComponent },
  { path: "monitoring", component: MonitoringComponent },
  { path: '**', redirectTo: '/landing', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
export const routingComponents = [EditorComponent, MonitoringComponent, LandingPageComponent]
