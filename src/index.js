import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import App from './App';

//ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(
    <Router>
        <Redirect from="" to="/browe" />
        <Route path="/browe" component={App} />
    </Router>
    , document.getElementById('root'));

