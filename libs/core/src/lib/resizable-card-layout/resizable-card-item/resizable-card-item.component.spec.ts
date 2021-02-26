import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component, QueryList, ViewChildren } from '@angular/core';

import { ResizableCardItemComponent } from './resizable-card-item.component';
import { CardModule } from '../../card/card.module';

@Component({
    template: `
        <fd-resizable-card-item [config]="config"> 1 </fd-resizable-card-item>
        <fd-resizable-card-item cardWidth="640" cardHeight="290" left="400" top="0"> 2 </fd-resizable-card-item>
    `
})
class TestResizableCardItemComponent {
    config = {
        title: 'card1',
        rank: 1,
        cardWidth: 320,
        cardHeight: 400,
        miniHeaderHeight: 80,
        miniContentHeight: 150,
        resizable: true
    };

    @ViewChildren(ResizableCardItemComponent)
    items: QueryList<ResizableCardItemComponent>;
}

describe('ResizableCardItemComponent', () => {
    let component: TestResizableCardItemComponent;
    let fixture: ComponentFixture<TestResizableCardItemComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ResizableCardItemComponent, TestResizableCardItemComponent],
                imports: [CommonModule, CardModule]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(TestResizableCardItemComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should increase width in step of 20 rem and height in step of 1rem', () => {
        const mouseEvent1 = new MouseEvent('changeWidth', { clientX: 100, clientY: 20 });
        const card = component.items.toArray()[0];

        card.onMouseDown(mouseEvent1, 'both');
        const mouseEvent2 = new MouseEvent('changeWidth', { clientX: 200, clientY: 40 });
        card.onMouseMove(mouseEvent2);
        card.onMouseUp(mouseEvent2);

        expect(card.cardWidth).toEqual(640);
        expect(card.cardHeight).toEqual(432);

        fixture.detectChanges();
    });

    it('should decrease width in step of 20 rem and height in step of 1rem', () => {
        const mouseEvent1 = new MouseEvent('changeWidth', { clientX: 200, clientY: 40 });
        const card = component.items.toArray()[1];

        card.onMouseDown(mouseEvent1, 'both');
        const mouseEvent2 = new MouseEvent('changeWidth', { clientX: 100, clientY: 20 });
        card.onMouseMove(mouseEvent2);
        card.onMouseUp(mouseEvent2);

        expect(card.cardWidth).toEqual(320);
        expect(card.cardHeight).toEqual(256);

        fixture.detectChanges();
    });

    it('should emit resized event when resizing is completed', () => {
        const mouseEvent1 = new MouseEvent('resize', { clientX: 200, clientY: 40 });
        const card = component.items.toArray()[1];
        const cardResized = spyOn(card.resized, 'emit');

        card.onMouseDown(mouseEvent1, 'both');
        const mouseEvent2 = new MouseEvent('resize', { clientX: 100, clientY: 20 });
        card.onMouseMove(mouseEvent2);
        card.onMouseUp(mouseEvent2);
        fixture.detectChanges();
        expect(cardResized).toHaveBeenCalled();
    });

    it('should emit stepChange event when card width increased in step', () => {
        const mouseEvent1 = new MouseEvent('resize', { clientX: 200, clientY: 40 });
        const card = component.items.toArray()[1];
        const stepChanged = spyOn(card.stepChange, 'emit');

        card.onMouseDown(mouseEvent1, 'both');
        const mouseEvent2 = new MouseEvent('resize', { clientX: 600, clientY: 40 });
        card.onMouseMove(mouseEvent2);
        card.onMouseUp(mouseEvent2);
        fixture.detectChanges();

        expect(card.cardWidth).toEqual(1280);
        expect(card.cardHeight).toEqual(290);
        expect(stepChanged).toHaveBeenCalled();
    });

    it('should emit stepChange event when card height increased in step', () => {
        const mouseEvent1 = new MouseEvent('resize', { clientX: 200, clientY: 40 });
        const card = component.items.toArray()[1];
        const stepChanged = spyOn(card.stepChange, 'emit');

        card.onMouseDown(mouseEvent1, 'both');
        const mouseEvent2 = new MouseEvent('resize', { clientX: 200, clientY: 60 });
        card.onMouseMove(mouseEvent2);
        card.onMouseUp(mouseEvent2);
        fixture.detectChanges();

        expect(card.cardWidth).toEqual(640);
        expect(card.cardHeight).toEqual(320);
        expect(stepChanged).toHaveBeenCalled();
    });

    it('should emit stepChange event when card width decreased in step', () => {
        const mouseEvent1 = new MouseEvent('resize', { clientX: 200, clientY: 40 });
        const card = component.items.toArray()[1];
        const stepChanged = spyOn(card.stepChange, 'emit');

        card.onMouseDown(mouseEvent1, 'both');
        const mouseEvent2 = new MouseEvent('resize', { clientX: 100, clientY: 40 });
        card.onMouseMove(mouseEvent2);
        card.onMouseUp(mouseEvent2);
        fixture.detectChanges();

        expect(card.cardWidth).toEqual(320);
        expect(card.cardHeight).toEqual(290);
        expect(stepChanged).toHaveBeenCalled();
    });

    it('should emit stepChange event when card height decreased in step', () => {
        const mouseEvent1 = new MouseEvent('resize', { clientX: 200, clientY: 40 });
        const card = component.items.toArray()[1];
        const stepChanged = spyOn(card.stepChange, 'emit');

        card.onMouseDown(mouseEvent1, 'both');
        const mouseEvent2 = new MouseEvent('resize', { clientX: 200, clientY: 20 });
        card.onMouseMove(mouseEvent2);
        card.onMouseUp(mouseEvent2);
        fixture.detectChanges();

        expect(card.cardWidth).toEqual(640);
        expect(card.cardHeight).toEqual(256);
        expect(stepChanged).toHaveBeenCalled();
    });

    it('should adjust max card width 320 for sm layout size', () => {
        const card = component.items.toArray()[1];
        card.cardWidth = 1280; // four column width card

        const layoutSize = 'sm';
        card.verifyUpdateCardWidth(layoutSize);
        expect(card.cardWidth).toEqual(320);
    });

    it('should adjust max card width 640 for md layout size', () => {
        const card = component.items.toArray()[1];
        card.cardWidth = 1280;

        const layoutSize = 'md';
        card.verifyUpdateCardWidth(layoutSize);
        expect(card.cardWidth).toEqual(640);
    });

    it('should adjust max card width 960 for lg layout size', () => {
        const card = component.items.toArray()[1];
        card.cardWidth = 1280;

        const layoutSize = 'lg';
        card.verifyUpdateCardWidth(layoutSize);
        expect(card.cardWidth).toEqual(960);
    });

    it('should adjust max card width 1280 for xl layout size', () => {
        const card = component.items.toArray()[1];
        card.cardWidth = 1380;

        const layoutSize = 'xl';
        card.verifyUpdateCardWidth(layoutSize);
        expect(card.cardWidth).toEqual(1280);
    });
});
