import { ChangeDetectionStrategy, Component, OnInit, TemplateRef } from '@angular/core';
import { DialogService, ResizableCardLayoutConfig, LayoutSize } from '@fundamental-ngx/core';

@Component({
    selector: 'fd-resizable-card-layout-example-itemconfig',
    templateUrl: './resizable-card-layout-example-itemconfig.component.html',
    styleUrls: ['./resizable-card-layout-example-itemconfig.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableCardLayoutExampleItemConfigComponent implements OnInit {
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
                cardMiniContentRowSpan: 10,
                resizable: true
            },
            {
                title: 'card2',
                rank: 2,
                cardWidthColSpan: 1,
                cardHeightRowSpan: 18,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 10,
                resizable: true
            },
            {
                title: 'card3',
                rank: 3,
                cardWidthColSpan: 2,
                cardHeightRowSpan: 20,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 10,
                resizable: true
            },
            {
                title: 'card4',
                rank: 4,
                cardWidthColSpan: 2,
                cardHeightRowSpan: 12,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 10,
                resizable: true
            },
            {
                title: 'card5',
                rank: 5,
                cardWidthColSpan: 1,
                cardHeightRowSpan: 12,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 10,
                resizable: true
            },
            {
                title: 'card6',
                rank: 6,
                cardWidthColSpan: 2,
                cardHeightRowSpan: 12,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 10,
                resizable: true
            },
            {
                title: 'card7',
                rank: 7,
                cardWidthColSpan: 2,
                cardHeightRowSpan: 12,
                cardMiniHeaderRowSpan: 5,
                cardMiniContentRowSpan: 10,
                resizable: true
            }
        ];
    }

    openDialog(dialogTemplate: TemplateRef<any>): void {
        let width: string;
        let height: string;

        switch (this.layoutSize) {
            case 'sm':
                width = '320px';
                height = '900px';
                break;
            case 'md':
                width = '672px';
                height = '900px';
                break;
            case 'lg':
                width = '960px';
                height = '900px';
                break;
            case 'xl':
                width = '1280px';
                height = '900px';
                break;
        }
        this._setUpDialog(dialogTemplate, width, height);
    }

    private _setUpDialog(dialogTemplate: TemplateRef<any>, width: string, height: string): void {
        this._dialogService.open(dialogTemplate, {
            mobile: true,
            verticalPadding: true
        });
    }
}
