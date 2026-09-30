import React, { Component } from 'react';
import { Button, Table, TableHead, TableBody, TableCell, TableRow, TextField, Checkbox } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CytoscapeComponent from 'react-cytoscapejs';
import { API_URL, mensagemDeErro } from '../api';

// Cores das arestas conforme o número de produções em comum (NP)
const CORES_ARESTA = {
  vermelha: '#d32f2f',
  amarela: '#f9a825',
  verde: '#2e7d32'
};

const nodeStyles = [
  {
    selector: 'node',
    style: {
      'background-color': '#1a8cff',
      'label': 'data(label)',
      'text-valign': 'center',
      'text-wrap': 'wrap',
      'text-max-width': '100px',
      'width': 'label',
      'height': 'label',
      'padding': '10px',
      'shape': 'ellipse'
    }
  },
  {
    selector: '.instituto',
    style: {
      'background-color': '#ffcc00',
      'width': 'label * 1.5',
      'height': 'label * 1.5'
    }
  },
  {
    selector: '.pesquisador',
    style: {
      'background-color': '#ff6666',
      'width': 'label * 1.2',
      'height': 'label * 1.2'
    }
  },
  ...Object.entries(CORES_ARESTA).map(([classe, cor]) => ({
    selector: `.${classe}`,
    style: {
      'line-color': cor,
      'target-arrow-color': cor,
      'curve-style': 'bezier',
      'width': 2,
      'label': 'data(label)',
      'text-rotation': 'autorotate',
      'color': '#222',
      'text-background-color': '#fff',
      'text-background-opacity': 0.85
    }
  }))
];

