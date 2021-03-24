import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    ContentChild,
    AfterContentInit,
    ElementRef
} from '@angular/core';
import { DynamicPageResponsiveSize, ToolbarComponent } from '@fundamental-ngx/core';
import { CLASS_NAME } from '../../../constants';

@Component({
    selector: 'fdp-dynamic-page-global-actions',
    template: '<ng-content></ng-content>',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DynamicPageGlobalActionsComponent implements AfterContentInit {
    /** @hidden */
    @ContentChild(ToolbarComponent)
    private _toolbarComponent: ToolbarComponent;

    /** @hidden */
    constructor(private _elementRef: ElementRef) {}

    /** @hidden */
    ngAfterContentInit(): void {
        // adds global actions classes to its toolbar
        const toolbarEl = this._elementRef.nativeElement.querySelector('.fd-toolbar');
        if (toolbarEl) {
            toolbarEl.classList.add(CLASS_NAME.dynamicPageGlobalActions);
        }
    }

    /** @hidden */
    _setSize(size: DynamicPageResponsiveSize): void {
        if (this._toolbarComponent) {
            this._handleOverflow(size === 'small');
        }
    }
    
    /** @hidden */
    private _handleOverflow(shouldBeHidden: boolean): void {
        this._toolbarComponent.forceOverflow = shouldBeHidden;
        this._toolbarComponent.shouldOverflow = shouldBeHidden;
        this._toolbarComponent.detectChanges();
        setTimeout(() => {
            this._toolbarComponent.updateCollapsibleItems();
        });
    }
}
