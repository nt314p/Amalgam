import React from 'react'

import { useState } from 'react'
import { TextField, InputLabel } from '@material-ui/core';

const InputField = ({ name, value, type, validate, onChange }) => {
    const [val, setValue] = useState(value);
    const [isValid, setIsValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const handleUpdateValue = (e) => {
        console.log(onChange);
        const updatedVal = e.target.value;
        setValue(updatedVal);
        validate(updatedVal).then(message => {
            if (message === undefined) message = "";
            setErrorMessage(message);
            setIsValid(message.length === 0);
        });
        onChange(updatedVal);
    };

    return (
        <div style={{ paddingTop: 10 }}>
            <InputLabel>{name}</InputLabel>
            <TextField
                error={!isValid}
                helperText={errorMessage}
                fullWidth
                type={type}
                value={val}
                onChange={handleUpdateValue}
                variant="outlined" margin="dense" />
        </div>
    )
}

InputField.defaultProps = {
    name: "",
    value: "",
    type: "text",
    validate: () => Promise.resolve(""),
    onChange: () => { }
}

export default InputField
