import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    CLASS_NAME,
    DynamicPageService,
    DynamicPageTabbedContentComponent,
    PlatformDynamicPageModule
} from '@fundamental-ngx/platform';

@Component({
    template: ` <fdp-dynamic-page-tabbed-content>
        This is a tabbed content
    </fdp-dynamic-page-tabbed-content>`
})
class TestTabbedContentComponent {
    size = 'medium';
    background = '';
    @ViewChild(DynamicPageTabbedContentComponent) dynamicPageTabbedContentComponent: DynamicPageTabbedContentComponent;
}

describe('DynamicPageTabbedContentComponent', () => {
    let fixture: ComponentFixture<TestTabbedContentComponent>;
    let component: TestTabbedContentComponent;
    let dynamicPageTabbedContentComponent: DynamicPageTabbedContentComponent;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule, PlatformDynamicPageModule],
            declarations: [TestTabbedContentComponent],
            providers: [DynamicPageService]
        }).compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(TestTabbedContentComponent);
        component = fixture.componentInstance;
        dynamicPageTabbedContentComponent = component.dynamicPageTabbedContentComponent;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(fixture).toBeTruthy();
    });

    describe('tabs and tab content', () => {
        it('should set correct class', async () => {
            fixture.detectChanges();
            const tabsContentContainer = fixture.debugElement.query(By.css('.' + CLASS_NAME.dynamicPageContent))
                .nativeElement;
            expect(tabsContentContainer).toBeTruthy();
        });
    });

    it('should render content in view', async () => {
        fixture.detectChanges();
        expect(component.dynamicPageTabbedContentComponent.getElementRef().nativeElement.innerText).toBe(
            'This is a tabbed content'
        );
    });
});
