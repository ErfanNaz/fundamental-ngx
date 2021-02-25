import {
    ChangeDetectionStrategy,
    Component,
    ContentChildren,
    Directive,
    Input,
    QueryList,
    TemplateRef,
    ViewChildren
} from '@angular/core';

import { ResizableCardItemComponent } from './resizable-card-item/resizable-card-item.component';

const DRAG_START_DELAY = 200;
export type LayoutSize = 'sm' | 'md' | 'lg';

@Directive({ selector: '[fdRsCardDef]' })
export class ResizableCardDefinitionDirective {
    constructor(public template: TemplateRef<any>) {}
}

@Component({
    selector: 'fd-resizable-card-layout',
    templateUrl: 'resizable-card-layout.component.html',
    styleUrls: ['./resizable-card-layout.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableCardLayoutComponent {
    @Input()
    draggable = true;

    @ViewChildren(ResizableCardItemComponent)
    resizeCardItems: QueryList<ResizableCardItemComponent>;

    /** @hidden */
    @ContentChildren(ResizableCardDefinitionDirective)
    cards: QueryList<ResizableCardDefinitionDirective>;

    public layoutSize: LayoutSize = 'md';
}
