import { Course } from './../model/course';
import { Observable, Subject, BehaviorSubject, timer } from 'rxjs';
import { Injectable } from '@angular/core';
import { createHttpObservable } from './util';
import { tap, map, shareReplay, retryWhen, delayWhen, filter } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';

@Injectable({
    providedIn: 'root'//means there is one store for the whole application
})
//centralize store design pattern can be done ourselves by SUBJECT or using third party library like NgRx
export class Store {


    //----------7.CENTRALIZED STORE-----every time we navigate to view course and come back to course list, a request will be sent to get the list of course. remedy:use centralized store 
    //both beginner and advanced courses will be there in courses$.to define this observable it is not conveineient to create observable using Observable.Create(),..etc.  use SUBJECT to define observable here
    private subject = new BehaviorSubject<Course[]>([]);//only store is able to emit new values,so private.when we navigate to about screen and back to courses screen then new instance of home componenet destroyed and created every time.so we want later instances of home component also get the courses data.so use BEHAVIOUR SUBJECT, therefore late subscribers also get the latest version of courses[]
    courses$: Observable<Course[]> = this.subject.asObservable();
    constructor() { }

    init() {
        const http$ = createHttpObservable('http://localhost:9000/api/courses');

        http$
            .pipe(
                tap(() => console.log("HTTP request executed")),
                map(res => Object.values(res["payload"])),
                /*shareReplay(),//remove this since it will not be share outside store
                retryWhen(errors =>//remove for demo
                    errors.pipe(
                        delayWhen(() => timer(2000)
                        )
                    ))*/
            ).subscribe(
                courses => this.subject.next(courses)
            );
    }
    //-----------9.SELECT COURSE------------
    selectBeginnerCourses() {
        return this.filterByCategory('BEGINNER');
    }
    selectAdvancedCourses() {
        return this.filterByCategory('ADVANCED');
    }
    selectCourseById(courseId: number) {
        return this.courses$
            .pipe(
                map(courses => courses
                    .find(course => course.id == courseId)),//filter operater gets the array back.so use find() to get unique course value
                //courses$ is initialized with empty array, so if first time selectCourseById() fuction gets called .find() will retun undefined.so we want to filter out this initial undefined id.so there later we can force complete the observable after emiting first actual value using FIRST Operater.
                filter(course => !!course)//this will filter undefined result that we get initially,since store courses$ is initial empty
                //!undefined > returns true
                //!!undefined > returns false
            );
    }




    filterByCategory(category: string) {
        return this.courses$
            .pipe(
                map(courses => courses
                    .filter(course => course.category == category))
            );
    }

    //-----11.SAVE COURSE------------save the changes and broad cast changes with subject
    saveCourse(courseId: number, changes: any): Observable<any> {
        const courses = this.subject.getValue();//get all courses array values
        const courseIndex = courses.findIndex(course => course.id == courseId);
        //now we know where course is in the array to be modified, but dont modify it directly.instead of modifyig inmemory value directly,we should create new value of courses array and emit that value using the subject.
        //the idea is that the consumers of the courses data will get notified that a new value is available.if we mutate the data directly , then the components will not know that data has been modified and they will not react to that modification

        const newCourses = courses.slice(0);//copy the array
        newCourses[courseIndex] = {
            ...courses[courseIndex],
            ...changes
        };

        this.subject.next(newCourses);
        return fromPromise(fetch(`http://localhost:9000/api/courses/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(changes),
            headers: {
                'content-type': 'application/json'
            }
        }));
    }
    //-----14.problem> Courses$ emits new versions of courses array as we edit each course but it never completes.ex: if save course fails then ,onlt that observable fails and gives error but the observable of our service Courses$ will not error out.
    //  so do force completion of long running observable like Courses$>> for that use FIRST , TAKE Operaters



}