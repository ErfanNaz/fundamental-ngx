import {
    Component,
    ChangeDetectionStrategy,
    ViewEncapsulation,
    Input,
    ElementRef,
    Renderer2,
    AfterViewInit,
    ChangeDetectorRef,
    HostBinding
} from '@angular/core';
import { FacetType, FACET_CLASS_NAME } from '../constants';
import { addClassNameToFacetElement } from '../utils';

let randomId = 0;
let randomTitleId = 0;

@Component({
    selector: 'fd-facet',
    templateUrl: './facet.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    host: {
        '[class.fd-facet]': 'true'
    }
})
export class FacetComponent implements AfterViewInit {
    @Input()
    type: FacetType;

    @Input()
    title: string;

    @Input()
    subtitle: string;

    @Input()
    @HostBinding('attr.role')
    id = `fd-facet-id-${randomId++}`;

    @Input()
    alignEnd = false;

    /** @hidden */
    @HostBinding('attr.role')
    get role(): string {
        return this.type !== 'image' ? 'group' : '';
    }

    /** @hidden */
    @HostBinding('attr.aria-labelledby')
    get ariaLabelledby(): string {
        return this.type !== 'image' ? this.titleId : '';
    }

    /** @hidden */
    titleId = `fd-facet-title-id-${randomTitleId++}`;

    /** if image is part of dynamic page header
     * @hidden
     */
    isInHeader = false;

    isInMobileRes = false;

    /** @hidden */
    constructor(
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _cd: ChangeDetectorRef
    ) {}

    /** @hidden */
    ngAfterViewInit(): void {
        this._setupAdditionalStyles();
        this._addAlignmentModifier();
    }

    isFacetInCollapsedHeader(inHeader: boolean): void {
        this.isInHeader = inHeader;
        if (this.isInHeader) {
            addClassNameToFacetElement(
                this._renderer,
                this._elementRef.nativeElement,
                FACET_CLASS_NAME.facetImageHeaderTitleAlignment
            );
        }
        this._cd.detectChanges();
    }

    isFacetInMobileResolution(mobileRes: boolean): void {
        this.isInMobileRes = mobileRes;
        this._cd.detectChanges();
    }
    /**
     * get reference to this element
     */
    elementRef(): ElementRef<HTMLElement> {
        return this._elementRef;
    }
    private _setupAdditionalStyles(): void {
        if (!this.type) {
            return;
        }
        // add type modifier class to host
        this._elementRef.nativeElement.classList.add(`fd-facet--${this.type}`);

        // add margin end and bottom spacings
        this._elementRef.nativeElement.classList.add(`fd-margin-end--md`);
        if (this.type !== 'image') {
            // add bottom margin to non-image facets
            this._elementRef.nativeElement.classList.add(`fd-margin-bottom--sm`);
        }

        switch (this.type) {
            case 'image':
                // image should always be on the left
                this._setStyleToHostElement('order', '-1');
                break;
            case 'rating-indicator':
                const ratingIndicatorComponent = this._elementRef.nativeElement.querySelector('.fd-rating-indicator');

                if (!ratingIndicatorComponent) {
                    return;
                }
                this._addClassNameToCustomElement(ratingIndicatorComponent, FACET_CLASS_NAME.facetContainer);
                const ratingIndicatorContainer = ratingIndicatorComponent.querySelector(
                    '.fd-rating-indicator__container'
                );
                if (!ratingIndicatorContainer) {
                    return;
                }
                this._addClassNameToCustomElement(
                    ratingIndicatorContainer,
                    FACET_CLASS_NAME.facetRatingIndicatorContainer
                );

                const ratingIndicatorDynamicText = ratingIndicatorComponent.querySelector(
                    '.fd-rating-indicator__dynamic-text'
                );
                if (!ratingIndicatorDynamicText) {
                    return;
                }
                this._addClassNameToCustomElement(
                    ratingIndicatorDynamicText,
                    FACET_CLASS_NAME.facetRatingIndicatorDynamicText
                );
                this._addClassNameToCustomElement(ratingIndicatorDynamicText, FACET_CLASS_NAME.marginTopTiny);
                break;
            case 'form':
                const formFacetContainer = this._elementRef.nativeElement.querySelectorAll('.fd-facet__container');
                if (!formFacetContainer) {
                    return;
                }
                formFacetContainer.forEach((container, index) => {
                    if (index !== formFacetContainer.length - 1) {
                        this._addClassNameToCustomElement(container, FACET_CLASS_NAME.marginBottomTiny);
                    }
                    // if icon+link is presented, add spacing to the icon
                    const iconComponent = container.querySelector('fd-icon');
                    if (!iconComponent) {
                        return;
                    }
                    this._addClassNameToCustomElement(iconComponent, FACET_CLASS_NAME.marginEndTiny);
                });

                break;
            case 'key-value':
                // add class to object status
                const objectStatusComponent = this._elementRef.nativeElement.querySelector('.fd-object-status');
                if (!objectStatusComponent) {
                    return;
                }
                this._addClassNameToCustomElement(objectStatusComponent, FACET_CLASS_NAME.facetObjectStatus);

                // add class to override font-family value
                const objectStatusText = objectStatusComponent.querySelector('.fd-object-status__text');
                if (!objectStatusText) {
                    return;
                }
                this._addClassNameToCustomElement(objectStatusText, FACET_CLASS_NAME.facetObjectStatusText);

                // add spacing to object status icon, if present
                const objectStatusIcon = objectStatusComponent.querySelector('.fd-object-status__icon');
                if (!objectStatusIcon) {
                    return;
                }
                this._addClassNameToCustomElement(objectStatusIcon, FACET_CLASS_NAME.paddingNone);
                this._addClassNameToCustomElement(objectStatusIcon, FACET_CLASS_NAME.marginEndTiny);
                break;
            default:
                break;
        }
    }

    private _addAlignmentModifier(): void {
        if (!this.alignEnd) {
            return;
        }
        addClassNameToFacetElement(this._renderer, this._elementRef.nativeElement, 'fd-facet-align-end');

        // add margins to the left after removing existing right margin
        this._elementRef.nativeElement.classList.remove(`fd-margin-end--md`);
        this._elementRef.nativeElement.classList.add(`fd-margin-begin--md`);
    }

    /**@hidden */
    private _setStyleToHostElement(attribute: string, value: any): void {
        this._renderer.setStyle(this._elementRef.nativeElement, attribute, value);
    }

    /**@hidden */
    private _addClassNameToCustomElement(element: Element, className: string): void {
        addClassNameToFacetElement(this._renderer, element, className);
    }
}
