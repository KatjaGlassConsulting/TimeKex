import React, { useState } from 'react';
import { Button, Modal, Popup, Icon } from 'semantic-ui-react';
import { useSelector, useDispatch } from 'react-redux';
import ConfirmSendForApproval from './ConfirmSendForApproval';
import { submitToApproval, resetSubmitStatus } from '../features/approvalSlice';

export const ButtonSubmitToApprobal = (props) => {
    const approval = useSelector((state) => state.approval);
    const excelSelectedWeek = useSelector((state) => state.excelData.selectedWeek)
    const currentWeekCanApproveSTatus = useSelector((state) => state.approval.excelWeekStatus)[excelSelectedWeek.weekStartDay]
    const nextApprovalWeek1 = useSelector((state) => state.kimaiData.nextApprovalWeek)
    const nextApprovalWeek2 = useSelector((state) => state.approval.nextApprovalWeek)
    const userID = useSelector((state) => state.kimaiData.userId);
    const config = useSelector((state) => state.config);
    
    const nextApprovalWeek = nextApprovalWeek2 !== null ?  nextApprovalWeek2 : nextApprovalWeek1

    const dispatch = useDispatch()

    const [displayConfirmSendForApproval, setDisplayConfirmSendForApproval] = useState(false);

    let canBeSubmittedForApproval = currentWeekCanApproveSTatus
    let hintText = ""

    if (canBeSubmittedForApproval && nextApprovalWeek !== "" && nextApprovalWeek !==excelSelectedWeek.weekStartDay){
        canBeSubmittedForApproval = false;
        hintText = "Next approval for " + nextApprovalWeek
    }

    let color = null
    let text = 'Submit to Approval'
    if (approval.data[excelSelectedWeek.weekStartDay]  === 'Submitted'){
        color = 'yellow'
        text = 'Submitted'
    } else if (approval.data[excelSelectedWeek.weekStartDay]  === 'Approved'){
        color = 'olive'
        text = 'Approved'
    }

    const renderApprovalFailure = () => {
        return (
            <Modal
                open={approval.submitStatus.status === 'failed'}
                size="tiny"
            >
                <Modal.Header>Error - Approval request could not be send</Modal.Header>
                <Modal.Content>
                    <p>The approval for this week cannot be send. This is due to the following error:</p>
                    <p>{approval.submitStatus.error}</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button color='black' onClick={() => dispatch(resetSubmitStatus())}>
                        Ok
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }

    const abortSendForApproval = () => {
        setDisplayConfirmSendForApproval(false);
    }

    // perform update actions and afterwards trigger re-read from Kimai
    const performSendForApproval = () => {
        setDisplayConfirmSendForApproval(false);
        dispatch(submitToApproval({week:excelSelectedWeek.weekStartDay, config:config, userID:userID}))
    }

    return (
        <div>
            { hintText === "" &&
                <Button 
                    disabled={!canBeSubmittedForApproval} 
                    className={color} 
                    onClick={() => setDisplayConfirmSendForApproval(true)}>
                        {text}                    
                </Button>
            }
            { hintText !== "" &&
                <Popup
                    trigger={
                        <span>
                            <Button 
                                icon
                                disabled={!canBeSubmittedForApproval} 
                                className={color} 
                                onClick={() => setDisplayConfirmSendForApproval(true)}>                                    
                                    {text}&nbsp;&nbsp;                    
                                    <Icon name='exclamation triangle'/>
                            </Button>
                        </span>
                    }
                    content={hintText}
                    basic
                />
            }
            <ConfirmSendForApproval
                open={displayConfirmSendForApproval}
                callbackYes={performSendForApproval}
                callbackNo={abortSendForApproval}
            />
            {renderApprovalFailure()}
        </div>
    )
}

export default ButtonSubmitToApprobal;