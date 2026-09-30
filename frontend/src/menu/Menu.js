import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Menu extends Component {
render() {
    return (
        <nav className='navbar navbar-expand-lg navbar-dark bg-light fixed-top pl-5'>
            <div className='col-12 bg-dark text-white p-1'>
                <Link to="/" className="navbar-brand text-white mr-3"><i className="bi bi-house-door-fill"></i></Link>
                <Link to="/instituto" className="navbar-brand text-white mr-3">Instituto</Link>
                <Link to="/pesquisador" className="navbar-brand text-white mr-3">Pesquisador</Link>
                <Link to="/producao" className="navbar-brand text-white mr-3">Produção</Link>
                <Link to="/grafo" className="navbar-brand text-white">Grafo</Link>
            </div>
        </nav>
    );
}
}

