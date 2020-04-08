import { Component, OnInit } from '@angular/core';
import { Store } from './common/store.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  //----------8.ON APPLICATION START----on application start we call inialization methon in Store which will give request to backend,fetch tha data,and emmit to the rest of the applicationusing courses$ in store.
  constructor(private store: Store) {

  }

  ngOnInit() {
    this.store.init();

    console.log({
      ...{ id: 1, name: 'a' },
      ...{ id: 2, name: 'b' }
    })
  }

}
