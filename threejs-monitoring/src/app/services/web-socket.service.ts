import { Injectable } from "@angular/core";
import { io } from "socket.io-client";
import { Observable } from "rxjs";
// import * as Rx from "rxjs/Rx";
// import { environment } from "src/environments/environment";

@Injectable({
    providedIn: "root"
})

export class WebSocketService {

    socket: any;
    readonly socketServerId: string = "https://localhost:3000";


    constructor(){
        this.socket = io(this.socketServerId);
    }

    // connect(): Rx.Subject<MessageEvent>{
    //     this.socket = io(environment.ws_url);

    //     let observable = new Observable((observer) => {
    //         this.socket.on("message", (data) => {
    //             console.log("received a message");
    //             observer.next(data)
    //         });
    //         return () => {
    //             this.socket.disconnect();
    //         }
    //     });

    //     let observer = {
    //         next: (data: Object) => {
    //             this.socket.emit("message", JSON.stringify(data));
    //         }
    //     }

    //     return Rx.Subject.create(observer, observable);


    // }

    listen(eventName: string){
        return new Observable((subscriber) => {
            this.socket.on(eventName, (data) => {
                subscriber.next(data);
            })
        });
    }

    emit(eventName: string, data: any){
        this.socket.emit(eventName, data);
    }
}