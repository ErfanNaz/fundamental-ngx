import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input } from '@angular/core';
import { FocusableOption } from '@angular/cdk/a11y';

@Component({
    selector: 'fd-resizable-card-item',
    templateUrl: 'resizable-card-item.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableCardItemComponent implements FocusableOption {
    @Input()
    resizable = true;

    constructor(private _changeDetectorRef: ChangeDetectorRef, private _element: ElementRef) {}

    /** Sets focus on the element */
    focus(): void {
        this._element.nativeElement.focus();
    }
}
