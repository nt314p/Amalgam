import React from 'react'
import { useState } from 'react'


const InputComponent = () => {
    console.log("Initialized");
    const [val, setVal] = useState("");

    const handleInput = (e) => setVal(e.target.value);

    return (<input value={val} onChange={handleInput} />)
}

export default InputComponent