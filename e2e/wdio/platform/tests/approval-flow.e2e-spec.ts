import {
    click,
    doesItExist,
    getElementArrayLength,
    getText,
    getTextArr,
    isElementClickable,
    isElementDisplayed,
    refreshPage,
    selectOptionByValueAttribute, sendKeys,
    waitElementToBeClickable,
    waitForElDisappear,
    waitForElDisplayed,
    waitForPresent
} from '../../driver/wdio';
import { ApprovalFlowPo } from '../pages/approval-flow.po';
import {
    details_dialog_cancel_btn,
    details_dialog_header,
    details_dialog_send_reminder_btn,
    node_statuses,
    remainder_text,
    watchers_block_title,
    approved_node_status,
    rejected_node_status
} from '../fixtures/appData/approval-flow-contents';

describe('Approval flow', function() {
    const approvalFlowPage = new ApprovalFlowPo();
    const {
        selectExample,
        flowNavigationArrow,
        approvalFlowNode,
        watchersTitle,
        watchersAvatar,
        detailsDialog,
        detailsDialogSearchInput,
        detailsDialogTeamMember,
        detailsDialogBackIcon,
        detailsDialogHeader,
        detailsDialogAvatar,
        detailsDialogCancelBtn,
        detailsDialogSendReminderBtn,
        approvalFlowNodeAvatar,
        approvalFlowNodeName,
        approvalFlowNodeDescription,
        approvalFlowNodeStatus,
        toastMessageDialog,
        detailsDialogTeamMemberCheckBox,
        detailsDialogTeamMemberName,
        approvalFlowTeamNode,
        remaindersSendToInput,
        selectItem,
        editExampleButton,
        addWhatchersInput,
        bottomMenuItems,
        addNode,
        detailsDialogParallelSerialSelect,
        detailsDialogUserTeamButton,
        detailsDialogParallelSerialSelectOption
    } = approvalFlowPage;

    beforeAll(() => {
        approvalFlowPage.open();
    }, 1);

    afterEach(() => {
        refreshPage();
        waitForPresent(approvalFlowPage.watchers);
    }, 1);

    it('should have watchers section with watchers details displayed', () => {
        expect(isElementDisplayed(watchersAvatar)).toBe(true);
        expect(getElementArrayLength(watchersAvatar)).toBe(4);
    });

    it('should have watchers section has correct title', () => {
        expect(getText(watchersTitle)).toBe(watchers_block_title);
    });

    it('should have watchers section user details appear on click', () => {
        click(watchersAvatar);
        waitForElDisplayed(detailsDialog);
        checkWatchersDetailsDialogContent();
    });

    it('should have watchers section user details disappeared on click', () => {
        click(watchersAvatar);
        waitForElDisplayed(detailsDialog);
        click(detailsDialogCancelBtn);
        waitForElDisappear(detailsDialog);
        expect(doesItExist(detailsDialog)).toBe(false);
    });

    // TODO: Can't switch examples programmatically. Needs further investigation.
    xit('should be able to switch example', () => {
        selectOptionByValueAttribute(selectExample, 'simple');
        expect(getElementArrayLength(approvalFlowNode)).toEqual(3);

        selectOptionByValueAttribute(selectExample, 'medium');
        expect(getElementArrayLength(approvalFlowNode)).toEqual(6);

        selectOptionByValueAttribute(selectExample, 'complex');
        expect(getElementArrayLength(approvalFlowNode)).toEqual(8);
    });

    it('verify approval item content', () => {
        const arrLength = getElementArrayLength(approvalFlowNode);
        for (let i = 0; arrLength > i; i++) {
            expect(isElementDisplayed(approvalFlowNodeAvatar, i)).toBe(true);
            expect(isElementDisplayed(approvalFlowNodeName, i)).toBe(true);
            expect(['', 'undefined']).not.toContain(getText(approvalFlowNodeName, i));
            expect(isElementDisplayed(approvalFlowNodeDescription, i)).toBe(true);
            expect(['', 'undefined']).not.toContain(getText(approvalFlowNodeName, i));
            expect(isElementDisplayed(approvalFlowNodeStatus, i)).toBe(true);
            expect(node_statuses).not.toContain(getText(approvalFlowNodeName, i));
        }
    });

    it('verify approver/approving team details item content', () => {
        const arrLength = getElementArrayLength(approvalFlowNode);
        for (let i = 0; arrLength > i; i++) {
            while (!isElementClickable(approvalFlowNode, i)) {
                click(flowNavigationArrow);
            }
            waitElementToBeClickable(approvalFlowNode, i);
            click(approvalFlowNode, i);
            waitForElDisplayed(detailsDialog);

            if (doesItExist(detailsDialogSearchInput)) {
                // Check each teem member details dialog
                const teamMemberCount = getElementArrayLength(detailsDialogTeamMember);
                for (let j = 0; teamMemberCount > j; j++) {
                    click(detailsDialogTeamMember, j);
                    checkWatchersDetailsDialogContent();
                    click(detailsDialogBackIcon);
                }
            } else {
                checkApproveNodeDetailsDialogContent();
            }

            click(detailsDialogCancelBtn);
            waitForElDisappear(detailsDialog);
        }
    });

    it('should be able send remainder to approved and rejected', () => {
        click(remaindersSendToInput);
        sendKeys(approved_node_status);
        waitForElDisplayed(selectItem);
        click(selectItem);
        sendKeys(rejected_node_status);
        click(selectItem);

        const arrLength = getElementArrayLength(approvalFlowNode);
        for (let i = 0; arrLength > i; i++) {
            while (!isElementClickable(approvalFlowNode, i)) {
                click(flowNavigationArrow);
            }
            const approvalNodeText = getText(approvalFlowNodeName, i);
            if (approvalNodeText.includes('members')) {
                continue;
            }
            waitElementToBeClickable(approvalFlowNode, i);
            click(approvalFlowNode, i);
            waitElementToBeClickable(detailsDialogSendReminderBtn);
            click(detailsDialogSendReminderBtn);
            waitForElDisappear(detailsDialog);

            expect(isElementDisplayed(toastMessageDialog)).toBe(true);
            expect(getTextArr(toastMessageDialog))
                .toContain(remainder_text + approvalNodeText);
        }
    });


    describe('Edit mode', function() {
        it('should be able to add watchers', () => {
            const watchersCountBefore = getElementArrayLength(watchersAvatar);
            click(editExampleButton);
            waitForElDisplayed(addWhatchersInput);
            click(addWhatchersInput);
            sendKeys('Alvin');
            click(selectItem);
            click(bottomMenuItems);
            const watchersCountAfter = getElementArrayLength(watchersAvatar);

            expect(watchersCountBefore).toBe(watchersCountAfter - 1);
        });

        it('should be able to remove watchers', () => {
            const watchersCountBefore = getElementArrayLength(watchersAvatar);
            click(editExampleButton);
            waitForElDisplayed(addWhatchersInput);
            click(addWhatchersInput);
            sendKeys('Julie');
            click(selectItem);
            click(bottomMenuItems);
            const watchersCountAfter = getElementArrayLength(watchersAvatar);

            expect(watchersCountBefore).toBe(watchersCountAfter + 1);
        });

        it('should be able to add node in parallel', () => {
            const approvalFlowNodeCountBefore = getElementArrayLength(approvalFlowNode);

            click(editExampleButton);
            waitForElDisplayed(addNode);
            click(addNode);
            click(detailsDialogUserTeamButton);
            waitForElDisplayed(detailsDialogTeamMemberCheckBox);
            click(detailsDialogTeamMemberCheckBox);
            click(detailsDialogSendReminderBtn);
            waitForElDisplayed(detailsDialogSendReminderBtn);
            click(detailsDialogSendReminderBtn);
            click(bottomMenuItems);
            const approvalFlowNodeCountAfter = getElementArrayLength(approvalFlowNode);

            expect(approvalFlowNodeCountBefore).toBe(approvalFlowNodeCountAfter - 1);
        });

        fit('should be able to add node in serial', () => {
            const approvalFlowNodeCountBefore = getElementArrayLength(approvalFlowNode);

            click(editExampleButton);
            waitForElDisplayed(addNode);
            click(addNode);
            click(detailsDialogParallelSerialSelect);
            click(detailsDialogParallelSerialSelectOption);
            click(detailsDialogUserTeamButton);
            waitForElDisplayed(detailsDialogTeamMemberCheckBox);
            click(detailsDialogTeamMemberCheckBox , 4);
            click(detailsDialogSendReminderBtn);
            waitForElDisplayed(detailsDialogSendReminderBtn);
            click(detailsDialogSendReminderBtn);
            click(bottomMenuItems);
            const approvalFlowNodeCountAfter = getElementArrayLength(approvalFlowNode);

            expect(approvalFlowNodeCountBefore).toBe(approvalFlowNodeCountAfter - 1);
        });

        it('should be able to remove node', () => {

        });

        it('should be able to undo added approval node', () => {

        });

    });

    describe('should be able send remainder to approving team', function() {
        it('should be able send remainder to approving team (full)', () => {
            const arrLength = getElementArrayLength(approvalFlowTeamNode);
            for (let i = 0; arrLength > i; i++) {
                const approvalNodeText = getText(approvalFlowTeamNode, i);
                const approvalNodeDescription = getText(approvalFlowNodeDescription, i);
                click(approvalFlowTeamNode, i);
                const teamSize = getElementArrayLength(detailsDialogTeamMember);
                for (let k = 0; teamSize > k; k++) {
                    click(detailsDialogTeamMemberCheckBox, k);

                }
                click(detailsDialogSendReminderBtn);
                waitForElDisappear(detailsDialog);
                waitForPresent(toastMessageDialog);
                expect(isElementDisplayed(toastMessageDialog)).toBe(true);
                expect(getText(toastMessageDialog, getElementArrayLength(toastMessageDialog) - 1).trim())
                    .toBe(`${remainder_text}${approvalNodeText} of ${approvalNodeDescription}`);
            }
        });

        it('should be able send remainder to approving team', () => {
            const arrLength = getElementArrayLength(approvalFlowTeamNode);
            for (let i = 0; arrLength > i; i++) {
                while (isElementDisplayed(approvalFlowTeamNode, i)) {
                    click(flowNavigationArrow);
                }
                let approvalNodeText = getText(approvalFlowTeamNode, i);
                click(approvalFlowTeamNode, i);
                approvalNodeText = getText(detailsDialogTeamMemberName);
                click(detailsDialogTeamMemberCheckBox);
                click(detailsDialogSendReminderBtn);
                waitForElDisappear(detailsDialog);
                waitForPresent(toastMessageDialog);
                expect(isElementDisplayed(toastMessageDialog)).toBe(true);
                expect(getText(toastMessageDialog, getElementArrayLength(toastMessageDialog) - 1).trim())
                    .toBe(remainder_text + approvalNodeText);
            }
        });

        describe('check example orientation', () => {
            it('should check RTL orientation', () => {
                approvalFlowPage.checkRtlSwitch();
            });
        });
    });

    function checkApproveNodeDetailsDialogContent(): void {
        expect(isElementDisplayed(detailsDialog)).toBe(true);
        expect(isElementDisplayed(detailsDialogAvatar)).toBe(true);
        expect(getText(detailsDialogCancelBtn)).toBe(details_dialog_cancel_btn);
        expect(getText(detailsDialogSendReminderBtn)).toBe(details_dialog_send_reminder_btn);
        expect(getText(detailsDialogHeader)).toBe(details_dialog_header);
    }

    function checkWatchersDetailsDialogContent(): void {
        expect(isElementDisplayed(detailsDialog)).toBe(true);
        expect(isElementDisplayed(detailsDialogAvatar)).toBe(true);
        expect(getText(detailsDialogCancelBtn)).toBe(details_dialog_cancel_btn);
        expect(getText(detailsDialogHeader)).toBe(details_dialog_header);
    }
});

