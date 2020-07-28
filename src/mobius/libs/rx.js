export {
  Observable, Subject, BehaviorSubject,
  merge, zip, combineLatest
} from 'rxjs'
export {
  // creation

  // combination
  startWith,
  // conditional

  // Error handling

  // filtering
  debounceTime, filter, take, distinctUntilChanged,
  // multicasting
  shareReplay,
  // transformation
  map, switchMap,
  // utility
  tap
} from 'rxjs/operators/index.js'
