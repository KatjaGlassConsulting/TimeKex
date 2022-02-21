import { Button } from "semantic-ui-react";

export const StatusButton = (text, status, icon, errorText) => {

    if (status === 'succeeded') {
        return (
            <Button
                content={text}
                labelPosition="left"
                icon={icon}
                disabled
                color="green"
            />
        );
    }
    else if (status === 'idle') {
        return (
            <Button
                content={text}
                labelPosition="left"
                icon={icon}
                disabled
            />
        );
    }
    else if (status === 'loading') {
        return (
            <Button
                content={text}
                labelPosition="left"
                icon={icon}
                disabled
                loading
            />
        );
    }
    else if (status === 'failed') {
        return (
            <Button
                content={text}
                labelPosition="left"
                icon={icon}
                color="red"
                onClick={() => alert(errorText)}
            />
        );
    }
}

export default StatusButton;