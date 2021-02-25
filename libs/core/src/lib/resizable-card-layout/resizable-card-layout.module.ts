import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { CardModule } from '../card/card.module';

import { ResizableCardItemComponent } from './resizable-card-item/resizable-card-item.component';
import { ResizableCardLayoutComponent, ResizableCardDefinitionDirective } from './resizable-card-layout.component';
import { CornerResizeDirective } from './directives/resize-icon.directive';

@NgModule({
    imports: [CommonModule, CardModule, DragDropModule],
    declarations: [
        CornerResizeDirective,
        ResizableCardLayoutComponent,
        ResizableCardItemComponent,
        ResizableCardDefinitionDirective
    ],
    exports: [ResizableCardLayoutComponent, ResizableCardItemComponent, ResizableCardDefinitionDirective]
})
export class ResizableCardLayoutModule {}
