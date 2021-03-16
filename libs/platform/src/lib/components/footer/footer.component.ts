import { Component, Input, TemplateRef, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'fdp-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FooterComponent {
    /** logo template accpets the generic html */
    @Input()
    logo: TemplateRef<any>;
    /** content template accpets the generic html */
    @Input()
    content: TemplateRef<any>;
    /** copyright template accpets the generic html */
    @Input()
    copyright: TemplateRef<any>;
}
