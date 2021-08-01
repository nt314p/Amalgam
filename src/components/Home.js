import React from 'react'
import { Link } from "react-router-dom";
import { Paper, Container, Grid, Card, CardContent, Typography, } from '@material-ui/core';


const Home = ({ isLoggedIn }) => {
    return (
        <Container>
            <Grid
                container
                direction="row"
                spacing={0}
            >
                <Grid item>
                    <Paper style={{height: '100vh'}}>Note/notebook selection</Paper></Grid>
                <Grid item>
                    <Paper style={{height: '100vh'}}>Note editor</Paper>
                </Grid>
            </Grid>
        </Container>
    )
}

export default Home
