import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    Renderer2,
    TemplateRef,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import { TabPanelComponent } from '@fundamental-ngx/core';

import { CLASS_NAME } from '../constants';
import { addClassNameToElement } from '../utils';

/** Dynamic Page tab change event */
export class DynamicPageTabChangeEvent {
    constructor(public source: DynamicPageContentComponent, public payload: TabPanelComponent) {}
}
@Component({
    selector: 'fdp-dynamic-page-content',
    templateUrl: './dynamic-page-content.component.html',
    styleUrls: ['./dynamic-page-content.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None
})
export class DynamicPageContentComponent implements OnInit {
    /**
     * label for the tab. If label is provided, tab navigation will be internally set up.
     */
    @Input()
    tabLabel: string;

    /**
     * a unique identifier for this content
     */
    @Input()
    id: string;

    /**
     * event for tab changes
     */
    @Output()
    tabChange: EventEmitter<DynamicPageTabChangeEvent> = new EventEmitter<DynamicPageTabChangeEvent>();

    /**
     * the underlying content template
     */
    @ViewChild(TemplateRef) contentTemplate: TemplateRef<any>;

    /** @hidden */
    constructor(public _elementRef: ElementRef<HTMLElement>, public _renderer: Renderer2) {}

    /**@hidden */
    ngOnInit(): void {
        this._addClassNameToHostElement(CLASS_NAME.dynamicPageContent);
    }

    /**
     * get reference to this element
     */
    getElementRef(): ElementRef<HTMLElement> {
        return this._elementRef;
    }

    /**@hidden */
    private _addClassNameToHostElement(className: string): void {
        addClassNameToElement(this._renderer, this._elementRef.nativeElement, className);
    }
}
