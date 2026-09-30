import React, { Component } from 'react';
import { Button, Table, TableHead, TableBody, TableCell, TableRow } from '@mui/material';
import './ProducaoList.css';
import { API_URL } from '../api';

export default class Producao extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: 1,
      itemsPerPage: 30,
      dataInicio: '',
      dataFim: '',
      buscainstituto: '',
      buscapesquisador: '',
      buscatipoproducao: '',
      contador: 0,
      trabalhos: [],
      filteredTrabalhos: [],
      pesquisadores: [],
      institutos: [],
      institutosFiltrados: [],
      nomesCitacao: [],
    };
  }

  componentDidMount() {
    this.fetchTrabalhos();
    this.fetchPesquisadores();
    this.fetchNomes();
    this.updateFiltersFromURL();
  }

  fetchTrabalhos = () => {
    const url = API_URL + '/trabalho/exibir';
    fetch(url)
      .then(response => response.json())
      .then(data => {
        this.setState({ trabalhos: data, filteredTrabalhos: data, contador: data.length }, () => {
          this.updateFiltersFromURL();
        });
      })
      .catch(error => console.error('Erro ao buscar trabalhos:', error));
  };

  fetchPesquisadores = () => {
    const url = API_URL + '/pesquisador/exibir';
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const institutos = data.reduce((acc, pesquisador) => {
          if (pesquisador.instituto && pesquisador.instituto.nome) {
            acc.push(pesquisador.instituto.nome);
          }
          return acc;
        }, []);
        const institutosUnicos = Array.from(new Set(institutos));
        this.setState({ pesquisadores: data, institutos: institutosUnicos, institutosFiltrados: institutosUnicos });
      })
      .catch(error => console.error('Erro ao buscar pesquisadores:', error));
  };

  fetchNomes = () => {
    const url = API_URL + '/nome/exibir';
    fetch(url)
      .then(response => response.json())
      .then(datanome => this.setState({ nomesCitacao: datanome }))
      .catch(error => console.error('Erro ao buscar nomes:', error));
  };

  updateFiltersFromURL = () => {
    const params = new URLSearchParams(window.location.search);
    const dataInicio = params.get('dataInicio');
    const dataFim = params.get('dataFim');
    const buscainstituto = params.get('buscainstituto');
    const buscapesquisador = params.get('buscapesquisador');
    const buscatipoproducao = params.get('buscatipoproducao');

    this.setState({
      dataInicio: dataInicio || '',
      dataFim: dataFim || '',
      buscainstituto: buscainstituto || '',
      buscapesquisador: buscapesquisador || '',
      buscatipoproducao: buscatipoproducao || '',
    }, () => {
      if (this.state.trabalhos.length > 0) {
        this.handleAplicarFiltro();
      }
    });
  };

  handleDataInicioChange = event => {
    this.setState({ dataInicio: event.target.value });
  };

  handleDataFimChange = event => {
    this.setState({ dataFim: event.target.value });
  };

  handleFilterChange = event => {
    const { name, value } = event.target;
    this.setState({ [name]: value }, () => {
      if (name === 'buscainstituto') {
        this.filterPesquisadoresByInstituto(value);
      }
      if (name === 'buscapesquisador') {
        this.filterInstitutoByPesquisadores(value);
      }
    });
  };

  filterPesquisadoresByInstituto = instituto => {
    const { pesquisadores } = this.state;
    const pesquisadoresFiltrados = pesquisadores.filter(pesquisador => {
      return pesquisador.instituto && pesquisador.instituto.nome === instituto;
    });
    this.setState({ pesquisadoresFiltrados });
  };

  filterInstitutoByPesquisadores = pesquisadorId => {
    const { pesquisadores } = this.state;
    const pesquisador = pesquisadores.find(p => p.id === parseInt(pesquisadorId));
    if (pesquisador) {
      this.setState({ institutosFiltrados: pesquisador.instituto ? [pesquisador.instituto.nome] : this.state.institutos, buscainstituto: pesquisador.instituto?.nome || "" });
    } else {
      this.setState({ institutosFiltrados: this.state.institutos, buscainstituto: '' });
    }
  };

  handleAplicarFiltro = () => {
    const { buscainstituto, buscapesquisador, buscatipoproducao, dataInicio, dataFim, pesquisadores, trabalhos } = this.state;

    let trabalhosFiltrados = trabalhos.filter(trabalho => {
      const pesquisador = pesquisadores.find(pesq => pesq.id === trabalho.pesquisador?.id);
      const byPesquisador = buscapesquisador ? trabalho.pesquisador && trabalho.pesquisador.id === parseInt(buscapesquisador) : true;
      const byTipo = buscatipoproducao ? trabalho.tipo && trabalho.tipo.nome === buscatipoproducao : true;
      const byAnoInicio = dataInicio ? trabalho.ano >= dataInicio : true;
      const byAnoFim = dataFim ? trabalho.ano <= dataFim : true;

      return byPesquisador && byTipo && byAnoInicio && byAnoFim;
    });

    if (buscainstituto) {
      const pesquisadoresFiltrados = pesquisadores.filter(pesquisador => pesquisador.instituto && pesquisador.instituto.nome === buscainstituto);
      trabalhosFiltrados = trabalhosFiltrados.filter(trabalho => {
        return pesquisadoresFiltrados.some(pesquisador => pesquisador.id === trabalho.pesquisador?.id);
      });
    }

    this.setState({
      filteredTrabalhos: trabalhosFiltrados,
      currentPage: 1,
      contador: trabalhosFiltrados.length,
    });
  };

  renderItems = () => {
    const { currentPage, itemsPerPage, filteredTrabalhos } = this.state;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTrabalhos.slice(indexOfFirstItem, indexOfLastItem);

    return currentItems.map((trabalho, index) => (
      <TableRow key={index}>
        <TableCell>{trabalho.tipo ? trabalho.tipo.nome : 'Tipo não disponível'}</TableCell>
        <TableCell>{this.getDetalhamento(trabalho)}</TableCell>
      </TableRow>
    ));
  };

  getDetalhamento = trabalho => {
    if (trabalho && trabalho.tipo) {
      const tipoNome = trabalho.tipo.nome;
      if (tipoNome === 'Livro Publicado') {
        const nomeCitacaoLivro = this.getNomeCitacaoById(trabalho.id);
        return `${nomeCitacaoLivro}, ${trabalho.titulo}, ${trabalho.editora}, ${trabalho.local}, ${trabalho.ano}`;
      } else if (tipoNome === 'Artigo Publicado') {
        const nomeCitacaoArtigo = this.getNomeCitacaoById(trabalho.id) || '';
        return `${nomeCitacaoArtigo}, ${trabalho.titulo}, ${trabalho.periodico}, ${trabalho.local}, ${trabalho.ano}`;
      }
    }
    return 'Detalhes não disponíveis';
  };

  getNomeCitacaoById = trabalhoId => {
    const { nomesCitacao } = this.state;
    const nomeCitacao = nomesCitacao.find(nome => nome.trabalho?.id === trabalhoId);
    return nomeCitacao ? nomeCitacao.nome : '';
  };

  handleChangeItemsPerPage = event => {
    this.setState({ itemsPerPage: parseInt(event.target.value), currentPage: 1 });
  };

  paginate = pageNumber => {
    this.setState({ currentPage: pageNumber });
  };

  render() {
    const { currentPage, pesquisadores, institutosFiltrados, itemsPerPage, dataInicio, dataFim, buscainstituto, buscapesquisador, buscatipoproducao, contador, filteredTrabalhos } = this.state;
    const totalPages = Math.ceil(filteredTrabalhos.length / itemsPerPage);
    const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

    const anosTrabalhos = [...new Set(filteredTrabalhos.map(trabalho => trabalho.ano))];
    const anosFiltradosInicio = anosTrabalhos.filter(ano => !dataFim || ano <= dataFim).sort((a, b) => b - a);
    const anosFiltradosFim = anosTrabalhos.filter(ano => !dataInicio || ano >= dataInicio).sort((a, b) => b - a);
    const pesquisadoresFiltrados = buscainstituto ? pesquisadores.filter(p => p.instituto?.nome === buscainstituto) : pesquisadores;

    return (
      <div className='p-1 mt-5'>
        <h1>Itens de Produção</h1>
        <div className='search row mt-3 justify-content-between'>
          <div className='row'>
            <div className='col-md-3'>
              <label><h5>Ano Início:</h5></label>
              <select className='form-control' value={dataInicio} onChange={this.handleDataInicioChange}>
                <option value=''>Todos</option>
                {anosFiltradosInicio.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
            <div className='col-md-3'>
              <label><h5>Ano Fim:</h5></label>
              <select className='form-control' value={dataFim} onChange={this.handleDataFimChange}>
                <option value=''>Todos</option>
                {anosFiltradosFim.map(ano => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
            <div className='col-md-2'>
              <Button variant='contained' color='primary' onClick={this.handleAplicarFiltro} className='col mt-3'><h6>Aplicar Filtro</h6></Button>
            </div>
          </div>
          <div className='row mt-1'>
            <div className="col-md-3">
              <label><h5>Instituto:</h5></label>
              <select name="buscainstituto" value={buscainstituto} onChange={this.handleFilterChange} className="form-control">
                <option value="">Todos</option>
                {institutosFiltrados.map((instituto, index) => (
                  <option key={index} value={instituto}>{instituto}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label><h5>Pesquisador:</h5></label>
              <select name="buscapesquisador" value={buscapesquisador} onChange={this.handleFilterChange} className="form-control">
                <option value="">Todos</option>
                {pesquisadoresFiltrados.map(pesquisador => (
                  <option key={pesquisador.id} value={pesquisador.id}>{pesquisador.nome}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
                <label><h5>Tipo de Produção:</h5></label>
            <select name="buscatipoproducao" value={buscatipoproducao} onChange={this.handleFilterChange} className="form-control">
              <option value="">Todos</option>
              {filteredTrabalhos.reduce((acc, trabalho) => {
                if (trabalho.tipo && trabalho.tipo.nome && !acc.includes(trabalho.tipo.nome)) {
                  acc.push(trabalho.tipo.nome);
                }
                return acc;
              }, []).map((tipo, index) => (
                <option key={index} value={tipo}>{tipo}</option>
              ))}
            </select>
            </div>
          </div>
        </div>

        <div className='p-3 col'> 
          <label className=''><h5>Total de trabalhos:</h5></label>
          <div className='badge text-bg-primary text-wrap col-1'>
            <h4>{contador}</h4>
          </div>
        </div>

        <Table className='mt-2'>
          <TableHead>
            <TableRow className='search-container mt-5 p-5'>
              <TableCell>Tipo</TableCell>
              <TableCell>Detalhamento</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderItems()}
          </TableBody>
        </Table>

        <nav aria-label='Page navigation example' className='mt-3'>
          <ul className='pagination justify-content-center'>
            <li className='page-item'>
              <button type='button' className='page-link' onClick={() => this.paginate(1)} aria-label='First'>
                <span aria-hidden='true'>&lt;&lt;</span>
              </button>
            </li>
            <li className='page-item'>
              <button type='button' className='page-link' onClick={() => this.paginate(currentPage - 1)} aria-label='Previous'>
                <span aria-hidden='true'>&lt;</span>
              </button>
            </li>
            {pageNumbers.map((number) => (
              <li key={number} className={`page-item ${number === currentPage ? 'active' : ''}`}>
                <button type='button' className='page-link' onClick={() => this.paginate(number)}>{number}</button>
              </li>
            ))}
            <li className='page-item'>
              <button type='button' className='page-link' onClick={() => this.paginate(currentPage + 1)} aria-label='Next'>
                <span aria-hidden='true'>&gt;</span>
              </button>
            </li>
            <li className='page-item'>
              <button type='button' className='page-link' onClick={() => this.paginate(totalPages)} aria-label='Last'>
                <span aria-hidden='true'>&gt;&gt;</span>
              </button>
            </li>
          </ul>
        </nav>

        <div className='mt-3 ml-auto mr-5'>
          <select value={itemsPerPage} onChange={this.handleChangeItemsPerPage}>
            <option value='5'>5 por página</option>
            <option value='10'>10 por página</option>
            <option value='30'>30 por página</option>
            <option value='100'>100 por página</option>
          </select>
        </div>
      </div>
    );
  }
}


