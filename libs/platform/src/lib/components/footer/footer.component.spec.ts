import { Component, ElementRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformLinkModule } from '../link/link.module';

import { FooterComponent } from './footer.component';
import { PlatformFooterModule } from './footer.module';

@Component({
    selector: 'fdp-link-test',
    template: `
        <fdp-footer [logo]="logo" [content]="content" [copyright]="copyright"></fdp-footer>
        <ng-template #logo>
            <img id="fd-logo-1" src="/assets/images/logo-sap.svg" alt="" />
        </ng-template>

        <ng-template #content>
            <fdp-link id="fd-link-test-1" href="/" title="footer link Supported Browser">Supported Browser</fdp-link>
            <fdp-link id="fd-link-test-2" href="/" title="footer link Security Disclosure"
                >Security Disclosure</fdp-link
            >
            <fdp-link id="fd-link-test-3" href="/" title="footer link Privacy Statement">Privacy Statement</fdp-link>
            <fdp-link id="fd-link-test-4" href="/" title="footer link Cookie Statement">Cookie Statement</fdp-link>
            <fdp-link id="fd-link-test-5" href="/" title="footer link Participant Team">Participant Team</fdp-link>
        </ng-template>

        <ng-template #copyright>
            <span>1996-2021 Ariba Inc. All Rights Reserved</span>
        </ng-template>
    `
})
class PlatformFooterTestComponent {
    @ViewChild(FooterComponent, { static: true, read: ElementRef })
    footerElementRef: ElementRef;
}

describe('FooterComponent', () => {
    let component: PlatformFooterTestComponent;
    let fixture: ComponentFixture<PlatformFooterTestComponent>;
    let footerEleRef: ElementRef;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PlatformFooterModule, PlatformLinkModule],
            declarations: [FooterComponent, PlatformFooterTestComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlatformFooterTestComponent);
        footerEleRef = fixture.componentInstance.footerElementRef;
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should create footer logo component', () => {
        const ele = footerEleRef.nativeElement.querySelector('.fdp-footer__logo');
        expect(ele).toBeTruthy();
    });

    it('should create footer icons component', () => {
        const ele = footerEleRef.nativeElement.querySelector('.fdp-footer__link');
        expect(ele).toBeTruthy();
    });
});
