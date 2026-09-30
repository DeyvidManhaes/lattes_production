// Instituto.js
import React, { Component } from 'react';
import { TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material';
import './InstitutoList.css';
import { API_URL, mensagemDeErro } from '../api';

export default class Instituto extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      itemsPerPage: 5,
      nome: "",
      acronimo: "",
      institutos: [],
      institutoSelecionado: null,
      opcaoBusca: 'todos',
      termoBusca: '',
      alterando: false,
      openDialog: false,
      incluindo: false,
      id: ""
    };
  }

  iniciarAlterar = (instituto) => {
    if (instituto) {
      this.setState({ alterando: true, nome: instituto.nome, id: instituto.id, acronimo: instituto.acronimo });
    } else {
      alert("Por favor, selecione um instituto para editar.");
    }
  };

  salvarInstituto = () => {
    const dados = {
      "nome": this.state.nome,
      "acronimo": this.state.acronimo
    };

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    };

    const url = API_URL + '/instituto/incluir';
    fetch(url, requestOptions)
      .then(async response => {
        console.log('Instituto Gravado: ' + this.state.nome);
        this.setState({ incluindo: false });
        this.preencherListInstituto();
        if (response.ok) {
          
        } else {
          alert("Não foi possível realizar a operação. " + await mensagemDeErro(response));
        }

      })
      .catch(error => {
        console.log(error);
      });
  }

  iniciarIncluir = () => {
    this.setState({ incluindo: true });
  }

  renderIncluir = () => {
    return (
      <div className='mt-5 p-2 col-3'>
        <h1>Formulário de Instituto</h1>
        <TextField label="Nome" fullWidth margin="normal" value={this.state.nome} onChange={this.txtnome_change} />
        <TextField label="Acrônimo" fullWidth margin="normal" value={this.state.acronimo} onChange={this.txtacronimo_change} />
        <Button variant="contained" color="primary" onClick={this.handleOpenDialog}>Salvar</Button>
        <Button onClick={() => this.setState({ incluindo: false })} variant="contained" color="primary">Cancelar</Button>
        <Dialog open={this.state.openDialog} onClose={this.handleCloseDialog}>
          <DialogTitle>Confirmação</DialogTitle>
          <DialogContent>
            <p>Deseja realmente adicionar o instituto:</p>
            <p>Nome: {this.state.nome}</p>
            <p>Acrônimo: {this.state.acronimo}</p>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleCloseDialog} color="primary">Cancelar</Button>
            <Button onClick={() => { this.salvarInstituto(); this.handleCloseDialog(); }} color="primary">OK</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }

  iniciarExcluir = () => {
    const { institutoSelecionado } = this.state;
    if (institutoSelecionado) {
      this.setState({ openDialog: true });
    } else {
      alert("Por favor, selecione um instituto para excluir.");
    }
  };

  excluir = (instituto) => {
    const requestOptions = {
      method: 'DELETE',
    };

    const url = API_URL + '/instituto/excluir/' + instituto.id;
    fetch(url, requestOptions)
      .then(async response => {
        if (!response.ok) {
          alert("Não foi possível excluir o instituto. " + await mensagemDeErro(response));
        }
        this.preencherListInstituto();
      })
      .catch(error => console.log(error))
      .finally(() => {
        this.handleCloseDialog();
        this.setState({ institutoSelecionado: null });
      });
  }

  gravarAlterar = () => {
    const dados = {
      "id": this.state.id,
      "nome": this.state.nome,
      "acronimo": this.state.acronimo
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dados)
    };

    const url = API_URL + '/instituto/alterar';
    fetch(url, requestOptions)
      .then(async response => {
        console.log('Instituto alterado: ' + this.state.nome);
        this.setState({ alterando: false });
        this.preencherListInstituto();
        if (response.ok) {
          
        } else {
          alert("Não foi possível realizar a operação. " + await mensagemDeErro(response));
        }

      })
      .catch(error => {
        console.log(error);
      })

      .finally(() => {
        this.handleCloseDialog();
        this.setState({ institutoSelecionado: null });
      });
  }

  renderAlterar = () => {
    return (
      <div className='mt-5 p-2 col-3'>
        <h1>Editar Instituto</h1>
        <TextField label="Id" fullWidth margin="normal" value={this.state.id} />
        <TextField label="Nome" fullWidth margin="normal" value={this.state.nome} onChange={this.txtnome_change} />
        <TextField label="Acrônimo" fullWidth
margin="normal" value={this.state.acronimo} onChange={this.txtacronimo_change} />
       <Button variant="contained" color="primary" onClick={this.handleOpenDialog}>Salvar</Button>
<Button variant="contained" color="primary" onClick={() => this.setState({ alterando: false })}>Cancelar</Button>
        <Dialog open={this.state.openDialog} onClose={this.handleCloseDialog}>
            <DialogTitle>Confirmação</DialogTitle>
              <DialogContent>
                    <p>Deseja realmente alterar o instituto:</p>
                    <p>Id: {this.state.id}</p>
                    <p>Nome: {this.state.nome}</p>
                    <p>Acrônimo: {this.state.acronimo}</p>
              </DialogContent>
              <DialogActions>
                <Button variant="contained" color="primary" onClick={() => { this.gravarAlterar(); this.handleCloseDialog(); }}>Salvar</Button>
                <Button variant="contained" color="primary" onClick={()=>{this.handleCloseDialog(); this.setState({ institutoSelecionado: null })}}>Cancelar</Button>
              </DialogActions>
        </Dialog>
      </div>
    )
  }

  txtnome_change = (event) => {
    this.setState({ nome: event.target.value });
  }

  txtacronimo_change = (event) => {
    this.setState({ acronimo: event.target.value });
  }

  handleOpcaoBuscaChange = (event) => {
    this.setState({ opcaoBusca: event.target.value });
  }

  handleTermoBuscaChange = (event) => {
    this.setState({ termoBusca: event.target.value });
  }
  handleOpenDialog = () => {
    this.setState({ openDialog: true });
  }

  handleCloseDialog = () => {
    this.setState({ openDialog: false });
  }

  gravarInstituto = () => {
    const { opcaoBusca, termoBusca } = this.state;

    let url = API_URL + '/instituto/exibir';
    if (opcaoBusca === 'nome') {
      url += `?nome=${termoBusca}`;
    } else if (opcaoBusca === 'acronimo') {
      url += `?acronimo=${termoBusca}`;
    }

    fetch(url)
      .then(response => response.json())
      .then(data => this.setState({ institutos: data }));
  }

  componentDidMount() {
    this.preencherListInstituto();
  }

  preencherListInstituto = () => {
  const url = API_URL + '/instituto/exibir';
  console.log(`Fetching data from: ${url}`);

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Data fetched:', data);
      this.setState({ institutos: data });
    })
    .catch(error => {
      console.error('Failed to fetch:', error);
    });
}


  handleAplicarFiltro = () => {
    const { opcaoBusca, termoBusca } = this.state;
  
    let url = API_URL + '/instituto/exibir';
    if (opcaoBusca === 'nome') {
      url += `?nome=${termoBusca}`;
    } else if (opcaoBusca === 'acronimo') {
      url += `?acronimo=${termoBusca}`;
    }
  
    fetch(url)
      .then(response => response.json())
      .then(data => this.setState({ institutos: data }));
  }
  

  renderItems = (institutos) => {
    const { currentPage, itemsPerPage, institutoSelecionado } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = institutos.slice(indexOfFirstItem, indexOfLastItem);

    return currentItems.map((instituto, index) => (
      <TableRow key={index} className={instituto === institutoSelecionado ? 'selected' : ''} onClick={() => this.handleSelect(instituto)}>
        <TableCell>{instituto.nome}</TableCell>
        <TableCell>{instituto.acronimo}</TableCell>
        <TableCell>
          <input type="checkbox" checked={instituto === institutoSelecionado} onChange={() => this.handleSelect(instituto)} />
        </TableCell>
      </TableRow>
    ));
  };

  handleSelect = (instituto) => {
    this.setState({
      institutoSelecionado: instituto === this.state.institutoSelecionado ? null : instituto,
      id: instituto.id,
      nome: instituto.nome,
      acronimo: instituto.acronimo
    });
  };

  handleChangeItemsPerPage = (event) => {
    this.setState({ itemsPerPage: parseInt(event.target.value), currentPage: 1 });
  };

  paginate = (pageNumber) => {
    this.setState({ currentPage: pageNumber });
  };

  renderExibirLista = () => {
    const { currentPage, itemsPerPage, opcaoBusca, termoBusca, institutos } = this.state;
    const totalPages = Math.ceil(institutos.length / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);
  
    let institutosFiltrados = institutos;
    if (termoBusca.trim() !== '') {
      institutosFiltrados = institutos.filter(instituto => {
        if (opcaoBusca === 'nome') {
          return instituto.nome.toLowerCase().startsWith(termoBusca.toLowerCase());
        } else if (opcaoBusca === 'acronimo') {
          return instituto.acronimo.toLowerCase().startsWith(termoBusca.toLowerCase());
        } else {
          return instituto.nome.toLowerCase().startsWith(termoBusca.toLowerCase()) ||
            instituto.acronimo.toLowerCase().startsWith(termoBusca.toLowerCase());
        }
      });
    }
  
    return (
      <div className='p-2 mt-5'>
        <h1>CRUD de Instituto</h1>
        <div className="search-container">
          <div className="termo">
            <label htmlFor="termo">Termo:</label>
            <input type="text" id="termo" placeholder="Digite aqui" value={termoBusca} onChange={this.handleTermoBuscaChange} />
          </div>
          <div className="box1">
            <label htmlFor="opcaoBusca">Campo:</label>
          </div>
          <div className="box2">
            <select id="opcaoBusca" value={opcaoBusca} onChange={this.handleOpcaoBuscaChange} aria-label="Default select example">
              <option value="todos">Todos</option>
              <option value="nome">Nome</option>
              <option value="acronimo">Acrônimo</option>
            </select>
          </div>
          <button type="button" className="btn btn-primary search-box" onClick={this.handleAplicarFiltro}>Aplicar</button>
        </div>
  
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Acrônimo</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderItems(institutosFiltrados)}
          </TableBody>
        </Table>
  
        <Button onClick={() => this.iniciarIncluir()} variant="contained" className='mt-3 pl-5' color="primary">Incluir</Button>
<Button onClick={() => this.iniciarAlterar(this.state.institutoSelecionado)} variant="contained" className='mt-3 pl-5' color="primary">Editar</Button>
<Button onClick={() => {this.iniciarExcluir()} } variant="contained" className='mt-3 pl-5' color="primary">Excluir</Button>
        <Dialog open={this.state.openDialog} onClose={this.handleCloseDialog}>
          <DialogTitle>Confirmação</DialogTitle>
          <DialogContent>
            <p>Deseja realmente excluir o instituto:</p>
            <p>Id: {this.state.id}</p>
            <p>Nome: {this.state.nome}</p>
            <p>Acrônimo: {this.state.acronimo}</p>
          </DialogContent>
          <DialogActions>
            <Button variant="contained" color="primary" onClick={() => { this.excluir(this.state.institutoSelecionado); this.handleCloseDialog(); }}>Excluir</Button>
            <Button variant="contained" color="primary" onClick={this.handleCloseDialog}>Cancelar</Button>
          </DialogActions>
        </Dialog>
  
        <nav aria-label="Page navigation example" className="mt-3">
          <ul className="pagination justify-content-center">
            <li className="page-item">
              <button type="button" className="page-link" onClick={() => this.paginate(1)} aria-label="First">
                <span aria-hidden="true">&lt;&lt;</span>
              </button>
            </li>
            <li className="page-item">
              <button type="button" className="page-link" onClick={() => this.paginate(currentPage - 1)} aria-label="Previous">
                <span aria-hidden="true">&lt;</span>
              </button>
            </li>
            {pageNumbers.map((number) => (
              <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                <button type="button" className="page-link" onClick={() => this.paginate(number)}>{number}</button>
              </li>
            ))}
            <li className="page-item">
              <button type="button" className="page-link" onClick={() => this.paginate(currentPage + 1)} aria-label="Next">
                <span aria-hidden="true">&gt;</span>
              </button>
            </li>
            <li className="page-item">
              <button type="button" className="page-link" onClick={() => this.paginate(totalPages)} aria-label="Last">
                <span aria-hidden="true">&gt;&gt;</span>
              </button>
            </li>
          </ul>
        </nav>
  
        <div className="mt-3 ml-auto mr-5">
          <select value={itemsPerPage} onChange={this.handleChangeItemsPerPage}>
            <option value="5">5 por página</option>
            <option value="10">10 por página</option>
            <option value="30">30 por página</option>
            <option value="100">100 por página</option>
          </select>
        </div>
      </div>
    );
  }
  

  render() {
    let pagina;
  
    if (this.state.alterando) {
      pagina = this.renderAlterar();
    } else if (this.state.incluindo) {
      pagina = this.renderIncluir();
    } else {
      pagina = this.renderExibirLista();
    }
  
    return pagina;
  }
}  


