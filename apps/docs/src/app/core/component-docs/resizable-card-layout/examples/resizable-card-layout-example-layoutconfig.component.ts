import { ChangeDetectionStrategy, Component, OnInit, TemplateRef } from '@angular/core';
import { DialogService, ResizableCardLayoutConfig, LayoutSize } from '@fundamental-ngx/core';

@Component({
    selector: 'fd-resizable-card-layout-example-layoutconfig',
    templateUrl: './resizable-card-layout-example-layoutconfig.component.html',
    styleUrls: ['./resizable-card-layout-example-layoutconfig.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableCardLayoutExampleLayoutConfigComponent implements OnInit {
    layoutConfig: ResizableCardLayoutConfig;
    layoutSize: LayoutSize;

    constructor(private _dialogService: DialogService) {}

    ngOnInit(): void {
        this.layoutConfig = [
            {
                title: 'card1',
                rank: 1,
                cardWidthColSpan: 1,
                cardHeightRowSpan: 25,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 12,
                resizable: true
            },
            {
                title: 'card2',
                rank: 2,
                cardWidthColSpan: 1,
                cardHeightRowSpan: 18,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 8,
                resizable: true
            },
            {
                title: 'card3',
                rank: 3,
                cardWidthColSpan: 2,
                cardHeightRowSpan: 20,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 8,
                resizable: true
            },
            {
                title: 'card4',
                rank: 4,
                cardWidthColSpan: 2,
                cardHeightRowSpan: 12,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 8,
                resizable: true
            },
            {
                title: 'card5',
                rank: 5,
                cardWidthColSpan: 1,
                cardHeightRowSpan: 12,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 8,
                resizable: true
            },
            {
                title: 'card6',
                rank: 6,
                cardWidthColSpan: 2,
                cardHeightRowSpan: 12,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 8,
                resizable: true
            },
            {
                title: 'card7',
                rank: 7,
                cardWidthColSpan: 2,
                cardHeightRowSpan: 12,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 8,
                resizable: true
            }
        ];
    }

    openDialog(dialogTemplate: TemplateRef<any>): void {
        this._dialogService.open(dialogTemplate, {
            mobile: true,
            verticalPadding: true
        });
    }
}
