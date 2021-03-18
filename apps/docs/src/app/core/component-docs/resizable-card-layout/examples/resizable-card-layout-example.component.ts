import { ChangeDetectionStrategy, Component, OnInit, TemplateRef } from '@angular/core';
import { DialogService, ResizableCardLayoutConfig, LayoutSize } from '@fundamental-ngx/core';

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
            verticalPadding: true,
        });
    }
}
