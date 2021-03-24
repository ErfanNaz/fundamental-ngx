import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    Input,
    OnChanges, OnDestroy,
    OnInit,
    Optional,
    SimpleChanges,
    ViewEncapsulation
} from '@angular/core';
import { applyCssClass, ContentDensityService, CssClassBuilder } from '../utils/public_api';
import { BaseButton } from './base-button';
import { Subject, Subscription } from 'rxjs';
import { takeUntil, takeWhile } from 'rxjs/operators';


/**
 * Button directive, used to enhance standard HTML buttons.
 *
 * ``` selector: button[fd-button], a[fd-button] ```
 *
 * ```html
 * <button fd-button [label]="'Button Text'"></button>
 * <a fd-button [label]="'Button Text'"></a>
 * ```
 */
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'button[fd-button], a[fd-button]',
    exportAs: 'fd-button',
    templateUrl: './button.component.html',
    styleUrls: ['./button.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[attr.type]': 'type',
        '[attr.disabled]': '_disabled || null'
    }
})
export class ButtonComponent extends BaseButton implements OnChanges, CssClassBuilder, OnInit, OnDestroy {
    /** The property allows user to pass additional css classes. */
    @Input()
    class = '';

    /** @hidden */
    private _isCompactSet = false;

    /** @hidden */
    private _onDestroy = new Subject<void>();

    /** @hidden */
    private _subscriptions = new Subscription();

    /** @hidden */
    constructor(
        private _elementRef: ElementRef,
        private _changeDetectorRef: ChangeDetectorRef,
        @Optional() private _contentDensityService: ContentDensityService
    ) {
        super();
    }

    /**
     * Function runs when component is initialized
     * function should build component css class
     * function should build css style
     */
    public ngOnChanges(changes: SimpleChanges): void {
        if ('compact' in changes && changes['compact'].currentValue !== undefined) {
            this._isCompactSet = true;
        }
        this.buildComponentCssClass();
    }

    public ngOnInit(): void {
        this._contentDensityService._contentDensityListener.pipe(
            takeUntil(this._onDestroy),
            takeWhile(_ => !this._isCompactSet)
        ).subscribe(density => {
            this.compact = density !== 'cozy';
            this.buildComponentCssClass();
        });
        this.buildComponentCssClass();
    }

    /** @hidden */
    ngOnDestroy(): void {
        this._onDestroy.next();
        this._onDestroy.complete();
        this._subscriptions.unsubscribe();
    }

    @applyCssClass
    /** CssClassBuilder interface implementation
     * function must return single string
     * function is responsible for order which css classes are applied
     */
    buildComponentCssClass(): string[] {
        return [
            'fd-button',
            this.fdType ? `fd-button--${this.fdType}` : '',
            this.compact ? 'fd-button--compact' : '',
            this.fdMenu ? 'fd-button--menu' : '',
            this._disabled || this._ariaDisabled ? 'is-disabled' : '',
            this.class
        ];
    }

    /** HasElementRef interface implementation
     * function used by applyCssClass and applyCssStyle decorators
     */
    public elementRef(): ElementRef<any> {
        return this._elementRef;
    }

    detectChanges(): void {
        this._changeDetectorRef.detectChanges();
    }
}
