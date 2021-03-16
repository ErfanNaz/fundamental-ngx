import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PlatformFooterModule, PlatformLinkModule } from '@fundamental-ngx/platform';

import { PlatformFooterDocsComponent } from './platform-footer-docs.component';
import {
    PlatformFooterExampleComponent,
    PlatformFooterMultipleLineExampleComponent,
    PlatformFooterWithIconExampleComponent
} from './platform-footer-example/platform-footer-example.component';
import { ApiComponent } from '../../../documentation/core-helpers/api/api.component';
import { API_FILES } from '../../api-files';
import { SharedDocumentationPageModule } from '../../../documentation/shared-documentation-page.module';
import { PlatformFooterHeaderComponent } from './platform-footer-header/platform-footer-header.component';

const routes: Routes = [
    {
        path: '',
        component: PlatformFooterHeaderComponent,
        children: [
            { path: '', component: PlatformFooterDocsComponent },
            { path: 'api', component: ApiComponent, data: { content: API_FILES.footer } }
        ]
    }
];

@NgModule({
    declarations: [
        PlatformFooterDocsComponent,
        PlatformFooterHeaderComponent,
        PlatformFooterExampleComponent,
        PlatformFooterWithIconExampleComponent,
        PlatformFooterMultipleLineExampleComponent
    ],
    exports: [RouterModule],
    imports: [RouterModule.forChild(routes), SharedDocumentationPageModule, PlatformFooterModule, PlatformLinkModule]
})
export class PlatformDocFooterModule {}
