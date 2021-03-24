import { ChangeDetectionStrategy, Component, OnInit, TemplateRef } from '@angular/core';
import {
    DialogService,
    ResizableCardLayoutConfig,
    LayoutSize,
    ResizedEvent,
    ResizingEvent
} from '@fundamental-ngx/core';

@Component({
    selector: 'fd-resizable-card-layout-example',
    templateUrl: './resizable-card-layout-example.component.html',
    styleUrls: ['./resizable-card-layout-example.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableCardLayoutExampleComponent implements OnInit {
    layoutConfig: ResizableCardLayoutConfig;
    layoutSize: LayoutSize;

    constructor(private _dialogService: DialogService) {}

    ngOnInit(): void {}

    openDialog(dialogTemplate: TemplateRef<any>): void {
        this._dialogService.open(dialogTemplate, {
            mobile: true,
            verticalPadding: true
        });
    }

    onCardResizing(event: ResizingEvent): void {
        console.log('onCardResizing event emitted: ', event);
    }

    onCardResized(event: ResizedEvent): void {
        console.log('onCardResized event emitted: ', event);
    }

    onStepChange(event: ResizedEvent): void {
        console.log('onStepChange event emitted: ', event);
    }

    onMiniHeaderReached(event: ResizedEvent): void {
        console.log('onMiniHeaderReached event emitted: ', event);
    }

    onMiniContentReached(event: ResizedEvent): void {
        console.log('onMiniContentReached event emitted: ', event);
    }
}