// Tela do grafo (sobreposição em tela cheia)
const TelaGrafo = ({ elements, onCancel, tipolayout, legenda }) => (
  <div
    className="blank-screen"
    style={{ position: 'relative', width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
  >
    <h2>Gerador de Grafos</h2>

    <div className="column-1 col-1 md-3">
      <Button variant="contained" color="secondary" onClick={onCancel}>Voltar</Button>
    </div>

    <div className="mt-2">
      {legenda.map(item => (
        <span key={item.classe} className="me-3">
          <span style={{ display: 'inline-block', width: 14, height: 14, backgroundColor: CORES_ARESTA[item.classe], marginRight: 4, verticalAlign: 'middle' }} />
          {item.rotulo}
        </span>
      ))}
    </div>

    <div style={{ width: '80%', height: '70%' }}>
      <CytoscapeComponent
        elements={elements}
        layout={{
          name: tipolayout,
          radius: 10,
          spacingFactor: 0.5,
          avoidOverlap: true,
          nodeDimensionsIncludeLabels: true
        }}
        stylesheet={nodeStyles}
        style={{ width: '100%', height: '800px' }}
      />
    </div>
  </div>
);

export default class GraphGeneration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      institutos: [],
      producoes: [],
      pesquisadores: [],
      tipos: [],
      filteredPesquisadores: [],
      filteredInstitutos: [],
      filteredProducoes: [],
      selectedInstitutos: [],
      selectedProducoes: [], // tipos de produção selecionados
      selectedPesquisadores: [],
      tipoVertice: 'pesquisador',
      tipolayout: 'circle',
      // Regras de plotagem: vermelha = 1..vermelhaFim, amarela = vermelhaFim+1..amarelaFim, verde = acima disso
      vermelhaFim: 1,
      amarelaFim: 2,
      elements: [],
      showGraphOverlay: false,
      carregando: true,
      erro: null
    };
  }

  componentDidMount() {
    this.carregarDados();
  }

  fetchJson = async (rota) => {
    const response = await fetch(`${API_URL}${rota}`);
    if (!response.ok) {
      throw new Error(await mensagemDeErro(response));
    }
    return response.json();
  };

  carregarDados = async () => {
    try {
      const [pesquisadores, producoes, tipos, institutos] = await Promise.all([
        this.fetchJson('/pesquisador/exibir'),
        this.fetchJson('/trabalho/exibir/todos'),
        this.fetchJson('/tipo/exibir'),
        this.fetchJson('/instituto/exibir')
      ]);
      this.setState({ pesquisadores, producoes, tipos, institutos, carregando: false, erro: null }, this.updateFilteredData);
    } catch (error) {
      console.error('Erro ao carregar dados do grafo:', error);
      this.setState({ carregando: false, erro: 'Não foi possível carregar os dados do servidor. Verifique se o back-end está em execução.' });
    }
  };

  // Recalcula as listas de opções de cada filtro em função das seleções dos outros
  updateFilteredData = () => {
    const { producoes, pesquisadores, institutos, selectedInstitutos, selectedPesquisadores, selectedProducoes } = this.state;

    const idsInstitutos = selectedInstitutos.map(i => i.id);
    const idsPesquisadores = selectedPesquisadores.map(p => p.id);
    const idsTipos = selectedProducoes.map(t => t.id);

    const producoesDosTipos = idsTipos.length > 0
      ? producoes.filter(p => idsTipos.includes(p.tipo?.id))
      : producoes;

    let filteredProducoes = producoesDosTipos;
    if (idsInstitutos.length > 0) {
      filteredProducoes = filteredProducoes.filter(p => idsInstitutos.includes(p.pesquisador?.instituto?.id));
    }
    if (idsPesquisadores.length > 0) {
      filteredProducoes = filteredProducoes.filter(p => idsPesquisadores.includes(p.pesquisador?.id));
    }

    // Somente pesquisadores (e institutos) que tenham produção dentro dos tipos escolhidos
    let filteredPesquisadores = pesquisadores;
    if (idsInstitutos.length > 0) {
      filteredPesquisadores = filteredPesquisadores.filter(p => idsInstitutos.includes(p.instituto?.id));
    }
    if (idsTipos.length > 0) {
      const comProducao = new Set(producoesDosTipos.map(p => p.pesquisador?.id));
      filteredPesquisadores = filteredPesquisadores.filter(p => comProducao.has(p.id));
    }

    // Institutos sem pesquisadores não entram no grafo
    let filteredInstitutos = institutos.filter(i => pesquisadores.some(p => p.instituto?.id === i.id));
    if (idsPesquisadores.length > 0) {
      const institutosDosPesquisadores = new Set(selectedPesquisadores.map(p => p.instituto?.id));
      filteredInstitutos = filteredInstitutos.filter(i => institutosDosPesquisadores.has(i.id));
    }
    if (idsTipos.length > 0) {
      const institutosComProducao = new Set(producoesDosTipos.map(p => p.pesquisador?.instituto?.id));
      filteredInstitutos = filteredInstitutos.filter(i => institutosComProducao.has(i.id));
    }

    this.setState({ filteredInstitutos, filteredPesquisadores, filteredProducoes });
  };

  // Busca no servidor as arestas (trabalhos em comum), respeitando o filtro de tipo de produção
  buscarArestas = () => {
    const { tipoVertice, selectedProducoes } = this.state;
    const rota = tipoVertice === 'instituto'
      ? '/instituto/contarTrabalhosEntreInstitutos'
      : '/pesquisador/contarTrabalhosEntrePesquisadores';
    const params = selectedProducoes.length > 0 ? `?tipoIds=${selectedProducoes.map(t => t.id).join(',')}` : '';
    return this.fetchJson(rota + params);
  };

  applyFilters = async () => {
    const { tipoVertice, filteredPesquisadores, filteredInstitutos, selectedPesquisadores, selectedInstitutos, filteredProducoes } = this.state;
    const usaInstituto = tipoVertice === 'instituto';

    const vertices = usaInstituto
      ? (selectedInstitutos.length > 0 ? selectedInstitutos : filteredInstitutos)
      : (selectedPesquisadores.length > 0 ? selectedPesquisadores : filteredPesquisadores);

    if (vertices.length === 0) {
      alert('Nenhum vértice encontrado para os filtros selecionados.');
      return;
    }

    let arestas;
    try {
      arestas = await this.buscarArestas();
    } catch (error) {
      alert('Não foi possível gerar o grafo: ' + error.message);
      return;
    }

    // Os ids dos vértices são os ids do banco: nomes repetidos ou com hífen não causam ambiguidade
    const prefixo = usaInstituto ? 'i' : 'p';
    const idsVertices = new Set(vertices.map(v => v.id));
    const elements = [];

    vertices.forEach(vertice => {
      const producoesCount = filteredProducoes.filter(p =>
        (usaInstituto ? p.pesquisador?.instituto?.id : p.pesquisador?.id) === vertice.id
      ).length;
      elements.push({
        data: {
          id: `${prefixo}-${vertice.id}`,
          label: `${vertice.nome} (${producoesCount} produções)`,
          group: usaInstituto ? vertice.nome : vertice.instituto?.nome
        },
        classes: usaInstituto ? 'instituto' : 'pesquisador'
      });
    });

    arestas
      .filter(a => idsVertices.has(a.origemId) && idsVertices.has(a.destinoId))
      .forEach(a => {
        elements.push({
          data: {
            id: `e-${prefixo}-${a.origemId}-${a.destinoId}`,
            source: `${prefixo}-${a.origemId}`,
            target: `${prefixo}-${a.destinoId}`,
            label: String(a.quantidade)
          },
          classes: this.getEdgeColor(a.quantidade)
        });
      });

    this.setState({ elements, showGraphOverlay: true });
  };

  getEdgeColor = (valor) => {
    const { vermelhaFim, amarelaFim } = this.state;
    if (valor <= vermelhaFim) return 'vermelha';
    if (valor <= amarelaFim) return 'amarela';
    return 'verde'; // a última faixa não tem limite superior
  };

  handleMultipleSelectChange = (event, value, type) => {
    this.setState({ [type]: value }, this.updateFilteredData);
  };

  handleVerticeChange = (event) => {
    this.setState({ tipoVertice: event.target.value });
  };

  // index 0 = faixa vermelha, 1 = faixa amarela. Cada faixa começa logo após o fim da anterior.
  handleNpFimChange = (index, texto) => {
    const valor = parseInt(texto, 10);
    if (Number.isNaN(valor)) {
      return; // campo vazio ou inválido: mantém o valor atual
    }
    this.setState(({ vermelhaFim, amarelaFim }) => {
      if (index === 0) {
        const novoVermelha = Math.max(1, valor);
        return { vermelhaFim: novoVermelha, amarelaFim: Math.max(amarelaFim, novoVermelha + 1) };
      }
      return { amarelaFim: Math.max(vermelhaFim + 1, valor) };
    });
  };

  renderAutocomplete = ({ titulo, opcoes, selecionados, tipo, rotulo }) => (
    <div className="col-md-3">
      <label><h5>{titulo}</h5></label>
      <Autocomplete
        multiple
        options={opcoes}
        getOptionLabel={rotulo}
        isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
        value={selecionados}
        onChange={(event, value) => this.handleMultipleSelectChange(event, value, tipo)}
        renderInput={(params) => <TextField {...params} variant="outlined" label="Todos" />}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={option.id}>
            <Checkbox checked={selected} style={{ marginRight: 8 }} />
            {rotulo(option)}
          </li>
        )}
      />
    </div>
  );

  render() {
    const {
      filteredInstitutos, tipos, filteredPesquisadores, selectedInstitutos, selectedProducoes, selectedPesquisadores,
      tipoVertice, vermelhaFim, amarelaFim, showGraphOverlay, elements, tipolayout, carregando, erro
    } = this.state;

    if (carregando) {
      return <div className="p-5"><h1 className="p-2">Gerador de Grafo</h1><p>Carregando dados...</p></div>;
    }
    if (erro) {
      return (
        <div className="p-5">
          <h1 className="p-2">Gerador de Grafo</h1>
          <p className="text-danger">{erro}</p>
          <Button variant="contained" color="primary" onClick={() => { this.setState({ carregando: true }); this.carregarDados(); }}>
            Tentar novamente
          </Button>
        </div>
      );
    }

    const faixas = [
      { nome: 'Vermelha', inicio: 1, fim: vermelhaFim, editavel: true },
      { nome: 'Amarela', inicio: vermelhaFim + 1, fim: amarelaFim, editavel: true },
      { nome: 'Verde', inicio: amarelaFim + 1, fim: null, editavel: false }
    ];
    const legenda = [
      { classe: 'vermelha', rotulo: `Vermelha (${faixas[0].inicio} a ${faixas[0].fim})` },
      { classe: 'amarela', rotulo: `Amarela (${faixas[1].inicio} a ${faixas[1].fim})` },
      { classe: 'verde', rotulo: `Verde (${faixas[2].inicio} ou mais)` }
    ];

    return (
      <div className="p-5">
        <h1 className="p-2">Gerador de Grafo</h1>
        <div className="row">
          {this.renderAutocomplete({ titulo: 'Instituto:', opcoes: filteredInstitutos, selecionados: selectedInstitutos, tipo: 'selectedInstitutos', rotulo: o => o.nome })}
          {this.renderAutocomplete({ titulo: 'Produção:', opcoes: tipos, selecionados: selectedProducoes, tipo: 'selectedProducoes', rotulo: o => o.nome })}
          {this.renderAutocomplete({ titulo: 'Pesquisador:', opcoes: filteredPesquisadores, selecionados: selectedPesquisadores, tipo: 'selectedPesquisadores', rotulo: o => o.nome })}
          <div className="col-md-3">
            <label><h5>Tipo de Vértice:</h5></label>
            <select value={tipoVertice} onChange={this.handleVerticeChange} className="form-control">
              <option value="pesquisador">Pesquisador</option>
              <option value="instituto">Instituto</option>
            </select>
          </div>
        </div>
        <div className="row">
          <div className="m-2 col-md-4">
            <label><h5>Tipo layout grafo:</h5></label>
            <select value={tipolayout} onChange={(e) => this.setState({ tipolayout: e.target.value })} className="form-control">
              <option value="breadthfirst">Breadthfirst</option>
              <option value="circle">Circle</option>
              <option value="concentric">Concentric</option>
              <option value="random">Random</option>
            </select>
          </div>
          <div className="text-right m-4 col-md-4">
            <Button variant="contained" color="primary" onClick={this.applyFilters}>Aplicar</Button>
          </div>
        </div>
        <h2 className="mt-4">Regras de Plotagem (Número de Produção - NP): </h2>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Aresta</TableCell>
              <TableCell>Valor NP (Início)</TableCell>
              <TableCell>Valor NP (Fim)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {faixas.map((faixa, index) => (
              <TableRow key={faixa.nome}>
                <TableCell>{faixa.nome}</TableCell>
                <TableCell>{faixa.inicio}</TableCell>
                <TableCell>
                  {faixa.editavel ? (
                    <TextField
                      type="number"
                      value={faixa.fim}
                      onChange={(e) => this.handleNpFimChange(index, e.target.value)}
                      inputProps={{ min: faixa.inicio }}
                    />
                  ) : (
                    'sem limite'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {showGraphOverlay && (
          <div className="graph-overlay">
            <div style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: 100, backgroundColor: 'rgba(255, 255, 255, 0.95)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <TelaGrafo
                elements={elements}
                tipolayout={tipolayout}
                legenda={legenda}
                onCancel={() => this.setState({ showGraphOverlay: false })}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
