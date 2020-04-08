import { Observable } from 'rxjs';


export function createHttpObservable(url: string) {
    //in this method it is not good to share observer to share outside this method, same as subject
    return Observable.create(observer => {

        const controller = new AbortController();
        const signal = controller.signal;

        fetch(url, { signal })
            .then(response => {

                if (response.ok) {
                    return response.json();
                }
                else {
                    observer.error('Request failed with status code: ' + response.status);
                }
            })
            .then(body => {

                observer.next(body);

                observer.complete();

            })
            .catch(err => {

                observer.error(err);

            });

        return () => controller.abort()


    });
}

