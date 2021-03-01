import {
    ChangeDetectionStrategy,
    Component,
    HostListener,
    Input,
    Output,
    ViewEncapsulation,
    EventEmitter,
    Host,
    OnDestroy,
    Optional
} from '@angular/core';
import { finalize } from 'rxjs/operators';

import { DialogContentType, DialogRef, DialogService } from '../../../dialog/public_api';
import { UserActionsMenuComponent } from '../user-actions-menu/user-actions-menu.component';

@Component({
    selector: 'fd-user-actions-menu-item',
    templateUrl: './user-actions-menu-item.component.html',
    styleUrls: ['./user-actions-menu-item.component.scss'],
    host: {
        class: 'fd-user-actions-menu-item'
    },
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserActionsMenuItemComponent implements OnDestroy {
    /** View title for action item. Required property */
    @Input()
    title: string;

    /** Sets icon for user action menu, glyph code from icons */
    @Input()
    glyph: string;

    @Input()
    counter: number;

    @Input()
    navigation = false;

    /** Sets icon src if you want use image. You will have predefined place with dimensions same as glyph `border` */
    @Input()
    glyphSrc: string;

    /** Opens a dialog component with with provided content. */
    @Input()
    dialogContent: DialogContentType;

    @Output()
    onOpenDialog = new EventEmitter<DialogRef>();

    /** @hidden Active dialog */
    private _activeDialog: DialogRef;

    /** @hidden */
    @HostListener('click')
    handleClick(): void {
        this.parent._menu?.close();

        if (this.dialogContent) {
            this._callDialogTemplateRef();
        }
    }

    /** @hidden */
    constructor(
        private readonly _dialogService: DialogService,
        @Optional() @Host() public parent: UserActionsMenuComponent
    ) {}

    /** @hidden */
    ngOnDestroy(): void {
        this._dismissDialog();
    }

    /** @hidden */
    private _callDialogTemplateRef(): void {
        if (this._activeDialog) {
            return;
        }

        this._activeDialog = this._dialogService.open(this.dialogContent, { responsivePadding: true });

        this.onOpenDialog.emit(this._activeDialog);

        this._activeDialog.afterClosed.pipe(finalize(() => (this._activeDialog = null))).subscribe();
    }

    /** @hidden */
    private _dismissDialog(): void {
        if (this._activeDialog) {
            this._activeDialog.dismiss();
        }
    }
}
