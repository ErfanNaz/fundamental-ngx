import { ChangeDetectionStrategy, Component, Directive, Input, TemplateRef } from '@angular/core';

const DRAG_START_DELAY = 200;

@Directive({ selector: '[fdRsCardDef]' })
export class ResizableCardDefinitionDirective {
    constructor(public template: TemplateRef<any>) {}
}

@Component({
    selector: 'fd-resizable-card-layout',
    templateUrl: 'resizable-card-layout.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResizableCardLayoutComponent {
    @Input()
    draggable = true;
}
