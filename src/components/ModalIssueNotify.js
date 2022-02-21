import React from 'react'
import { Button, Modal } from 'semantic-ui-react'

function ModalIssueNotify(props) {
    if (props.open === undefined) {
        console.log("ModalIssueNotify - props open must be defined");
        return "Issue with ModalIssueNotify";
    }
    if (props.text === undefined) {
        console.log("ModalIssueNotify - props issueText must be defined");
        return "Issue with ModalIssueNotify";
    }

    const onClickEvent = () => {
        if (props.callback){
            props.callback();
        }
    }

    return (
        <Modal
            open={props.open}
            size="tiny"
        >
            <Modal.Header>Issue</Modal.Header>
            <Modal.Content>
                {props.text}
            </Modal.Content>
            <Modal.Actions>
                <Button color='black' onClick={onClickEvent}>
                    Ok
                </Button>
            </Modal.Actions>
        </Modal>
    )
}

export default ModalIssueNotify