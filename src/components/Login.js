import React from 'react'
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Container from '@material-ui/core/Container'
import green from '@material-ui/core/colors/green';
import { makeStyles } from '@material-ui/core';
import { Card } from '@material-ui/core';
import { CardContent } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';
import { Grid } from '@material-ui/core';
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
        width: 280
    },
    cardContent: {
        margin: 6
    }
}));

const Login = ({ signUp, loggedIn, setToken, setLoggedIn }) => {
    const classes = useStyles();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [signUpOption, setSignUpOption] = useState(signUp);
    const [loginMessage, setLoginMessage] = useState("");

    const handleUpdateUsername = (e) => setUsername(e.target.value);
    const handleUpdatePassword = (e) => setPassword(e.target.value);
    const toggleSignUpOption = (value) => setSignUpOption(value);

    const validateUsername = async (value) => {
        if (value.length == 0) return "Username cannot be empty";
        const unique = await checkUniqueUsername(value);
        if (!unique) return "Username is already taken";
    };

    const validatePassword = async (value) => {
        if (value.length == 0) return "Password cannot be empty";
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
            setLoginMessage("Logged in successfully");
            setLoggedIn(true);
        } else {
            setLoginMessage(data.message);
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
                            Login
                        </Typography>

                        <InputField name="Username" />
                        <InputField name="Password" type="password" />

                        <div className={classes.root} style={{ paddingTop: 10 }}>
                            <Button
                                fullWidth
                                onClick={() => {
                                    login();
                                    setToken("myToken");
                                }}
                                variant="contained"
                                color="primary"
                                style={{ textTransform: "capitalize" }}
                            >
                                Login
                            </Button>
                        </div>
                        {loginMessage === "" ? <></> :
                            (<Typography
                                variant="body2"
                                color={(loggedIn ? "primary" : "error")}
                                style={{ paddingTop: 10 }}>
                                {loginMessage}
                            </Typography>)
                        }
                    </CardContent>
                </Card>
                <Card className={classes.cardFullWidth} style={{ marginTop: 16 }}>
                    <CardContent className={classes.cardContent} style={{ padding: 4 }}>
                        <Grid container direction="row" justify="center" alignItems="center">
                            <Typography variant="body2" display="inline"
                            >
                                New to Amalgam?
                                </Typography>
                            <Button style={{ marginLeft: 10, display: "inline", textTransform: "capitalize", padding: 2 }} variant="outlined" color="primary">Sign up</Button>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
        </Container>
    )
}

export default Login
