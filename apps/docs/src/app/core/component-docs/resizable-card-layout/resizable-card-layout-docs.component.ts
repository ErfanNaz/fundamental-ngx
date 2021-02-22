import { Component } from '@angular/core';

import * as defaultResizeCardHtml from '!raw-loader!./examples/resizable-card-layout-example.component.html';
import * as defaultResizeCardTs from '!raw-loader!./examples/resizable-card-layout-example.component.ts';

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
}
