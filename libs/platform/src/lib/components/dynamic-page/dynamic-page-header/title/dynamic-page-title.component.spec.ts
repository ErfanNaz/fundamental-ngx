import { ViewportRuler } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    BreadcrumbModule,
    ToolbarModule,
    ButtonModule,
    FacetModule,
    FacetComponent,
    AvatarModule
} from '@fundamental-ngx/core';
import { CLASS_NAME } from '../../constants';
import { PlatformDynamicPageModule } from '../../dynamic-page.module';
import { DynamicPageService } from '../../dynamic-page.service';
import { DynamicPageGlobalActionsComponent } from '../actions/global-actions/dynamic-page-global-actions.component';
import { DynamicPageLayoutActionsComponent } from '../actions/layout-actions/dynamic-page-layout-actions.component';
import { DynamicPageKeyInfoComponent } from '../key-info/dynamic-page-key-info.component';
import { DynamicPageTitleComponent } from './dynamic-page-title.component';

@Component({
    template: ` <fdp-dynamic-page-title [title]="title" [subtitle]="subtitle" [size]="size" [background]="background">
        <fd-breadcrumb>
            <fd-breadcrumb-item>
                <a fd-breadcrumb-link [attr.href]="'#'">Men</a>
            </fd-breadcrumb-item>
            <fd-breadcrumb-item>
                <a fd-breadcrumb-link [attr.href]="'#'">Shoes</a>
            </fd-breadcrumb-item>
        </fd-breadcrumb>

        <fd-facet type="image">
            <fd-avatar image="http://picsum.photos/id/1018/400" size="s"></fd-avatar>
        </fd-facet>
        <fdp-dynamic-page-key-info> </fdp-dynamic-page-key-info>
        <fdp-dynamic-page-global-actions>
                <!-- global actions -->
                <fd-toolbar fdType="transparent" [clearBorder]="true">
                </fd-toolbar>
            </fdp-dynamic-page-global-actions>
            <fdp-dynamic-page-layout-actions>
                <!-- layout actions -->
                <fd-toolbar fdType="transparent" [clearBorder]="true">
                </fd-toolbar>
            </fdp-dynamic-page-layout-actions>
    </fdp-dynamic-page-title>`
})
class TestComponent {
    title = 'Some title ';
    subtitle: string;
    size = 'medium';
    background = '';
    @ViewChild(DynamicPageTitleComponent) dynamicPageTitleComponent: DynamicPageTitleComponent;
    @ViewChild(DynamicPageKeyInfoComponent) dynamicPageKeyInfoComponent: DynamicPageKeyInfoComponent;
    @ViewChild(DynamicPageGlobalActionsComponent) dynamicPageGlobalActionsComponent: DynamicPageGlobalActionsComponent;
    @ViewChild(DynamicPageLayoutActionsComponent) dynamicPageLayoutActionsComponent: DynamicPageLayoutActionsComponent;
    @ViewChild(FacetComponent) facetComponent: FacetComponent;

    constructor(public dynamicPageService: DynamicPageService, public ruler: ViewportRuler) {}
}

describe('DynamicPageTitleComponent', () => {
    let fixture: ComponentFixture<TestComponent>;
    let pageTitleComponent: DynamicPageTitleComponent;
    let pageTitleKeyInfoComponent: DynamicPageKeyInfoComponent;
    let component: TestComponent;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [
                    CommonModule,
                    PlatformDynamicPageModule,
                    BreadcrumbModule,
                    ToolbarModule,
                    ButtonModule,
                    FacetModule,
                    AvatarModule
                ],
                declarations: [TestComponent],
                providers: [DynamicPageService, ViewportRuler]
            }).compileComponents();
        })
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        pageTitleComponent = component.dynamicPageTitleComponent;
    });

    it('should create', () => {
        expect(fixture).toBeTruthy();
    });

    it('should add correct classes to host', async () => {
        fixture.detectChanges();
        expect(
            pageTitleComponent.elementRef().nativeElement.classList.contains(CLASS_NAME.dynamicPageTitleArea)
        ).toBeTruthy();
    });

    it('should add tabindex to host', async () => {
        fixture.detectChanges();
        expect(pageTitleComponent.elementRef().nativeElement.getAttribute('tabindex')).toEqual('0');
    });

    describe('title text', () => {
        it('should bind to title', () => {
            component.title = 'Sample';
            fixture.detectChanges();
            expect(pageTitleComponent.title).toBe('Sample');
        });

        it('should render it in view', () => {
            component.title = 'Sample';
            fixture.detectChanges();
            const titleElement: HTMLElement = fixture.debugElement.query(By.css('.fd-dynamic-page__title'))
                .nativeElement;
            expect(titleElement?.innerText).toBe('Sample');
        });
    });
    describe('subtitle text', () => {
        it('should bind to title', () => {
            component.subtitle = 'Some subtitle';
            fixture.detectChanges();
            expect(pageTitleComponent.subtitle).toBe('Some subtitle');
        });

        it('should render it in view', () => {
            component.subtitle = 'Some subtitle';
            fixture.detectChanges();
            const titleElement: HTMLElement = fixture.debugElement.query(By.css('.fd-dynamic-page__subtitle'))
                .nativeElement;
            expect(titleElement?.innerText).toBe('Some subtitle');
        });
    });
      it('should add correct classes to toolbar', async () => {
        fixture.detectChanges();
        component.dynamicPageGlobalActionsComponent.ngAfterContentInit();
        const globalActionsContainer = fixture.debugElement.query(By.css('.' + CLASS_NAME.dynamicPageGlobalActions));
        expect(globalActionsContainer).toBeTruthy();

        component.dynamicPageLayoutActionsComponent.ngAfterContentInit();
        const layoutActionsContainer = fixture.debugElement.query(By.css('.' + CLASS_NAME.dynamicPageLayoutActions));
        expect(layoutActionsContainer).toBeTruthy();
    });
    
    it('should set key info class', async () => {
        pageTitleKeyInfoComponent = component.dynamicPageKeyInfoComponent;
        fixture.detectChanges();
        expect(
            fixture.debugElement
                .query(By.directive(DynamicPageKeyInfoComponent))
                .nativeElement.classList.contains(CLASS_NAME.dynamicPageKeyInfo)
        ).toBeTruthy();
    });

    it('should add facet classes', () => {
        const facetComponent = component.facetComponent;
        fixture.detectChanges();
        expect(facetComponent.elementRef().nativeElement.classList.contains('fd-margin-end--sm')).toBeTruthy();
        expect(facetComponent.elementRef().nativeElement.classList.contains('fd-margin-end--md')).toBeFalsy();
        expect(
            facetComponent.elementRef().nativeElement.classList.contains('fd-facet--image-header-title')
        ).toBeTruthy();
    });

    it('should handle collapse from service', () => {
        component.dynamicPageTitleComponent._isHeaderCollapsed = false;
        component.dynamicPageService.setCollapseValue(true);
        expect(component.dynamicPageTitleComponent._isHeaderCollapsed).toBeTrue();
    });

    it('should squash toolbar actions when the window is resized', () => {
        const spy = jasmine.createSpy('_squashActions');
        const subscription = component.ruler.change(0).subscribe(spy);
        spyOn(component.dynamicPageTitleComponent.elementRef().nativeElement, 'getBoundingClientRect')
        .and.returnValue({ top: 1, height: 100, left: 2, width: 200, right: 202, x: 0, y: 0, bottom: 0, toJSON: null });
        window.dispatchEvent(new Event('resize'));
        fixture.detectChanges();
        expect(spy).toHaveBeenCalled();
        subscription.unsubscribe();
    });
});
