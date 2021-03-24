import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Renderer2,
    ViewEncapsulation,
    AfterViewInit,
    OnDestroy
} from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';

import { DynamicPageService } from '../dynamic-page.service';

@Component({
    selector: 'fdp-dynamic-page-tabbed-content',
    template: `<div class="fd-dynamic-page__content content-sticker">
        <ng-content></ng-content>
    </div>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DynamicPageTabbedContentComponent implements AfterViewInit, OnDestroy {
    /** @hidden */
    private _subscriptions: Subscription = new Subscription();

    /** @hidden */
    constructor(
        public _elementRef: ElementRef<HTMLElement>,
        public _renderer: Renderer2,
        private _dynamicPageService: DynamicPageService
    ) {}

    /** @hidden */
    ngAfterViewInit(): void {
        const hostElement = this._elementRef.nativeElement.querySelector('.fd-dynamic-page__content');

        this._subscriptions.add(fromEvent(hostElement, 'scroll')
            .pipe(debounceTime(20), throttleTime(20))
            .subscribe(() => {
                if (hostElement.scrollTop > 0) {
                    this._dynamicPageService.collapseHeader();
                } else {
                    this._dynamicPageService.expandHeader();
                }
            }));
    }

    /** @hidden */
    ngOnDestroy(): void {
        this._subscriptions.unsubscribe();
    }

    /**
     * get reference to this element
     */
    getElementRef(): ElementRef<HTMLElement> {
        return this._elementRef;
    }
}
