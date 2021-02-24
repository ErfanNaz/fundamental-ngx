import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
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
    cardWidth: string;
    cardHeight: string;

    private verticalHandleSub: Subscription = Subscription.EMPTY;
    private horizontalHandleSub: Subscription = Subscription.EMPTY;
    private cornerHandleSub: Subscription = Subscription.EMPTY;

    private _prevX: number;
    private _prevY: number;
    private _resizeStart = false;

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _elementRef: ElementRef,
        private _renderer: Renderer2
    ) {}

    ngOnInit(): void {}

    ngAfterViewInit(): void {
        this.register();

        const rect = this.cardElementRef.nativeElement.getBoundingClientRect();
        console.log('ngAfterViewInit rect: ', rect);
        this._prevX = rect.x;
        this._prevY = rect.y;
    }

    ngOnDestroy(): void {
        this.verticalHandleSub.unsubscribe();
        this.horizontalHandleSub.unsubscribe();
    }

    register(): void {
        try {
            this.verticalHandleSub.unsubscribe();
            this.horizontalHandleSub.unsubscribe();
            this.cornerHandleSub.unsubscribe();
        } catch (err) {
        } finally {
        }

        const verticalHandleEle = this.verticalHandle.nativeElement;
        fromEvent(verticalHandleEle, 'mousedown').subscribe((e: any) => {
            this._prevX = e.clientX;
            this._prevY = e.clientY;
        });
        this.verticalHandleSub = fromEvent(verticalHandleEle, 'mousemove')
            .pipe(skipUntil(fromEvent(verticalHandleEle, 'mousedown')))
            .pipe(takeUntil(fromEvent(verticalHandleEle, 'mouseup')))
            .subscribe((e: any) => {
                this._horizontalResize(e);
            });

        const horizontalHandleEle = this.horizontalHandle.nativeElement;
        fromEvent(horizontalHandleEle, 'mousedown').subscribe((e: any) => {
            this._prevX = e.clientX;
            this._prevY = e.clientY;
        });
        this.horizontalHandleSub = fromEvent(horizontalHandleEle, 'mousemove')
            .pipe(skipUntil(fromEvent(horizontalHandleEle, 'mousedown')))
            .pipe(takeUntil(fromEvent(horizontalHandleEle, 'mouseup')))
            .subscribe((e: any) => {
                this._verticalResize(e);
            });

        const cornerHandleEle = this.cornerHandle.nativeElement;
        fromEvent(cornerHandleEle, 'mousedown').subscribe((e: any) => {
            this._prevX = e.clientX;
            this._prevY = e.clientY;
        });
        this.cornerHandleSub = fromEvent(cornerHandleEle, 'mousemove')
            .pipe(skipUntil(fromEvent(cornerHandleEle, 'mousedown')))
            .pipe(takeUntil(fromEvent(cornerHandleEle, 'mouseup')))
            .subscribe((e: any) => {
                this._cornerResize(e);
            });
    }

    private _horizontalResize(event: any): void {
        const rect = this.cardElementRef.nativeElement.getBoundingClientRect();
        console.log('_horizontalResize rect: ', rect);
        console.log('_horizontalResize this._prevX: ', this._prevX);
        console.log('_horizontalResize event.clientX: ', event.clientX);
        this.cardWidth = rect.width - (this._prevX - event.clientX) + 'px';
        // this.cardHeight = rect.height - (this._prevY - event.clientY) + "px";

        console.log('this.cardWidth: ', this.cardWidth);
        // console.log('this.cardHeight: ', this.cardHeight);

        this._prevX = event.clientX;
        // this._prevY = event.clientY;
        this._changeDetectorRef.markForCheck();
    }

    private _verticalResize(event: any): void {
        const rect = this.cardElementRef.nativeElement.getBoundingClientRect();

        // this.cardWidth = rect.width - (this._prevX - event.clientX) + "px";
        this.cardHeight = rect.height - (this._prevY - event.clientY) + 'px';

        // console.log('this.cardWidth: ', this.cardWidth);
        console.log('this.cardHeight: ', this.cardHeight);

        // this._prevX = event.clientX;
        this._prevY = event.clientY;

        this._changeDetectorRef.markForCheck();
    }

    private _cornerResize(event: any): void {
        const rect = this.cardElementRef.nativeElement.getBoundingClientRect();

        this.cardWidth = rect.width - (this._prevX - event.clientX) + 'px';
        this.cardHeight = rect.height - (this._prevY - event.clientY) + 'px';

        console.log('this.cardWidth: ', this.cardWidth);
        console.log('this.cardHeight: ', this.cardHeight);

        this._prevX = event.clientX;
        this._prevY = event.clientY;

        this._changeDetectorRef.markForCheck();
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
