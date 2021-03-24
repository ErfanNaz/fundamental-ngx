import { Component, ChangeDetectionStrategy, ViewEncapsulation, AfterContentInit, ElementRef } from '@angular/core';
import { CLASS_NAME } from '../../../constants';

@Component({
    selector: 'fdp-dynamic-page-layout-actions',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DynamicPageLayoutActionsComponent implements AfterContentInit {
    /** @hidden */
    constructor(private _elementRef: ElementRef) {}

    /** @hidden */
    ngAfterContentInit(): void {
        // adds global actions classes to its toolbar
        const toolbarEl = this._elementRef.nativeElement.querySelector('.fd-toolbar');
        if (toolbarEl) {
            toolbarEl.classList.add(CLASS_NAME.dynamicPageGlobalActions);
            toolbarEl.classList.add(CLASS_NAME.dynamicPageLayoutActions);
        }
    }
}
