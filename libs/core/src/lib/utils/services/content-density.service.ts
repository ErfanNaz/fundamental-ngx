import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, startWith } from 'rxjs/operators';

export type ContentDensity = 'cozy' | 'condensed' | 'compact';

/**
 * Service taking care of ContentDensity
 */
@Injectable()
export class ContentDensityService {
    contentDensity = new BehaviorSubject<ContentDensity>('compact');

    get _contentDensityListener(): Observable<ContentDensity> {
        return this.contentDensity.pipe(
            startWith(this.contentDensity.getValue()),
            distinctUntilChanged()
        );
    }
}
