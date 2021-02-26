import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { CardModule } from '../card/card.module';

import { ResizableCardItemComponent } from './resizable-card-item/resizable-card-item.component';
import { ResizableCardLayoutComponent } from './resizable-card-layout.component';

@NgModule({
    imports: [CommonModule, CardModule, DragDropModule],
    declarations: [ResizableCardLayoutComponent, ResizableCardItemComponent],
    exports: [ResizableCardLayoutComponent, ResizableCardItemComponent]
})
export class ResizableCardLayoutModule {}
