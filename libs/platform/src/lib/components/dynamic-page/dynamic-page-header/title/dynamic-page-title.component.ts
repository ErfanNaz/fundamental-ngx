import { FocusMonitor } from '@angular/cdk/a11y';
import { ViewportRuler } from '@angular/cdk/scrolling';

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { BreadcrumbComponent, DynamicPageResponsiveSize, FacetComponent } from '@fundamental-ngx/core';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CLASS_NAME, TOOLBAR_ACTIONS_SQUASH_BREAKPOINT_PX } from '../../constants';
import { DynamicPageService } from '../../dynamic-page.service';
import { addClassNameToElement, removeClassNameFromElement } from '../../utils';
import { DynamicPageGlobalActionsComponent } from '../actions/global-actions/dynamic-page-global-actions.component';
import { DynamicPageKeyInfoComponent } from '../key-info/dynamic-page-key-info.component';

@Component({
    selector: 'fdp-dynamic-page-title',
    templateUrl: './dynamic-page-title.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DynamicPageTitleComponent implements OnInit, AfterViewInit, OnDestroy {
    @Input()
    title: string;

    @Input()
    subtitle: string;

    /** Whether should be on compact mode */
    @Input()
    compact = false;

    /**
     * @hidden
     * the reference to breadcrumb title container
     */
    @ViewChild('breadcrumbTitleContainer')
    breadcrumbTitleContainer: ElementRef<HTMLElement>;

    /** @hidden */
    @ContentChild(BreadcrumbComponent)
    _breadcrumbComponent: BreadcrumbComponent;

    /** @hidden */
    @ContentChild(DynamicPageGlobalActionsComponent)
    _globalActions: DynamicPageGlobalActionsComponent;

    /** @hidden */
    @ContentChild(DynamicPageKeyInfoComponent)
    _contentToolbar: DynamicPageKeyInfoComponent;

    /**
     * @hidden
     * the reference to the title element
     */
    @ViewChild('titleRef')
    titleRef: ElementRef<any>;

    /** @hidden */
    _actionsSquashed = false;

    _hasImageFacet = false;

    _isHeaderCollapsed = false;

    /**
     * sets size which in turn adds corresponding padding for the size type.
     * size can be `small`, `medium`, `large`, or `extra-large`.
     */
    set size(sizeType: DynamicPageResponsiveSize) {
        if (sizeType) {
            this._size = sizeType;
            this._globalActions?._setSize(sizeType);
            this._breadcrumbComponent?.onResize();
            this._cd.detectChanges();
        }
    }

    get size(): DynamicPageResponsiveSize {
        return this._size;
    }

    /**
     * @hidden
     * tracks the size for responsive padding
     */
    _size: DynamicPageResponsiveSize;

    @ContentChild(FacetComponent)
    private _facetComponent: FacetComponent;

    /**
     * subscription for when collapse value has changed
     */
    private _collapseValSubscription: Subscription = new Subscription();

    /** @hidden */
    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _focusMonitor: FocusMonitor,
        private _cd: ChangeDetectorRef,
        private _dynamicPageService: DynamicPageService,
        private _ngZone: NgZone,
        private _ruler: ViewportRuler
    ) {}

    /** @hidden */
    ngOnInit(): void {
        this._addClassNameToHostElement(CLASS_NAME.dynamicPageTitleArea);
        this._setAttributeToHostElement('tabindex', 0);
        this._listenToResize();
        // add --collapsed modifier to title area when header is collapsed
        this._addCollapsedStyleTitleAreaSubscription();
    }

    /** @hidden */
    ngAfterViewInit(): void {
        this._focusMonitor.monitor(this._elementRef).subscribe((origin) =>
            this._ngZone.run(() => {
                if (origin === 'keyboard') {
                    this._dynamicPageService.expandHeader();
                }
            })
        );
        // add breadcrumb styles
        if (this._breadcrumbComponent) {
            this._addClassNameToCustomElement(
                this._breadcrumbComponent.elementRef.nativeElement,
                CLASS_NAME.dynamicPageBreadcrumb
            );
            this._breadcrumbComponent.onResize();
        }

        this._squashActions();

        if (!this._facetComponent) {
            return;
        }
        if (this._facetComponent.type === 'image') {
            this._hasImageFacet = true; // change the structure to hold facet
            // add bottom margin styles when image facet is used in object/dynamic page
            this._addFacetStyles();
        }
    }

    /** @hidden */
    ngOnDestroy(): void {
        this._collapseValSubscription.unsubscribe();
    }

    /**
     * get reference to this element
     */
    elementRef(): ElementRef<HTMLElement> {
        return this._elementRef;
    }

    /** @hidden */
    stopPropagation(event: MouseEvent): void {
        event.stopPropagation();
    }

    /**@hidden
     * squash toolbar actions when window is resized below 1280px
     */
    _squashActions(): void {
        const widthPx = this._ruler?.getViewportSize().width;
        const actionsSquashed: boolean =
            widthPx < TOOLBAR_ACTIONS_SQUASH_BREAKPOINT_PX || this.size === 'small' || this.size === 'medium';
        if (actionsSquashed !== this._actionsSquashed) {
            this._actionsSquashed = actionsSquashed;
            this._cd.detectChanges();
        }
    }

    /** @hidden
     * add/remove facet styles for image facet when it is placed next to title
     */
    private _addFacetStyles(): void {
        this._facetComponent.elementRef().nativeElement.classList.remove(`fd-margin-end--md`);
        this._facetComponent.elementRef().nativeElement.classList.add(`fd-margin-end--sm`);
        this._facetComponent.elementRef().nativeElement.classList.add(`fd-facet--image-header-title`);
    }

    /** @hidden
     * if collapsed, add dynamicPageTitleAreaCollapsed style for padding bottom
     */
    private _addCollapsedStyleTitleAreaSubscription(): void {
        this._addCollapsedStyleTitleArea(this._dynamicPageService.getIsCollapsed());

        if (this._collapseValSubscription) {
            this._collapseValSubscription.unsubscribe();
        }
        this._collapseValSubscription = this._dynamicPageService.$collapseValue.subscribe((val) => {
            this._isHeaderCollapsed = val;
            this._addCollapsedStyleTitleArea(val);
            this._cd.detectChanges();
        });
    }

    /** @hidden */
    private _addCollapsedStyleTitleArea(val: boolean): void {
        if (val) {
            this._addClassNameToHostElement(CLASS_NAME.dynamicPageTitleAreaCollapsed);
        } else {
            removeClassNameFromElement(
                this._renderer,
                this._elementRef.nativeElement,
                CLASS_NAME.dynamicPageTitleAreaCollapsed
            );
        }
    }

    /**@hidden */
    private _listenToResize(): void {
        this._ruler.change().subscribe(() => {
            this._squashActions();
        });
    }

    /**@hidden */
    private _setAttributeToHostElement(attribute: string, value: any): void {
        this._renderer.setAttribute(this._elementRef.nativeElement, attribute, value);
    }

    /**@hidden */
    private _addClassNameToHostElement(className: string): void {
        addClassNameToElement(this._renderer, this._elementRef.nativeElement, className);
    }

    /**@hidden */
    private _addClassNameToCustomElement(element: Element, className: string): void {
        addClassNameToElement(this._renderer, element, className);
    }
}
