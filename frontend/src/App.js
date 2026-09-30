import React, { Component } from 'react';
import Menu from './menu/Menu';
import Home from './home/Home'; 
import Rodape from './rodape/Rodape';
import { BrowserRouter as Router, Routes, Route , useNavigate, Switch } from 'react-router-dom';
import Instituto from './instituto/Instituto';
import Producao from './producao/Producao';
import Grafo from './grafo/Grafo';
import Pesquisador from './pesquisador/Pesquisador';
const HomeWithNavigate = () => {
  const navigate = useNavigate();
  return <Home navigate={navigate} />;
};
export default class App extends Component {
  render() {
   
    return (
      <Router>
        <div><Menu /></div>
        <div className='routes'>
          <Routes> 
             <Route path="/" element={<Home/>} />
            <Route path="/instituto" element={<Instituto />} />
            <Route path="/pesquisador" element={<Pesquisador/>} />
            <Route path="/producao" element={<Producao />} />
            <Route path="/grafo" element={<Grafo />} />
          </Routes> 
          
        </div>
        <div className='p-2 mt-4'>
            <Rodape/>
         </div>
      </Router>
    )
  }
}

