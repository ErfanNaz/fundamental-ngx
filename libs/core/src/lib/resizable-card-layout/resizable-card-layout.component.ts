import {
    AfterContentInit,
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChildren,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    QueryList,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { FocusKeyManager } from '@angular/cdk/a11y';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import {
    CardDropped,
    HorizontalResizeStep,
    ResizingEvent,
    ResizedEvent,
    ResizableCardItemComponent,
    ResizableCardItemConfig
} from './resizable-card-item/resizable-card-item.component';

const DRAG_START_DELAY = 500;
export type LayoutSize = 'sm' | 'md' | 'lg' | 'xl';
export type ResizableCardLayoutConfig = Array<ResizableCardItemConfig>;

@Component({
    selector: 'fd-resizable-card-layout',
    templateUrl: 'resizable-card-layout.component.html',
    styleUrls: ['./resizable-card-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class ResizableCardLayoutComponent implements OnInit, AfterViewInit, AfterContentInit, OnDestroy {
    /** Drag of card can be disabled. Default is true */
    @Input()
    draggable = true;

    /** Object for setting each card property */
    @Input()
    layoutConfig: ResizableCardLayoutConfig;

    /** Available layout width */
    @Input()
    get layoutSize(): LayoutSize {
        return this._layout;
    }

    set layoutSize(layoutSize: LayoutSize) {
        this._layout = layoutSize;
        this._setLayoutColumns(layoutSize);
    }

    /** Emits when card resize is reached to one new step in horizontal or vertical direction */
    @Output()
    stepChange: EventEmitter<ResizedEvent> = new EventEmitter<ResizedEvent>();

    /** Emits when card is dragged and dropped at different position in layout */
    @Output()
    dropped: EventEmitter<CardDropped> = new EventEmitter<CardDropped>();

    /** Emits when card is still resizing */
    @Output()
    resizing: EventEmitter<ResizingEvent> = new EventEmitter<ResizingEvent>();

    /** Emits when card resize is completed */
    @Output()
    resized: EventEmitter<ResizedEvent> = new EventEmitter<ResizedEvent>();

    /** Emits when card height is reduced to show only header */
    @Output()
    miniHeaderReached: EventEmitter<ResizedEvent> = new EventEmitter<ResizedEvent>();

    /** Emits when minimum height of card content area is reached */
    @Output()
    miniContentReached: EventEmitter<ResizedEvent> = new EventEmitter<ResizedEvent>();

    /** Emits when layout changes */
    @Output()
    layoutChange: EventEmitter<ResizableCardLayoutConfig> = new EventEmitter<ResizableCardLayoutConfig>();

    /** @hidden */
    // @ViewChildren(ResizableCardItemComponent)
    // resizeCardItems: QueryList<ResizableCardItemComponent>;

    /** @hidden */
    @ContentChildren(ResizableCardItemComponent)
    resizeCardItems: QueryList<ResizableCardItemComponent>;

    /** @hidden */
    @ViewChild('layout')
    layoutWidth: ElementRef;

    dragStartDelay = DRAG_START_DELAY;

    /** @hidden Number of columns in layout. considering 1 column width 20rem */
    private _columns: number;

    /** @hidden Stores height of each column on card arrangement */
    private _columnsHeight: Array<number>;

    /** @hidden Available screen layout */
    private _layout: LayoutSize;

    /** @hidden Stores sorted card before placing in layout */
    private _sortedCards: Array<ResizableCardItemComponent>;

    /** @hidden FocusKeyManager instance */
    private _keyboardEventsManager: FocusKeyManager<ResizableCardItemComponent>;

    /** @hidden  */
    private destroy$ = new Subject<boolean>();

    constructor(private readonly _changeDetectorRef: ChangeDetectorRef, private readonly _elementRef: ElementRef) {}

    /** @hidden */
    ngOnInit(): void {
        this._columnsHeight = new Array(this._columns);
        this._initHeightArray();
    }

    /** @hidden */
    ngAfterContentInit(): void {
        this._initialSetup();
        this.arrangeCards(this.resizeCardItems?.toArray());
    }

    /** @hidden */
    ngAfterViewInit(): void {
        this._accessibilitySetup();
        this._changeDetectorRef.detectChanges();
    }

    /** @hidden */
    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /** @hidden */
    @HostListener('keydown', ['$event'])
    handleKeydown(event: KeyboardEvent): void {
        event.stopImmediatePropagation();
        if (!this._keyboardEventsManager.activeItemIndex) {
            this._keyboardEventsManager.setFirstItemActive();
        }

        if (this._keyboardEventsManager) {
            this._keyboardEventsManager.onKeydown(event);
        }
    }

    /**
     * Arranges cards in layout based on rank, width and height of card
     */
    arrangeCards(cards: Array<ResizableCardItemComponent>): void {
        // sort based on the card rank
        this._sortedCards = cards.sort(this._sortCards);
        this._sortedCards.forEach((card, index) => {
            card.verifyUpdateCardWidth(this.layoutSize);
            this._setCardPositionValues(card, index);
            this._updateColumnsHeight(card);
        });
    }

    /**
     * Handles shifting of cards with animation
     * while card is still resizing
     */
    cardResizing(event: ResizingEvent): void {
        this.resizing.emit(event);
    }

    /**
     * Handles arrangement of cards in layout
     */
    cardResizeComplete(event: ResizedEvent): void {
        this._initHeightArray();
        this.arrangeCards(this.resizeCardItems.toArray());
        this._emitLayoutChange();
        this.resized.emit(event);
    }

    /** @hidden */
    elementRef(): ElementRef<ResizableCardLayoutComponent> {
        return this._elementRef;
    }

    /** @hidden Subscribe to events from items */
    private _initialSetup(): void {
        // listen for resizing event of card item
        this.resizeCardItems.forEach((resizeCardItem) => {
            resizeCardItem.resizing
                .pipe(takeUntil(this.destroy$))
                .subscribe((event: ResizingEvent) => this.cardResizing(event));

            // listen for resize complete event of card item
            resizeCardItem.resized
                .pipe(takeUntil(this.destroy$))
                .subscribe((event: ResizedEvent) => this.cardResizeComplete(event));

            // listen for mini-header height event of card item
            resizeCardItem.miniHeaderReached.pipe(takeUntil(this.destroy$)).subscribe((event: ResizedEvent) => {
                this.miniHeaderReached.emit(event);
            });

            // listen for mini-content height event of card item
            resizeCardItem.miniContentReached.pipe(takeUntil(this.destroy$)).subscribe((event: ResizedEvent) => {
                this.miniContentReached.emit(event);
            });

            // listen for step-change event of card item
            resizeCardItem.stepChange.pipe(takeUntil(this.destroy$)).subscribe((event: ResizedEvent) => {
                this.stepChange.emit(event);
            });
        });
    }

    /** @hidden */
    private _accessibilitySetup(): void {
        this._keyboardEventsManager = new FocusKeyManager(this.resizeCardItems).withWrap();
    }

    /** Emit layoutChange event with updated card dimensions */
    private _emitLayoutChange(): void {
        const latestCardConfig: ResizableCardLayoutConfig = [];
        this.resizeCardItems.forEach((card) => {
            const cardConfig: ResizableCardItemConfig = {};
            cardConfig.cardWidth = card.cardWidth;
            cardConfig.cardHeight = card.cardHeight;
            cardConfig.rank = card.rank;
            latestCardConfig.push(cardConfig);
        });
        this.layoutChange.emit(latestCardConfig);
    }

    /** @hidden Sets number of column in layout, based on LayoutSize passed */
    private _setLayoutColumns(layoutSize: LayoutSize): void {
        switch (layoutSize) {
            case 'sm':
                this._columns = 1;
                break;
            case 'md':
                this._columns = 2;
                break;
            case 'lg':
                this._columns = 3;
                break;
            case 'xl':
                this._columns = 4;
                break;
            default:
                this._columns = 4;
        }
        this._changeDetectorRef.detectChanges();
    }

    /** @hidden Initialize height array for columns */
    private _initHeightArray(): void {
        for (let index = 0; index < this._columns; index++) {
            this._columnsHeight[index] = 0;
        }
    }

    /** @hidden updates array with new column heights */
    private _updateColumnsHeight(card: ResizableCardItemComponent): void {
        const columnsStart = Math.floor(card.left / HorizontalResizeStep);
        // till which columns card spans
        const columnsSpan = Math.floor((card.left + card.cardWidth) / HorizontalResizeStep);
        const columnHeight = card.cardHeight + card.top;
        for (let i = columnsStart; i < columnsSpan; i++) {
            this._columnsHeight[i] = columnHeight;
        }

        if (columnsStart === columnsSpan) {
            this._columnsHeight[columnsStart] = columnHeight;
        }
    }

    /**
     * @hidden Try to set card at available heights
     */
    private _setCardPositionValues(card: ResizableCardItemComponent, index: number): void {
        if (index === 0) {
            card.left = 0;
            card.top = 0;
            card.startingColumnPosition = 0;
            return;
        }

        const uniqueHeights = this._getSortedUniqueHeights();

        let cardPositioned = false;
        for (const height of uniqueHeights) {
            if (!cardPositioned) {
                cardPositioned = this._isPositionSetSuccess(height, card);
            } else {
                break;
            }
        }
    }

    /**
     * @hidden try to set card at given height
     */
    private _isPositionSetSuccess(height: number, card: ResizableCardItemComponent): boolean {
        const columnPositions = new Array();
        let index = 0;
        for (const columnHeight of this._columnsHeight) {
            index++;
            if (columnHeight === height) {
                columnPositions.push(index);
            }
        }

        // check for each card position, starting from leftmost
        let isFitting = false;
        let startingColumnPosition = -1;

        // try to fit as left as possible from the column position
        startingColumnPosition = this._fitLeftFromColumnPosition(card, columnPositions);
        // if not moving towards left. start from column position and check if fits.
        // try to set towards right from available card position
        if (startingColumnPosition === -1) {
            startingColumnPosition = this._fitRight(card, columnPositions, height);
        }

        if (startingColumnPosition !== -1) {
            isFitting = true;
            card.left = startingColumnPosition * HorizontalResizeStep;
            card.top = height;
            card.startingColumnPosition = startingColumnPosition;
        }
        return isFitting;
    }

    /** @hidden Try to start card position from left most fit position */
    private _fitLeftFromColumnPosition(card: ResizableCardItemComponent, columnPositions: Array<number>): number {
        // check for each card position, starting from leftmost
        let isFitting = false;
        let startingColumnPosition = -1;

        // start from previous indexes
        const cardColSpan = Math.floor(card.cardWidth / HorizontalResizeStep);

        // try to set towards left from available card position
        // eg. [1, 2, 3, 4] columnsPositions
        for (const columnPosition of columnPositions) {
            if (!isFitting) {
                // columnPosition-1 ->convert as index
                // columnPosition -1 - (numberOfCardColumns -1) at least 1 column of card on current column
                for (let i = columnPosition - cardColSpan; i < columnPosition - 1 && i > -1 && !isFitting; i++) {
                    // if previous column heights are less then card will fix starting from previous columns as well
                    if (this._columnsHeight[i] > this._columnsHeight[columnPosition - 1]) {
                        isFitting = false;
                        startingColumnPosition = -1;
                    } else {
                        isFitting = true;
                        startingColumnPosition = i;
                        if (startingColumnPosition + cardColSpan > this._columns) {
                            isFitting = false;
                            startingColumnPosition = -1;
                        }

                        // is whole width of card will fit
                        for (let columnIndex = 0; columnIndex < cardColSpan; columnIndex++) {
                            if (
                                this._columnsHeight[columnIndex + startingColumnPosition] >
                                this._columnsHeight[columnPosition - 1]
                            ) {
                                // not full width is fitting
                                isFitting = false;
                                startingColumnPosition = -1;
                            }
                        }
                    }
                }
            } else {
                break;
            }
        }
        return startingColumnPosition;
    }

    /** @hidden Try to fit right from the position */
    private _fitRight(card: ResizableCardItemComponent, columnPositions: Array<number>, height: number): number {
        // check for each card position, starting from leftmost
        let isFitting = false;
        let startingColumnPosition = -1;

        // start from previous indexes
        const cardColSpan = Math.floor(card.cardWidth / HorizontalResizeStep);

        for (const columnPosition of columnPositions) {
            if (!isFitting) {
                if (height === 0 && cardColSpan + columnPosition - 1 <= this._columns && !isFitting) {
                    isFitting = true;
                    startingColumnPosition = columnPosition - 1;
                    break;
                }

                // if card spans more than available columns. then it will not fit.
                if (columnPosition + cardColSpan - 1 > this._columns) {
                    isFitting = false;
                    startingColumnPosition = -1;
                    break;
                }

                if (cardColSpan > 1) {
                    // one column is at columnPosition. check rest card width also fit at this height.
                    for (let i = cardColSpan - 1; i > 0 && !isFitting; i--) {
                        if (this._columnsHeight[columnPosition - 1 + i] > this._columnsHeight[columnPosition - 1]) {
                            isFitting = false;
                            startingColumnPosition = -1;
                        } else {
                            isFitting = true;
                            startingColumnPosition = columnPosition - 1;

                            // is whole width of card will fit
                            for (let columnIndex = 0; columnIndex < cardColSpan; columnIndex++) {
                                if (
                                    this._columnsHeight[columnIndex + startingColumnPosition] >
                                    this._columnsHeight[columnPosition - 1]
                                ) {
                                    // not full width is fitting
                                    isFitting = false;
                                    startingColumnPosition = -1;
                                }
                            }
                        }
                    }
                } else {
                    isFitting = true;
                    startingColumnPosition = columnPosition - 1;
                }
            }
        }

        return startingColumnPosition;
    }

    /** @hidden returns sorted unique height of columns */
    private _getSortedUniqueHeights(): number[] {
        const tempArray = this._columnsHeight.slice();
        const sortedColumnsHeightArray = tempArray.sort(comparer);
        const uniqueHeights = new Array();

        for (const sortedHeight of sortedColumnsHeightArray) {
            if (uniqueHeights.indexOf(sortedHeight) === -1) {
                uniqueHeights.push(sortedHeight);
            }
        }
        function comparer(first: number, second: number): number {
            return first - second;
        }
        return uniqueHeights;
    }

    /** @hidden Comparator to sort card based on rank. */
    private _sortCards(firstCard: ResizableCardItemComponent, secondCard: ResizableCardItemComponent): number {
        return firstCard.rank - secondCard.rank;
    }
}
