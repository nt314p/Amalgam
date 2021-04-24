import React from 'react'
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import Container from '@material-ui/core/Container'
import green from '@material-ui/core/colors/green';
import { makeStyles } from '@material-ui/core/styles';
import { Card } from '@material-ui/core';
import { CardContent } from '@material-ui/core';
import { Typography } from '@material-ui/core';
import { Button } from '@material-ui/core';
import { useState, useEffect } from 'react'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center'
    },
    inputGroup: {
        paddingTop: 10,
    },
}));

const Login = ({ loggedIn, setToken, setLoggedIn }) => {
    const classes = useStyles();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginMessage, setLoginMessage] = useState("");

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
        <div>
            <Container maxWidth="sm" className={classes.root}>
                <Card>
                    <CardContent>
                        <Typography color="textPrimary" style={{ fontSize: 20 }}>
                            Login
                        </Typography>
                        <div className={classes.inputGroup}>
                            <InputLabel>Username</InputLabel>
                            <TextField id="username-field" type="text" value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                variant="outlined" margin="dense" />
                        </div>
                        <div className={classes.inputGroup}>
                            <InputLabel>Password</InputLabel>
                            <TextField id="password-field" type="password" value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                variant="outlined" margin="dense" />
                        </div>
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
                                color={(loggedIn ? "primary" : "error")}
                                style={{ fontSize: 14, paddingTop: 10 }}>
                                {loginMessage}
                            </Typography>)
                        }
                    </CardContent>
                </Card>
            </Container>
        </div>
    )
}

export default Login
