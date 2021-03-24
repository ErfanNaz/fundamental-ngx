import { ViewportRuler } from '@angular/cdk/scrolling';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
    Renderer2,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { Subscription } from 'rxjs';
import { MOBILE_BREAKPOINT_PX } from '../../constants';
import { DynamicPageConfig } from '../../dynamic-page.config';
import { DynamicPageService } from '../../dynamic-page.service';
import { addClassNameToElement } from '../../utils';

/** Dynamic Page collapse change event */
export class DynamicPageCollapseChangeEvent {
    constructor(public source: DynamicPageHeaderComponent, public payload: boolean) {}
}

let dynamicPageHeaderId = 0;
@Component({
    selector: 'fdp-dynamic-page-header',
    templateUrl: './dynamic-page-header.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DynamicPageHeaderComponent implements OnInit, AfterViewInit, OnDestroy {
    /**
     * whether the header can be collapsed. True by default. If set to false, both pin/collapse buttons disappear
     * and the header stays visible
     */
    @Input()
    collapsible = true;

    /**
     * whether the header should be allowed to be pinned or unpinned. When set, the pin button shows up.
     * Pinning the header will make the header stay visible and the collapse button(if present) will disappear until unpinned.
     */
    @Input()
    pinnable = false;

    /**
     * the initial state of the header. Set to true if header should be collapsed.
     */
    @Input()
    set collapsed(collapsed: boolean) {
        this._collapsed = collapsed;
        this._dynamicPageService?.setCollapseValue(collapsed);
    }

    get collapsed(): boolean {
        return this._collapsed;
    }

    /**
     * ARIA label for button when the header is collapsed
     */
    @Input()
    expandLabel: string = this._dynamicPageConfig.expandLabel;

    /**
     * ARIA label for button when the header is expanded
     */
    @Input()
    collapseLabel: string = this._dynamicPageConfig.collapseLabel;

    /** Header role  */
    @Input()
    @HostBinding('attr.role')
    role = 'region';

    /**
     * id for header
     */
    @Input()
    @HostBinding('attr.id')
    id = `fdp-dynamic-page-header-id-${dynamicPageHeaderId++}`;

    /**
     * aria label for header
     */
    @Input()
    headerAriaLabel: string;

    /**
     * aria label for pin state of pin button
     */
    @Input()
    pinAriaLabel: string = this._dynamicPageConfig.pinLabel;

    /**
     * aria label for unpin state of pin button
     */
    @Input()
    unpinAriaLabel: string = this._dynamicPageConfig.unpinLabel;

    /** Collapse/Expand change event raised */
    @Output()
    collapseChange: EventEmitter<DynamicPageCollapseChangeEvent> = new EventEmitter<DynamicPageCollapseChangeEvent>();

    /** Reference to page header content */
    @ViewChild('headerContent')
    headerContent: ElementRef<HTMLElement>;

    /**
     * tracking if pin button is pinned
     */
    _pinned = false;

    /**
     * @hidden
     * pn/unpin aria label based on the current state
     */
    _pinUnpinAriaLabel: string;

    /**
     * @hidden
     * expand/collapse aria label based on the current state
     */
    _expandCollapseAriaLabel: string;

    /**
     * @hidden
     * tracking expand/collapse button
     */
    private _collapsed = false;

    /**
     * @hidden
     * tracking collapsible for pinning
     */
    private _collapsible = this.collapsible;

    /**
     * @hidden
     * subscription for when toggle header is called
     */
    private _toggleSubscription: Subscription;

    /**
     * @hidden
     * subscription for when expand header is called
     */
    private _expandSubscription: Subscription;

    /**
     * @hidden
     * subscription for when collapse header is called
     */
    private _collapseSubscription: Subscription;

    /** @hidden */
    constructor(
        private _cd: ChangeDetectorRef,
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        protected _dynamicPageConfig: DynamicPageConfig,
        private _dynamicPageService: DynamicPageService,
        private _ruler: ViewportRuler
    ) {
        if (this.collapsible) {
            this._toggleSubscription = this._dynamicPageService.$toggle.subscribe(() => {
                this.toggleCollapse();
            });
            this._expandSubscription = this._dynamicPageService.$expand.subscribe(() => {
                this.collapseHeader(false);
            });
            this._collapseSubscription = this._dynamicPageService.$collapse.subscribe(() => {
                this.collapseHeader(true);
            });
        }
    }

    /** @hidden */
    ngOnInit(): void {
        if (this._isCollapsibleCollapsed()) {
            this._setStyleToHostElement('z-index', 1);
        }
        this._calculateExpandCollapseAriaLabel();
        this._calculatePinUnpinAriaLabel();
    }

    /** @hidden */
    ngAfterViewInit(): void {
        this._modifyFacetClasses();
        this._listenToResize();

        // add facet styles to image facet
        const facetComponent = this._elementRef.nativeElement.querySelector('.fd-facet--image');
        if (!facetComponent) {
            return;
        }
        this._addClassNameToCustomElement(facetComponent, 'fd-margin-bottom--sm');
    }

    /**@hidden */
    ngOnDestroy(): void {
        this._toggleSubscription.unsubscribe();
        this._expandSubscription.unsubscribe();
        this._collapseSubscription.unsubscribe();
    }

    /**
     * collapse or expand the header
     * @param val the collapse/expand value
     */
    collapseHeader(val: boolean): void {
        if (this._isPinned()) {
            return;
        }
        if (this.collapsed !== val) {
            this.collapsed = val;
            this._expandCollapseActions();
        }
    }

    /**
     * toggles the state of the header and
     * handles expanded/collapsed event
     */
    toggleCollapse(): void {
        this._pinned = false;

        this.collapsed = !this._dynamicPageService.getIsCollapsed();
        this._expandCollapseActions();
    }

    /**
     * return the element reference.
     */
    elementRef(): ElementRef<any> {
        return this._elementRef;
    }

    /**
     * @hidden
     * click action on pin button
     */
    _onPinned(): void {
        this._pinned = !this._pinned;
        if (this._pinned) {
            this._collapsible = false;
        } else {
            this._collapsible = this.collapsible; // reset
        }
        this._calculatePinUnpinAriaLabel();
    }

    /**
     * handles actions like style changes and emit methods on expand/collapse
     */
    private _expandCollapseActions(): void {
        if (this._isCollapsibleCollapsed()) {
            this._setStyleToHostElement('z-index', 1);
        } else {
            this._removeStyleFromHostElement('z-index');
        }
        const event = new DynamicPageCollapseChangeEvent(this, this.collapsed);
        this.collapseChange.emit(event);
        this._calculateExpandCollapseAriaLabel();
        this._cd.detectChanges();
        this._dynamicPageService?.setCollapseValue(this._dynamicPageService.getIsCollapsed());
    }

    /**
     * return whether this collapse/expand button is collapsed
     */
    private _isCollapsibleCollapsed(): boolean {
        return this.collapsible && this.collapsed && this._collapsible;
    }

    /**
     * return whether the pin button is pinned
     */
    private _isPinned(): boolean {
        return !this._collapsible && this._pinned;
    }

    /**
     * @hidden
     * Calculate expandAriaLabel based on header
     */
    private _calculateExpandCollapseAriaLabel(): void {
        this._expandCollapseAriaLabel = this.collapsed ? this.expandLabel : this.collapseLabel;
    }

    /**
     * @hidden
     * Calculate pinUnpinAriaLabel based on header
     */
    private _calculatePinUnpinAriaLabel(): void {
        this._pinUnpinAriaLabel = this._isPinned() ? this.unpinAriaLabel : this.pinAriaLabel;
    }

    /**
     * @hidden
     * listen to window resize
     */
    private _listenToResize(): void {
        this._ruler.change().subscribe((resizeEvent) => {
            this._modifyFacetClasses();
        });
    }

    /** @hidden
     * modify image facet classes when it is part of the header and in mobile mode
     */
    _modifyFacetClasses(): void {
        const widthPx = this._ruler?.getViewportSize().width;
        const facetComponent = this._elementRef.nativeElement.querySelector('.fd-facet--image');
        if (!facetComponent) {
            return;
        }
        // mobile case
        if (widthPx < MOBILE_BREAKPOINT_PX) {
            facetComponent.classList.remove(`fd-margin-bottom--sm`);
            facetComponent.classList.add(`fd-margin-bottom--tiny`);
            facetComponent.classList.remove(`fd-margin-end--md`);
            facetComponent.classList.add(`fd-margin-end--sm`);
        } else {
            // reset facet styles
            facetComponent.classList.add(`fd-margin-bottom--sm`);
            facetComponent.classList.remove(`fd-margin-bottom--tiny`);
            facetComponent.classList.add(`fd-margin-end--md`);
            facetComponent.classList.remove(`fd-margin-end--sm`);
        }
    }

    /**@hidden */
    private _setStyleToHostElement(attribute: string, value: any): void {
        this._renderer.setStyle(this._elementRef.nativeElement, attribute, value);
    }

    /**@hidden */
    private _removeStyleFromHostElement(styleName: string): void {
        this._renderer.removeStyle(this._elementRef.nativeElement, styleName);
    }

    /**@hidden */
    private _addClassNameToCustomElement(element: Element, className: string): void {
        addClassNameToElement(this._renderer, element, className);
    }
}
