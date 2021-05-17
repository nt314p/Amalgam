import { Typography } from '@material-ui/core'
import React from 'react'
import { Link } from "react-router-dom";

const Home = ({ isLoggedIn }) => {
    return (
        <div style={{ textAlign: "center" }}>
            <Typography variant="h3">Welcome to Amalgam!</Typography>
            {isLoggedIn ? (
                <Typography variant="body1">You are logged in</Typography>
            ) : (
                <>
                    <Typography variant="body1">You are not logged in</Typography>
                    <Link to="/login">Login</Link>
                </>
            )}

        </div>
    )
}

export default Home
