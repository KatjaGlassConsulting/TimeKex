import React from 'react'
import { Button, Modal } from 'semantic-ui-react'

function ConfirmSendGeneric(props) {
    if (props.open === undefined) {
        console.log("ConfirmSendForApproval - props open must be defined");
    }
    if (props.callbackYes === undefined) {
        console.log("ConfirmSendForApproval - props callbackYes must be defined");
    }
    if (props.callbackNo === undefined) {
        console.log("ConfirmSendForApproval - props callbackNo must be defined");
    }
    if (props.header === undefined) {
        console.log("ConfirmSendForApproval - props header must be defined");
    }
    if (props.text === undefined) {
        console.log("ConfirmSendForApproval - props text must be defined");
    }

    return (
        <Modal
            open={props.open}
            size="tiny"
        >
            <Modal.Header>{props.header}</Modal.Header>
            <Modal.Content>
                {props.text}
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

export default ConfirmSendGeneric