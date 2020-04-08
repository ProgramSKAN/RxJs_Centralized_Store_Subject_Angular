import { Store } from './../common/store.service';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { Course } from "../model/course";
import {
    debounceTime,
    distinctUntilChanged,
    startWith,
    tap,
    delay,
    map,
    concatMap,
    switchMap,
    withLatestFrom,
    concatAll, shareReplay, first, take
} from 'rxjs/operators';
import { merge, fromEvent, Observable, concat, forkJoin } from 'rxjs';
import { Lesson } from '../model/lesson';
import { createHttpObservable } from '../common/util';


@Component({
    selector: 'course',
    templateUrl: './course.component.html',
    styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit, AfterViewInit {

    courseId: number;

    course$: Observable<Course>;

    lessons$: Observable<Lesson[]>;

    course: Course;


    @ViewChild('searchInput', { static: true }) input: ElementRef;

    constructor(private route: ActivatedRoute, private store: Store) {


    }

    ngOnInit() {

        this.courseId = this.route.snapshot.params['id'];

        //this.course$ = createHttpObservable(`http://localhost:9000/api/courses/${this.courseId}`);
        //---13.use store instead of making extra HTTP request above----------
        this.course$ = this.store.selectCourseById(this.courseId)
            //-----16.FIRST Operater---------to force the completion of the existing observable after emitting its first value use FIRST Operater.
            .pipe(
                //first()//to complete the observable after getting first value.http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-first
                //---17.TAKE Operater----------it can take mentioned number of values from observable.after that it completes. take(1) is same as first().--------------http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-take
                take(1)
            );


        //---15.Consequesce of long running observable----
        //since Courses$ in store never completes, this.course$ a derived observable also never completes
        forkJoin(this.course$, this.loadLessons())
            .subscribe(console.log);//we wont get any output here because forkjoin wait for each of the fork observable to complete before producing the combined joined result.we get the output after piping first() above
        //so we want our course observable to complete after emmiting its first value



        //-----18.WITHLATESTFROM Operater--------useful when dealing with long running observable like Courses$ in store.---http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html#instance-method-withLatestFrom
        //example.//to use course here below inside "lessons=>{" below if required, here we done have course variable.we only have course$ obervable which never completes because it is derived from Course$ in store which also never completes.
        //one remedy is:
        ////this.course$.subscribe(course=>this.course=course);//this is manual,duplicate,not rective design.so good remedy:WITHLATESTFROM Operater
        this.loadLessons()
            .pipe(
                withLatestFrom(this.course$)//allows to combine multiple observables together(long running or not) by taking latest value emited from each observable and provides that to next operater in the chain or to subscribe method as a tuple value
                //the tuple value emited here is 1.lessons[],2.course
            )
            .subscribe(([lessons, course]) => {
                console.log('lessons', lessons),
                    console.log('course', course);
            })
    }

    ngAfterViewInit() {

        const searchLessons$ = fromEvent<any>(this.input.nativeElement, 'keyup')
            .pipe(
                map(event => event.target.value),
                debounceTime(400),
                distinctUntilChanged(),
                switchMap(search => this.loadLessons(search))
            );

        const initialLessons$ = this.loadLessons();

        this.lessons$ = concat(initialLessons$, searchLessons$);

    }

    loadLessons(search = ''): Observable<Lesson[]> {
        return createHttpObservable(
            `http://localhost:9000/api/lessons?courseId=${this.courseId}&pageSize=100&filter=${search}`)
            .pipe(
                map(res => res["payload"])
            );
    }


}











