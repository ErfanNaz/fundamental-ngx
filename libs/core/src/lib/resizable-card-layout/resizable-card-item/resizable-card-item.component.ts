import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    QueryList,
    Renderer2,
    ViewChild
} from '@angular/core';
import { FocusableOption } from '@angular/cdk/a11y';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, skipUntil, takeUntil } from 'rxjs/operators';

import { CornerResizeDirective } from '../directives/resize-icon.directive';

export type ResizeDirection = 'vertical' | 'horizontal' | 'both';

@Component({
    selector: 'fd-resizable-card-item',
    templateUrl: 'resizable-card-item.component.html',
    styleUrls: ['./resizable-card-item.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableCardItemComponent implements OnInit, AfterViewInit, OnDestroy, FocusableOption {
    @Input()
    id: string;

    @Input()
    forceRender = false;

    @Input()
    resizable = true;

    @Input()
    resizeBoth = true;

    @Input()
    resizeHorizontal = false;

    @Input()
    resizeVertical = false;

    @ViewChild('cornerHandle')
    cornerHandle: ElementRef;

    @ViewChild('horizontalHandle')
    horizontalHandle: ElementRef;

    @ViewChild('verticalHandle')
    verticalHandle: ElementRef;

    @ViewChild('resizeCard')
    cardElementRef: ElementRef;

    showResizeIcon = true;
    cardWidth: number;
    cardHeight: number;

    private verticalHandleSub: Subscription = Subscription.EMPTY;
    private horizontalHandleSub: Subscription = Subscription.EMPTY;
    private cornerHandleSub: Subscription = Subscription.EMPTY;

    private _prevX: number;
    private _prevY: number;
    private _resize = false;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private _renderer: Renderer2
    ) {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {}

    ngOnDestroy(): void {
        this.verticalHandleSub.unsubscribe();
        this.horizontalHandleSub.unsubscribe();
    }

    onMouseDown(event: MouseEvent, resizeDirection: ResizeDirection): void {
        event.preventDefault();
        this._resize = true;
        this._prevX = event.clientX;
        this._prevY = event.clientY;
        this.cardWidth = this.cardElementRef.nativeElement.getBoundingClientRect().width;
        this.cardHeight = this.cardElementRef.nativeElement.getBoundingClientRect().height;
        console.log('onMouseDown resizeDirection: ', resizeDirection);
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        console.log('onMouseMove: ');
        event.preventDefault();
        if (!this._resize) {
            return;
        }
        // console.log('onMouseMove resizeDirection: ', resizeDirection);
        console.log('initial this.cardWidth: ', this.cardWidth);
        console.log('this._prevX: ', this._prevX);
        console.log('event.clientX: ', event.clientX);

        // if (resizeDirection === 'both') {
            this.cardWidth = this.cardWidth - (this._prevX - event.clientX);
            this.cardHeight = this.cardHeight - (this._prevY - event.clientY);
        // } else if (resizeDirection === 'horizontal') {
        //     this.cardWidth = this.cardWidth - (this._prevX - event.clientX);
        // } else {
        //     this.cardHeight = this.cardHeight - (this._prevY - event.clientY);
        // }
        // console.log('final this.cardWidth: ', this.cardWidth);
        this._prevX = event.clientX;
        this._prevY = event.clientY;
    }

    onMouseUp(event: MouseEvent, resizeDirection: ResizeDirection): void {
        this._resize = false;
        console.log('onMouseUp resizeDirection: ', resizeDirection);
    }

    /** Sets focus on the element */
    focus(): void {
        this._elementRef.nativeElement.focus();
    }

    onMouseOver(event: MouseEvent): void {
        // this.showResizeIcon = true;
        // this._changeDetectorRef.markForCheck();
        // console.log('mouse over cornerHandle: ', this.cornerHandle);
    }

    onMouseOut(event: MouseEvent): void {
        // this.showResizeIcon = false;
        // this._changeDetectorRef.markForCheck();
        // this.cornerHandleSub.unsubscribe();
    }
}
