import { ViewportRuler } from '@angular/cdk/scrolling';
import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ContentChildren,
    ElementRef,
    HostBinding,
    Input,
    OnDestroy,
    Optional,
    QueryList,
    Renderer2,
    ViewChild,
    ViewChildren,
    ViewEncapsulation
} from '@angular/core';
import {
    DynamicPageBackgroundType,
    DynamicPageResponsiveSize,
    dynamicPageWidthToSize,
    FlexibleColumnLayoutComponent,
    TabPanelComponent
} from '@fundamental-ngx/core';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, startWith, throttleTime } from 'rxjs/operators';
import { BaseComponent } from '../base';
import { CLASS_NAME } from './constants';
import {
    DynamicPageContentComponent,
    DynamicPageTabChangeEvent
} from './dynamic-page-content/dynamic-page-content.component';
import { DynamicPageTabbedContentComponent } from './dynamic-page-content/dynamic-page-tabbed-content.component';
import { DynamicPageHeaderComponent } from './dynamic-page-header/header/dynamic-page-header.component';
import { DynamicPageTitleComponent } from './dynamic-page-header/title/dynamic-page-title.component';
import { DynamicPageService } from './dynamic-page.service';
import { addClassNameToElement } from './utils';

@Component({
    selector: 'fdp-dynamic-page',
    templateUrl: './dynamic-page.component.html',
    styleUrls: ['./dynamic-page.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    providers: [DynamicPageService]
})
export class DynamicPageComponent extends BaseComponent implements AfterContentInit, AfterViewInit, OnDestroy {
    /** Page role  */
    @Input()
    @HostBinding('attr.role')
    role = 'region';

    /** aria label for the page */
    @Input()
    ariaLabel: string;

    /**
     * sets background for content to `list`, `transparent`, or `solid` background color.
     * Default is `solid`.
     */
    @Input()
    background: DynamicPageBackgroundType = 'solid';

    /**
     * sets size which in turn adds corresponding padding for the size type.
     * size can be `small`, `medium`, `large`, or `extra-large`.
     */
    @Input()
    set size(size: DynamicPageResponsiveSize) {
        this._size = size;
        this._propagateSizeToChildren();
    }

    get size(): DynamicPageResponsiveSize {
        return this._size;
    }

    /** Whether DynamicPage should have responsive sides spacing changing with Page window width.
     * max-width: 599px                         - small
     * min-width: 600px and max-width: 1023px   - medium
     * min-width: 1024px and max-width: 1439px  - large
     * min-width: 1440px                        - extra large
     */
    @Input()
    autoResponsive = true;

    /**
     * user provided offset in px
     */
    @Input()
    offset = 0;

    /** reference to header component  */
    @ContentChild(DynamicPageHeaderComponent)
    headerComponent: DynamicPageHeaderComponent;

    /** reference to title component  */
    @ContentChild(DynamicPageTitleComponent)
    titleComponent: DynamicPageTitleComponent;

    /** reference to content component  */
    @ContentChild(DynamicPageContentComponent)
    contentComponent: DynamicPageContentComponent;

    /** reference to content component to filter tabs */
    @ContentChildren(DynamicPageContentComponent, { descendants: true })
    tabbedContent: QueryList<DynamicPageContentComponent>;

    /** reference to content component to filter tabs */
    @ViewChildren(DynamicPageTabbedContentComponent)
    tabContents: QueryList<DynamicPageTabbedContentComponent>;

    @ViewChildren(TabPanelComponent)
    dynamicPageTabs: QueryList<TabPanelComponent>;

    /** @hidden */
    @ViewChild('dynamicPageElement')
    _dynamicPageElement: ElementRef;

    /**
     * @hidden
     * reference to header container
     */
    @ViewChild('header')
    header: ElementRef<HTMLElement>;

    /**
     * @hidden
     * reference to tabbed content container
     */
    @ViewChild('contentContainer')
    contentContainer: ElementRef<HTMLElement>;

    /**
     * tracks whether the header was toggled or not
     */
    isHeaderCollapsed = false;

    /**
     * @hidden
     * whether tabbed content is present in this page
     */
    isTabbed = false;

    /**
     * @hidden
     * holds the tab content
     */
    tabs: DynamicPageContentComponent[] = [];

    /** @hidden */
    _size: DynamicPageResponsiveSize = 'extra-large';

    /** @hidden */
    private _distanceFromTop = 0;

    /** @hidden */
    private _subscriptions: Subscription = new Subscription();

    /**
     * subscription for when collapse value has changed
     */
    private _collapseValSubscription: Subscription = new Subscription();

    /** @hidden */
    public headerCollapsible = true;

    /** @hidden */
    constructor(
        protected _cd: ChangeDetectorRef,
        private _elementRef: ElementRef<HTMLElement>,
        private _renderer: Renderer2,
        private _dynamicPageService: DynamicPageService,
        private _ruler: ViewportRuler,
        @Optional() private _columnLayout: FlexibleColumnLayoutComponent
    ) {
        super(_cd);
        if (this._collapseValSubscription) {
            this._collapseValSubscription.unsubscribe();
        }
        this._collapseValSubscription = this._dynamicPageService.$collapseValue.subscribe((val) => {
            this.setContainerPositions();
        });
    }

    /** @hidden */
    ngAfterContentInit(): void {
        this._listenToTabbedContentQueryListChanges();
        this._propagateSizeToChildren();

        this.headerCollapsible = this.headerComponent?.collapsible;
    }

    /**@hidden */
    ngAfterViewInit(): void {
        this._setTabStyles();
        this._setCurrentWindowSize();
        this._listenOnResize();

        this._subscriptions.add(
            this.tabbedContent.changes.subscribe(() => {
                this._setTabStyles();
                this.setContainerPositions();
            })
        );
        if (this.headerComponent?.collapsible) {
            this._listenOnScroll();
        }

        // if used with flexible column layout, listen for its layout changes as well
        if (this._columnLayout && this.autoResponsive) {
            this._listenToLayoutChange();
        }
        // some times the view is not fully rendered in the host application before which
        // our content height calculation logic kicks in. Placing a setTimeout of 0 adds a this
        // logic to a new browser event queue with the hope that the host app's view is rendered
        // before this timedout method is called.
        setTimeout(() => {
            this.setContainerPositions();
        }, 0);

        this._cd.detectChanges();
    }

    /**@hidden */
    ngOnDestroy(): void {
        this._collapseValSubscription.unsubscribe();
        this._subscriptions.unsubscribe();
    }

    /**
     * Set the positions of the tabs and content with respect to the window
     */
    setContainerPositions(): void {
        this._setTabsPosition();
        this._setContainerPosition();
    }

    /**
     * Snap the header to expand or collapse based on scrolling.
     */
    snapOnScroll(): void {
        this._listenOnScroll();
    }

    /**
     * toggle the visibility of the header on click of title area.
     */
    toggleCollapse(): void {
        if (this.headerCollapsible) {
            this._dynamicPageService.toggleHeader();
        }
    }

    /**
     * marks the dynamic page tab as selected when the id of the tab is passed
     */
    setSelectedTab(id: string): void {
        if (!(id && this.dynamicPageTabs)) {
            return;
        }

        this.dynamicPageTabs.forEach((element) => {
            if (element.id === id) {
                element.open(true);
            }
        });
    }

    /**
     * get reference to this element
     */
    elementRef(): ElementRef<HTMLElement> {
        return this._elementRef;
    }

    /** @hidden */
    private _propagateSizeToChildren(): void {
        if (this.titleComponent) {
            this.titleComponent.size = this.size;
        }
    }

    /** @hidden
     * sets the current window size and propagates to children components, if autoResponsive enabled
     */
    private _setCurrentWindowSize(): void {
        if (!this.autoResponsive) {
            return;
        }
        const widthPx = this._ruler?.getViewportSize().width;
        const size = dynamicPageWidthToSize(widthPx);

        if (size !== this.size) {
            this.size = size;
            this._propagateSizeToChildren();
            this._cd.markForCheck();
        }
    }

    /**
     * @hidden
     * set top position of normal content on scrolling
     */
    private _setContainerPosition(): void {
        if (this.contentComponent) {
            const contentComponentElement = this.contentComponent.getElementRef().nativeElement;
            this._distanceFromTop = window.pageYOffset + contentComponentElement.getBoundingClientRect().top;
            contentComponentElement.style.height = this._getCalculatedHeight();
            this._addClassNameToCustomElement(contentComponentElement, 'content-sticker');
        }
    }

    /**@hidden */
    private _getCalculatedHeight(): string {
        return 'calc(100vh - ' + (this._distanceFromTop + this.offset) + 'px)';
    }

    /** @hidden */
    private _listenOnScroll(): void {
        if (this.contentComponent) {
            const contentComponentElement = this.contentComponent.getElementRef().nativeElement;

            this._subscriptions.add(
                fromEvent(contentComponentElement, 'scroll')
                    .pipe(debounceTime(20), throttleTime(20))
                    .subscribe(() => {
                        if (contentComponentElement.scrollTop > 0) {
                            this._dynamicPageService.collapseHeader();
                        } else {
                            this._dynamicPageService.expandHeader();
                        }
                    })
            );
        }
    }

    /** @hidden 
     * Listen for window resize and adjust tab and content positions accordingly 
     */
    private _listenOnResize(): void {
        this._subscriptions.add(
            fromEvent(window, 'resize')
                .pipe(debounceTime(60))
                .subscribe(() => {
                    this._setCurrentWindowSize();
                    this.setContainerPositions();
                })
        );
    }

    /** @hidden
     * Functionality handling column layout changes,
     * - recalculate height of content element
     * - recheck size depending on width of DynamicPage
     */
    private _listenToLayoutChange(): void {
        this._subscriptions.add(
            this._columnLayout.layoutChange.pipe(debounceTime(1500)).subscribe((_) => {
                this._setCurrentWindowSize();
                this.setContainerPositions();
            })
        );
    }

    /**
     * @hidden
     * set position for tabs and tabbed content's position relative to the tabs on scrolling
     */
    private _setTabsPosition(): void {
        if (!this.contentContainer) {
            return;
        }
        const tabList: HTMLElement = this.contentContainer.nativeElement.querySelector('.fd-tabs');
        if (!tabList) {
            return;
        }

        const tabContent = this.tabContents?.toArray();
        if (tabContent) {
            tabContent.forEach((contentItem) => {
                const element: HTMLElement = contentItem
                    .getElementRef()
                    .nativeElement.querySelector('.fd-dynamic-page__content');
                if (element) {
                    if (this._distanceFromTop === 0) {
                        this._distanceFromTop = window.pageYOffset + element.getBoundingClientRect().top;
                    }
                    element.style.height = this._getCalculatedHeight();
                }
            });
        }
    }

    /**
     * @hidden
     * set styles for tab labels
     */
    private _setTabStyles(): void {
        if (!this.contentContainer) {
            return;
        }
        const tabList: HTMLElement = this.contentContainer.nativeElement.querySelector('.fd-tabs');
        if (!tabList) {
            return;
        }

        this._addClassNameToCustomElement(tabList, CLASS_NAME.dynamicPageTabs);
        this._addClassNameToCustomElement(tabList, CLASS_NAME.dynamicPageTabsAddShadow);
        this._renderer.setStyle(tabList, 'z-index', 1);

        if (this.header) {
            this._renderer.setStyle(this.header.nativeElement, 'z-index', 2);
        }

        if (!this.headerComponent?.collapsible) {
            return;
        }

        const pinCollapseShadowElement = this._elementRef.nativeElement.querySelector(
            '.fd-dynamic-page__collapsible-header-visibility-container'
        );

        if (pinCollapseShadowElement) {
            this._addClassNameToCustomElement(
                pinCollapseShadowElement,
                CLASS_NAME.dynamicPageCollapsibleHeaderPinCollapseNoShadow
            );
        }
    }

    /** @hidden
     * handle tab changes and emit event
     */
    _handleTabChange(tabPanel: TabPanelComponent): void {
        const event = new DynamicPageTabChangeEvent(this.contentComponent, tabPanel);
        this.contentComponent.tabChange.emit(event);
        this._cd.detectChanges();
    }

    /** @hidden */
    private _listenToTabbedContentQueryListChanges(): void {
        this.tabbedContent.changes.pipe(startWith(this.tabbedContent)).subscribe(() => {
            this._createContent();
        });
    }

    /** @hidden */
    private _createContent(): void {
        const content = this.tabbedContent.toArray();
        // reset array
        this.tabs = [];
        if (!this._isTabContentPresent(content)) {
            if (content.length > 1) {
                throw new Error(
                    'Cannot have more than one content section. Use `tabLabel` to have a tabbed navigation.'
                );
            }
            return;
        }

        if (content) {
            content.forEach((contentItem) => {
                if (!contentItem.tabLabel && this.isTabbed) {
                    throw new Error('At least one element is already tabbed, please provide a `tabLabel`.');
                } else {
                    this.tabs.push(contentItem);
                }
            });
        }
    }

    /**@hidden */
    private _isTabContentPresent(content: DynamicPageContentComponent[]): boolean {
        content.forEach((contentItem) => {
            if (contentItem.tabLabel) {
                this.isTabbed = true;
                return;
            }
        });
        return this.isTabbed;
    }

    /**@hidden */
    private _addClassNameToCustomElement(element: Element, className: string): void {
        addClassNameToElement(this._renderer, element, className);
    }
}
