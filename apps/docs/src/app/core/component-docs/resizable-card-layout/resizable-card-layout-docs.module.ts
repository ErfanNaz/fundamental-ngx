import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ApiComponent } from '../../../documentation/core-helpers/api/api.component';
import { SharedDocumentationPageModule } from '../../../documentation/shared-documentation-page.module';
import { API_FILES } from '../../api-files';

import { ResizableCardLayoutModule, CardModule, ListModule } from '@fundamental-ngx/core';

import { ResizableCardLayoutDocsHeaderComponent } from './resizable-card-layout-docs-header/resizable-card-layout-docs-header.component';
import { ResizableCardLayoutDocsComponent } from './resizable-card-layout-docs.component';
import { ResizableCardLayoutExampleComponent } from './examples/resizable-card-layout-example.component';

const routes: Routes = [
    {
        path: '',
        component: ResizableCardLayoutDocsHeaderComponent,
        children: [
            { path: '', component: ResizableCardLayoutDocsComponent },
            { path: 'api', component: ApiComponent, data: { content: API_FILES.resizableCardLayout } }
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
        SharedDocumentationPageModule,
        ResizableCardLayoutModule,
        CardModule,
        ListModule
    ],
    exports: [RouterModule],
    declarations: [
        ResizableCardLayoutDocsComponent,
        ResizableCardLayoutDocsHeaderComponent,
        ResizableCardLayoutExampleComponent
    ]
})
export class ResizableCardLayoutDocsModule {}
