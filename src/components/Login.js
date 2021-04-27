import React from 'react'

import { makeStyles } from '@material-ui/core';
import { Container, Grid, Card, CardContent, Typography, } from '@material-ui/core';
import { Button } from '@material-ui/core';
import { useState, useEffect } from 'react'
import InputField from './InputField';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center'
    },
    inputGroup: {
        paddingTop: 10,
    },
    cardFullWidth: {
        width: 340
    },
    cardContent: {
        margin: 6
    }
}));

const Login = ({ signUp: signUpDisplay, loggedIn, setToken, setLoggedIn }) => {
    const classes = useStyles();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [signUpOption, setSignUpOption] = useState(signUpDisplay);
    const [formMessage, setFormMessage] = useState("");

    const handleUpdateName = (value) => setName(value);
    const handleUpdateUsername = (value) => setUsername(value);
    const handleUpdatePassword = (value) => setPassword(value);
    const toggleSignUpOption = () => {
        if (signUpOption) setFormMessage("");
        setSignUpOption(!signUpOption);

    }

    const validateName = async (value) => {
        if (value.length === 0) return "Name cannot be empty";
    }

    const validateUsername = async (value) => {
        if (value.length === 0) return "Username cannot be empty";
        if (value.match(/\s/)) return "Username cannot contain spaces";
        const unique = await checkUniqueUsername(value);
        if (!unique) return "Username is already taken";
    };

    const validatePassword = async (value) => {
        if (value.length === 0) return "Password cannot be empty";
        if (value.length < 8) return "Password must be at least 8 characters long";
        if (!value.match(/[a-z]/)) return "Password must contain at least one lowercase letter";
        if (!value.match(/[A-Z]/)) return "Password must contain at least one uppercase letter";
        if (!value.match(/[1-9]/)) return "Password must contain at least one number";
        if (!value.match(/[$-/:-?{-~!"^_`\[\]]/)) return "Password must contain at least one symbol";
    }

    const checkUniqueUsername = async (username) => {
        const res = await fetch('http://localhost:4000/checkUniqueUsername', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        const data = await res.json();
        return data.result;
    }

    const handleLoginClick = () => {
        login();
    }

    const handleSignUpClick = () => {
        signUp().then(success => {
            if (success) {
                setSignUpOption(false);
            }
        })
    }

    const login = async () => {
        const res = await fetch('http://localhost:4000/accounts/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        console.log(data);
        if (res.status === 200) {
            console.log(data.token);
            setFormMessage("Logged in successfully");
            setLoggedIn(true);
            setToken(data.token);
        } else {
            setFormMessage(data.message);
        }
    };

    const signUp = async () => {
        const res = await fetch('http://localhost:4000/accounts/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, username, password })
        })
        const data = await res.json();
        if (res.status == 201) {
            setFormMessage("Account created successfully");
            return true;
        } else {
            setFormMessage(data.message);
            return false;
        }
    };

    return (
        <Container className={classes.root}>
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
            >
                <Card className={classes.cardFullWidth}>
                    <CardContent className={classes.cardContent}>
                        <Typography color="textPrimary" variant="h5" align="center" style={{ marginBottom: 10 }}>
                            {signUpOption ? "Sign Up" : "Login"}
                        </Typography>
                        {signUpOption ? (
                            <>
                                <InputField
                                    key="signup-name"
                                    name="Name"
                                    validate={validateName}
                                    onChange={handleUpdateName}
                                />
                                <InputField
                                    key="signup-username"
                                    name="Username"
                                    validate={validateUsername}
                                    onChange={handleUpdateUsername}
                                />
                                <InputField
                                    key="signup-password"
                                    name="Password"
                                    validate={validatePassword}
                                    onChange={handleUpdatePassword}
                                    type="password"
                                />
                            </>
                        ) : (
                            <>
                                <InputField
                                    key="login-username"
                                    name="Username"
                                    onChange={handleUpdateUsername}
                                />
                                <InputField
                                    key="login-password"
                                    name="Password"
                                    onChange={handleUpdatePassword}
                                    type="password"
                                />
                            </>
                        )}
                        <Button
                            fullWidth
                            onClick={signUpOption ? handleSignUpClick : handleLoginClick}
                            variant="contained"
                            color="primary"
                            style={{ textTransform: "capitalize", marginTop: 12 }}
                        >
                            {signUpOption ? "Sign Up" : "Login"}
                        </Button>
                        {formMessage === "" ? <></> :
                            (<Typography
                                variant="body2"
                                color={(loggedIn ? "primary" : "error")}
                                style={{ paddingTop: 12 }}>
                                {formMessage}
                            </Typography>)
                        }
                    </CardContent>
                </Card>
                <Card className={classes.cardFullWidth} style={{ marginTop: 16 }}>
                    <CardContent className={classes.cardContent} style={{ padding: 4 }}>
                        <Grid container direction="row" justify="center" alignItems="center">
                            <Typography variant="body2" display="inline">
                                {signUpOption ? "Already have an account?" : "New to Amalgam?"}
                            </Typography>
                            <Button
                                style={{ marginLeft: 10, display: "inline", textTransform: "capitalize", padding: 2 }}
                                variant="outlined"
                                color="primary"
                                onClick={() => toggleSignUpOption()}
                            >{signUpOption ? "Login" : "Sign up"}</Button>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Container>
    )
}

export default Login
