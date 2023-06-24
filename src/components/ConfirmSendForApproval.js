import React from 'react'
import { Button, Modal } from 'semantic-ui-react'

function ConfirmSendForApproval(props) {
    if (props.open === undefined) {
        console.log("ConfirmSendForApproval - props open must be defined");
    }
    if (props.callbackYes === undefined) {
        console.log("ConfirmSendForApproval - props callbackYes must be defined");
    }
    if (props.callbackNo === undefined) {
        console.log("ConfirmSendForApproval - props callbackNo must be defined");
    }

    return (
        <Modal
            open={props.open}
            size="tiny"
        >
            <Modal.Header>Send to Approval</Modal.Header>
            <Modal.Content>
                Do you really want to send your times for approval? This can only be reset by your team lead.
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={() => props.callbackNo()}>
                    No
                </Button>
                <Button
                    content="Yes, send"
                    labelPosition='right'
                    icon='paper plane'
                    onClick={() => props.callbackYes()}
                />
            </Modal.Actions>
        </Modal>
    )
}

export default ConfirmSendForApproval