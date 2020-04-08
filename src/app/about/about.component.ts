import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { concat, fromEvent, interval, noop, observable, Observable, of, timer, merge, Subject, from, BehaviorSubject, AsyncSubject, ReplaySubject } from 'rxjs';
import { delayWhen, filter, map, take, timeout } from 'rxjs/operators';
import { createHttpObservable } from '../common/util';


@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {

    //----1.SUBJECT-------------
    //we can create observables using 'Observable.Create','frompromise','of',... direclty from source.if some of this methods cannot easy trasform a sourece to observable or if we are doing multicasting of one value to multiple separate observable consumers >> then use notion of SUBJECT
    //SUBJECT is at the sametime an observer and observable.

    ngOnInit() {
        //----------------2.subject-------------------
        /*const subject = new Subject();

        //subject have same methods as observer to directly emit values >>  subject.next();subject.error();subject.complete();
        //and also we have subject.pipe()  method  that we use for obervable to combine it with other observables.so SUBJECT is both observable and observer
        //subject is ment to be private to the part of the application that is emmitting a given set of data
        //SUBJECT is a very convenient way to create custom observable,but there is way to implement unsubscribe like in Observable.create.also there is a risk of sharing the subject so that others may call .next()  .error() on subject
        const series1$ = subject.asObservable();//this is to derive observable from subject.so series1$ is emmiting values from the SUBJECT
        series1$.subscribe(console.log);//series1$ can be shared with other parts of application because it dont have .next(),.error(),.complete()    

        subject.next(1);
        subject.next(2);
        subject.next(3);
        subject.complete()*/

        /*below are preferred ways to create observables.if not use subject
        fromPromise();//derive observable from promise
        from(document,'keyup')//derive observable from browser event
        */

        //SUBJECTS ARE USED FOR MULTICASTING>> EX:we want to take 1 vale from 1 observable stream and reemmit that into multiple separate output streams

        //------------3.SUBJECT dont allow late subscription-----------
        /* const subject = new Subject();
         const series$ = subject.asObservable();
         series$.subscribe(val => console.log('early subscription: ' + val));
         subject.next(1);
         subject.next(2);
         subject.next(3);//this values are not received by late subscription beacuse it is emmited before late subscription.
         
         setTimeout(() => {
             series$.subscribe(val => console.log('late subscription: ' + val));
             subject.next(4);//this value is received by both early and late subscriptions
         }, 3000);
         //But in asynchronous programming if we got response from backend we need to supply that data to the late subscribes also.this is not possible with Subject().so use BehaviourSubject()
         */

        //--------------------4.BEHAVIOUR SUBJECT allows late subscriptions-------goal is to always provide something to the subscribers ----
        /*const subject2 = new BehaviorSubject(0);
        const series2$ = subject2.asObservable();
        series2$.subscribe(val => console.log('early subscription: ' + val));
        subject2.next(1);
        subject2.next(2);
        subject2.next(3);
        ////subject2.complete();//if we complete subject before late subscription then late subscription wont get any value.else late subscription will get last emmited value.
        setTimeout(() => {
            series2$.subscribe(val => console.log('late subscription: ' + val));
            subject2.next(4);
        }, 3000);*/

        //--------------------5.ASYNC SUBJECT-------Async Subject will wait for Observable completion before emmitting values to multiple subscribers.the value emmitted will be the last value------------
        /*const subject3 = new AsyncSubject();
        const series3$ = subject3.asObservable();
        series3$.subscribe(val => console.log('first subscription: ' + val));//even though it subscribed early , it wont return intermediate values (1,2). it will only get the value before completion which is 3 here
        subject3.next(1);
        subject3.next(2);
        subject3.next(3);
        subject3.complete();//if we comment .complete() then no value will be consoled by the subscriber.so completion is essential before emmitting final result of the long running calculation
        setTimeout(() => {
            series3$.subscribe(val => console.log('second (or late) subscription: ' + val));//both early and late subscription gets the last value.so ASYNC SUBJECT is ideal for long running calculation where we need only last value
            subject3.next(4);
        }, 3000);*/

        //----------6.REPLAY SUBJECT----------------it will replay complete observable (not only the last value) to all late subscribers
        const subject4 = new ReplaySubject();
        const series4$ = subject4.asObservable();
        series4$.subscribe(val => console.log('first subscription: ' + val));
        subject4.next(1);
        subject4.next(2);
        subject4.next(3);
        //REPLAY SUBJECT is not linked with observable completion to get all values to late subscribers, so we dont have to wait for completion.so no need of subject4.complete();
        setTimeout(() => {
            series4$.subscribe(val => console.log('second (or late) subscription: ' + val));
            subject4.next(4);//both subscribers will get this like any other subject
        }, 3000);




    }
}






