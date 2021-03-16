import { Component } from '@angular/core';

import { ExampleFile } from '../../../documentation/core-helpers/code-example/example-file';

import * as platformFooterExampleHtml from '!raw-loader!./platform-footer-example/platform-footer-example.component.html';
import * as platformFooterWithIconHtml from '!raw-loader!./platform-footer-example/platform-footer-with-icon-example.component.html';
import * as platformFooterWithMultipleLineHtml from '!raw-loader!./platform-footer-example/platform-footer-multiple-line-example.component.html';

@Component({
    selector: 'fdp-platform-footer-docs',
    templateUrl: './platform-footer-docs.component.html'
})
export class PlatformFooterDocsComponent {
    PlatformDefaultFooter: ExampleFile[] = [
        {
            language: 'html',
            code: platformFooterExampleHtml,
            fileName: 'platform-footer-example'
        }
    ];
    PlatformMultiLineFooter: ExampleFile[] = [
        {
            language: 'html',
            code: platformFooterWithMultipleLineHtml,
            fileName: 'platform-footer-multiple-line-example'
        }
    ];
    PlatformWithIconFooter: ExampleFile[] = [
        {
            language: 'html',
            code: platformFooterWithIconHtml,
            fileName: 'platform-footer-with-icon-example'
        }
    ];
}
