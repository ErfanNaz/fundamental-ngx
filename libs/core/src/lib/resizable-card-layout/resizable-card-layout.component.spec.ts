import { Component } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CommonModule } from '@angular/common';

import { CardModule } from '../card/card.module';
import { ResizableCardLayoutComponent } from './resizable-card-layout.component';

@Component({
    template: `
        <fd-resizable-card-layout>
            <fd-card *fdRsCardDef="1">
                <fd-card-header>
                    <h2 fd-card-title>Card Title 1</h2>
                </fd-card-header>
                <fd-card-content>
                    <ul fd-list [noBorder]="true">
                        <li fd-list-item>
                            <span fd-list-title> item 1 </span>
                        </li>
                        <li fd-list-item>
                            <span fd-list-title> item 2 </span>
                        </li>
                        <li fd-list-item>
                            <span fd-list-title> item 3 </span>
                        </li>
                    </ul>
                </fd-card-content>
            </fd-card>

            <fd-card *fdRsCardDef="2">
                <fd-card-header>
                    <h2 fd-card-title>Card Title 2</h2>
                </fd-card-header>
                <fd-card-content>
                    <ul fd-list [noBorder]="true">
                        <li fd-list-item>
                            <span fd-list-title> item 1 </span>
                        </li>
                        <li fd-list-item>
                            <span fd-list-title> item 2 </span>
                        </li>
                        <li fd-list-item>
                            <span fd-list-title> item 3 </span>
                        </li>
                    </ul>
                </fd-card-content>
            </fd-card>
        </fd-resizable-card-layout>
    `
})
class TestResizableCardLayout {}

fdescribe('ResizableCardLayoutComponent', () => {
    let component: TestResizableCardLayout;
    let fixture: ComponentFixture<TestResizableCardLayout>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [ResizableCardLayoutComponent, TestResizableCardLayout],
                imports: [CommonModule, CardModule]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(TestResizableCardLayout);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
