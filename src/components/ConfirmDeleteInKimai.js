import React from 'react'
import { Button, Modal } from 'semantic-ui-react'

function ConfirmDeleteInKimai(props) {
    if (props.open === undefined) {
        console.log("ConfirmDeleteInKimai - props open must be defined");
    }
    if (props.callbackYes === undefined) {
        console.log("ConfirmDeleteInKimai - props callbackYes must be defined");
    }
    if (props.callbackNo === undefined) {
        console.log("ConfirmDeleteInKimai - props callbackNo must be defined");
    }

    return (
        <Modal
            open={props.open}
            size="tiny"
        >
            <Modal.Header>Delete Data in Kimai?</Modal.Header>
            <Modal.Content>
                Do you really want to remove timetracking entries in Kimai as listed?
            </Modal.Content>
            <Modal.Actions>
                <Button color='black' onClick={() => props.callbackNo()}>
                    No
                </Button>
                <Button
                    color='red'
                    content="Yes, delete"
                    labelPosition='right'
                    icon='trash'
                    onClick={() => props.callbackYes()}
                />
            </Modal.Actions>
        </Modal>
    )
}

export default ConfirmDeleteInKimai