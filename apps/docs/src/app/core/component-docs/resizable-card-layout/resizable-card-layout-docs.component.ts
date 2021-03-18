import { Component } from '@angular/core';

import * as defaultResizeCardHtml from '!raw-loader!./examples/resizable-card-layout-example.component.html';
import * as defaultResizeCardTs from '!raw-loader!./examples/resizable-card-layout-example.component.ts';
import * as defaultResizeCardLayoutHtml from '!raw-loader!./examples/resizable-card-layout-example-layoutconfig.component.html';
import * as defaultResizeCardLayoutTs from '!raw-loader!./examples/resizable-card-layout-example-layoutconfig.component.ts';
import * as defaultResizeCardItemHtml from '!raw-loader!./examples/resizable-card-layout-example-itemconfig.component.html';
import * as defaultResizeCardItemTs from '!raw-loader!./examples/resizable-card-layout-example-itemconfig.component.ts';

import { ExampleFile } from '../../../documentation/core-helpers/code-example/example-file';

@Component({
    selector: 'app-rating-indicator',
    templateUrl: './resizable-card-layout-docs.component.html'
})
export class ResizableCardLayoutDocsComponent {
    resizableCardLayoutDefault: ExampleFile[] = [
        {
            language: 'html',
            code: defaultResizeCardHtml,
            fileName: 'resizable-card-layout-example',
            typescriptFileCode: defaultResizeCardTs,
            component: 'ResizableCardLayoutExampleComponent'
        }
    ];

    resizableCardLayoutLayoutConfig: ExampleFile[] = [
        {
            language: 'html',
            code: defaultResizeCardLayoutHtml,
            fileName: 'resizable-card-layout-example-layoutconfig',
            typescriptFileCode: defaultResizeCardLayoutTs,
            component: 'ResizableCardLayoutExampleLayoutConfigComponent'
        }
    ];

    resizableCardLayoutItemConfig: ExampleFile[] = [
        {
            language: 'html',
            code: defaultResizeCardItemHtml,
            fileName: 'resizable-card-layout-example-itemconfig',
            typescriptFileCode: defaultResizeCardItemTs,
            component: 'ResizableCardLayoutExampleItemConfigComponent'
        }
    ];
}
