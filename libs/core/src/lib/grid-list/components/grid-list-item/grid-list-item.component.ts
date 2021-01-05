import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ContentChild,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnChanges,
    OnDestroy,
    Output,
    SimpleChanges
} from '@angular/core';
import { Subscription } from 'rxjs';

import { parseLayoutPattern } from '../../helpers';
import { GridListSelectionActions, GridListSelectionService } from '../../services/grid-list-selection.service';
import { GridListItemToolbarComponent } from '../grid-list-item-toolbar';
import { GridListSelectionMode } from '../grid-list';
import { GridListItemFooterBarComponent } from '../grid-list-item-footer-bar';

let gridListItemUniqueId = 0;

export interface GridListItemOutputEvent<T> {
    index: number;
    value?: T;
}

export type GridListItemType = 'inactive' | 'active' | 'detail' | 'detailsAndActive' | 'navigation';
export type GridListItemState = 'unread' | 'locked' | 'error' | 'draft';
export type GridListItemStatus = 'success' | 'warning' | 'error' | 'neutral';

@Component({
    selector: 'fd-grid-list-item',
    templateUrl: './grid-list-item.component.html',
    styleUrls: ['./grid-list-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GridListItemComponent<T> implements OnChanges, AfterViewInit, OnDestroy {
    /** id for the Element */
    @Input()
    id = `fd-grid-list-item-${gridListItemUniqueId++}`;

    /** width of the element */
    @Input()
    @HostBinding('style.max-width')
    @HostBinding('style.min-width')
    width: string;

    /**
     * specify the cell layout in the format `XLn-Ln-Mn-Sn` where n is
     * the number of occupied columns and n can be different for each size.
     */
    @Input()
    layoutItemPattern: string;

    /**
     * Defines the status of Grid List Item
     * (Statuses: success | warning | error | neutral)
     */
    @Input()
    status?: GridListItemStatus;

    /** Sets number of subitems */
    @Input()
    counter: number;

    /**
     * Value field stores information for radio button value, checkbox button and for GridListSelectionEvent
     * The field is mandatory for modes like singleSelect, singleSelectLeft, singleSelectRight or multiSelect
     */
    @Input()
    value?: T;

    /** Allows an item to be selected programmatically */
    @Input()
    selected = false;

    /** Remove the padding from the Item body */
    @Input()
    noPadding = false;

    /** Sets the `aria-label` attribute to the element. */
    @Input()
    ariaLabel: string;

    /**
     * Defines the type of Grid List Item
     * Types:
     * - active: indicates that the item is clickable via active feedback when item is pressed
     * - detail: enables detail button of the list item that fires event.
     * - detailsAndActive: enables "detail" and "active" enumerations together
     * - inactive: indicates the list item does not have any active feedback when item is pressed
     * - navigation: indicates the list item is navigable to show extra information about the item
     * Default: inactive
     */
    @Input()
    type: GridListItemType = 'inactive';

    /**
     * Sets the state of Grid List Item
     * (States: unread | error | locked | draft)
     */
    @Input()
    state?: GridListItemState;

    /**
     * The navigated state of the list item.
     * If set to true, a navigation indicator is displayed at the end of the list item.
     */
    @Input()
    isNavigated = false;

    /**
     * Event is thrown, when type is active
     * and item is pressed
     */
    @Output()
    press = new EventEmitter<GridListItemOutputEvent<T>>();

    /**
     * Event is thrown, when type is detail or detailsAndActive
     * and Detail button was pressed
     */
    @Output()
    detail = new EventEmitter<GridListItemOutputEvent<T>>();

    /**
     * Event is thrown, when mode delete
     * and Delete button was pressed
     */
    @Output()
    delete = new EventEmitter<GridListItemOutputEvent<T>>();

    /**
     * Event is thrown, when type is navigation
     * and Navigate button was pressed
     */
    @Output()
    navigate = new EventEmitter<GridListItemOutputEvent<T>>();

    /**
     * Event is thrown, when state is error, not used GridListItemFooterBarComponent
     * and Draft button was pressed
     */
    @Output()
    draft = new EventEmitter<GridListItemOutputEvent<T>>();

    /**
     * Event is thrown, when state is locked, not used GridListItemFooterBarComponent
     * and Locked button was pressed
     */
    @Output()
    locked = new EventEmitter<GridListItemOutputEvent<T>>();

    /** @hidden */
    get gridLayoutClasses(): string {
        return this._gridLayoutClasses;
    }

    set gridLayoutClasses(value: string) {
        const el = this._elementRef.nativeElement;
        if (!this._gridLayoutClasses) {
            this._gridLayoutClasses = value;

            el.classList.add(...this._gridLayoutClasses.split(' '));

            return;
        }

        el.classList.remove(...this._gridLayoutClasses.split(' '));
        this._gridLayoutClasses = value;
        el.classList.add(...this._gridLayoutClasses.split(' '));
    }

    /** @hidden */
    @ContentChild(GridListItemFooterBarComponent)
    footerBarComponent: GridListItemFooterBarComponent;

    /** @hidden */
    @ContentChild(GridListItemToolbarComponent)
    itemToolbarComponent: GridListItemToolbarComponent;

    /** @hidden */
    _selectedItem?: T;

    /** @hidden */
    get selectionMode(): GridListSelectionMode {
        return this._selectionMode;
    }

    /** @hidden */
    set selectionMode(mode: GridListSelectionMode) {
        this._selectionMode = mode;

        if (mode !== 'delete' && mode !== 'none' && !this.value) {
            throw new Error('Grid List Item must have [value] attribute.');
        }

        if (this.selected) {
            const action = this.selectionMode !== 'multiSelect' ? null : GridListSelectionActions.ADD;
            const value = this.value;

            this._gridListSelectionService.setSelectedItem(value, this._index, action);
        }

        this._cd.detectChanges();
    }

    /** @hidden */
    _index?: number;

    /** @hidden */
    private _selectionMode?: GridListSelectionMode;

    /** @hidden */
    private _gridLayoutClasses?: string;

    /** @hidden */
    private readonly subscription = new Subscription();

    constructor(
        private readonly _cd: ChangeDetectorRef,
        private readonly _elementRef: ElementRef,
        private readonly _gridListSelectionService: GridListSelectionService<T>
    ) {
        const selectedItemsSub = this._gridListSelectionService.selectedItemsObs.subscribe((items) => {
            this._selectedItem = items.selection.find((item) => item === this.value);
            this._cd.markForCheck();
        });
        this.subscription.add(selectedItemsSub);
    }

    /** @hidden */
    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes.layoutItemPattern &&
            changes.layoutItemPattern.previousValue !== changes.layoutItemPattern.currentValue
        ) {
            this.gridLayoutClasses = parseLayoutPattern(this.layoutItemPattern, false);
        }
    }

    /** @hidden */
    ngAfterViewInit(): void {
        this._cd.detectChanges();
    }

    /** @hidden */
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    /** @hidden */
    _singleSelect(event: MouseEvent): void {
        this._preventDefault(event);

        this._gridListSelectionService.setSelectedItem(this.value, this._index);
    }

    /** @hidden */
    _selectionItem(value: number | T): void {
        const action =
            this.selectionMode !== 'multiSelect'
                ? null
                : value || value === 0
                ? GridListSelectionActions.ADD
                : GridListSelectionActions.REMOVE;

        this._gridListSelectionService.setSelectedItem(this.value, this._index, action);
    }

    /** @hidden */
    _onDetail(event: MouseEvent): void {
        this._preventDefault(event);

        this.detail.emit(this._outputEventValue);
    }

    /** @hidden */
    _onNavigate(event: MouseEvent): void {
        this._preventDefault(event);

        this.navigate.emit(this._outputEventValue);
    }

    /** @hidden */
    _onDelete(event: MouseEvent): void {
        this._preventDefault(event);

        this.delete.emit(this._outputEventValue);
    }

    /** @hidden */
    _clickOnDraft(event: MouseEvent): void {
        this._preventDefault(event);

        this.draft.emit(this._outputEventValue);
    }

    /** @hidden */
    _clickOnLocked(event: MouseEvent): void {
        event.stopPropagation();
        event.preventDefault();

        this.locked.emit(this._outputEventValue);
    }

    /** @hidden */
    _onClick(): void {
        if (this.type !== 'active' && this.type !== 'detailsAndActive') {
            return;
        }

        this.press.emit(this._outputEventValue);
    }

    /** @hidden */
    private _preventDefault(event: MouseEvent | Event): void {
        event.preventDefault();
        event.stopPropagation();
    }

    private get _outputEventValue(): GridListItemOutputEvent<T> {
        return {
             value: this.value,
             index: this._index
         }
     }
}
