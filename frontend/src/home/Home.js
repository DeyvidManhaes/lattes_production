import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import '../home/Home.css';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useNavigate } from 'react-router-dom';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { API_URL } from '../api';


// Registrar componentes Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement,ChartDataLabels);

const Home = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [buscainstituto, setBuscaInstituto] = useState('');
  const [buscapesquisador, setBuscaPesquisador] = useState('');
  const [buscatipoproducao, setBuscaTipoProducao] = useState('');
  const [contador, setContador] = useState(0);
  const [trabalhos, setTrabalhos] = useState([]);
  const [filteredTrabalhos, setFilteredTrabalhos] = useState([]);
  const [institutos, setInstitutos] = useState([]);
  const [pesquisadores, setPesquisadores] = useState([]);
  const [showBarChart, setShowBarChart] = useState(false);

  const [chartDataBar, setChartDataBar] = useState({
    labels: [],
    datasets: [
      {
        label: 'Produções',
        data: [],
        backgroundColor: 'rgba(75,192,192,0.6)'
      }
    ]
  });
  const [chartDataPie, setChartDataPie] = useState({
    labels: ['Artigos', 'Livros'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#FF6384', '#36A2EB']
      }
    ]
  });
  const doughnutOptions = {
  plugins: {
    datalabels: {
      formatter: (value, context) => {
        const total = context.chart._metasets[0].total;
        const percentage = ((value / total) * 100).toFixed(2) + '%';
        return percentage;
      },
      color: '#fff',
      font: {
        weight: 'bold'
      }
    }
  }
};

  const navigate = useNavigate();

  useEffect(() => {
    fetchTrabalhos();
    fetchPesquisadores();
  }, []);

  const fetchTrabalhos = () => {
    const url = API_URL + "/trabalho/exibir";
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setTrabalhos(data);
        setFilteredTrabalhos(data);
        setContador(data.length);
        updateCharts(data);
        updateChartsPie(data);
      })
      .catch(error => console.error('Erro ao buscar trabalhos:', error));
  };

  const fetchPesquisadores = () => {
    const url = API_URL + "/pesquisador/exibir";
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
        setPesquisadores(data);
        setInstitutos(institutosUnicos);
      })
      .catch(error => console.error('Erro ao buscar pesquisadores:', error));
  };

  const handleDataInicioChange = (event) => {
    setDataInicio(event.target.value);
  };

  const handleDataFimChange = (event) => {
    setDataFim(event.target.value);
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    if (name === 'buscainstituto') setBuscaInstituto(value);
    if (name === 'buscapesquisador') setBuscaPesquisador(value);
    if (name === 'buscatipoproducao') setBuscaTipoProducao(value);
  };

  const handleAplicarFiltro = () => {
  const trabalhosFiltrados = trabalhos.filter(trabalho => {
    const pesquisador = pesquisadores.find(pesq => pesq.id === trabalho.pesquisador?.id);
    const byInstituto = buscainstituto ? pesquisador && pesquisador.instituto && pesquisador.instituto.nome === buscainstituto : true;
    const byPesquisador = buscapesquisador ? trabalho.pesquisador && trabalho.pesquisador.id === parseInt(buscapesquisador) : true;
    const byTipo = buscatipoproducao ? trabalho.tipo && trabalho.tipo.nome === buscatipoproducao : true;
    const byAnoInicio = dataInicio ? trabalho.ano >= dataInicio : true;
    const byAnoFim = dataFim ? trabalho.ano <= dataFim : true;

    return byInstituto && byPesquisador && byTipo && byAnoInicio && byAnoFim;
  });
    

  setFilteredTrabalhos(trabalhosFiltrados);
  setCurrentPage(1);
  setContador(trabalhosFiltrados.length);
  updateCharts(trabalhosFiltrados);
  setShowBarChart(true); // Exibir o gráfico de barras após aplicar o filtro
};


  const updateCharts = (trabalhosFiltrados) => {
    const chartData = trabalhosFiltrados.reduce((acc, trabalho) => {
      const ano = trabalho.ano;
      if (!acc[ano]) acc[ano] = 0;
      acc[ano]++;
      return acc;
    }, {});


    setChartDataBar({
      labels: Object.keys(chartData),
      datasets: [
        {
          label: 'Produções',
          data: Object.values(chartData),
          backgroundColor: 'rgba(75,192,192,0.6)'
        }
      ]
    });

   
  };
    const updateChartsPie = (trabalhos) => {
    
    const articleCount = trabalhos.filter(trabalho => trabalho.tipo && trabalho.tipo.nome === 'Artigo Publicado').length;
    const bookCount = trabalhos.filter(trabalho => trabalho.tipo && trabalho.tipo.nome === 'Livro Publicado').length;

    setChartDataPie({
      labels: ['Artigos', 'Livros'],
      datasets: [
        {
          data: [articleCount, bookCount],
          backgroundColor: ['#FF6384', '#36A2EB']
        }
      ]
    });
  };

  const handleBarClick = (elements) => {
  if (elements.length > 0) {
    const chartIndex = elements[0].index;
    const ano = chartDataBar.labels[chartIndex];

    navigate(`/producao?dataInicio=${ano}&dataFim=${ano}&buscainstituto=${buscainstituto}&buscapesquisador=${buscapesquisador}&buscatipoproducao=${buscatipoproducao}`);
  }
};


  const anosTrabalhos = [...new Set(filteredTrabalhos.map(trabalho => trabalho.ano))];
  const anosFiltradosInicio = anosTrabalhos.filter(ano => !dataFim || ano <= dataFim).sort((a, b) => b - a);
  const anosFiltradosFim = anosTrabalhos.filter(ano => !dataInicio || ano >= dataInicio).sort((a, b) => b - a);
  const pesquisadoresFiltrados = buscainstituto ? pesquisadores.filter(p => p.instituto?.nome === buscainstituto) : pesquisadores;

  return (
    <div>
      {/* Título na parte superior da página */}
      <div className="title-container">
        <hr /> {/* Linha horizontal */}
        <br /> {/* Espaço extra */}
        <h2>Painel Principal</h2>
      </div>

      {/* Seção de pesquisa */}
      <div className="search row mt-3 justify-content-between">
        <div className="row">
          <div className="col-md-3">
            <label><h5>Ano Início:</h5></label>
            <select className="form-control" value={dataInicio} onChange={handleDataInicioChange}>
              <option value="">Todos</option>
              {anosFiltradosInicio.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label><h5>Ano Fim:</h5></label>
            <select className="form-control" value={dataFim} onChange={handleDataFimChange}>
              <option value="">Todos</option>
              {anosFiltradosFim.map(ano => (
                <option key={ano} value={ano}>{ano}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <Button variant="contained" color="primary" onClick={handleAplicarFiltro} className="col mt-3"><h6>Aplicar Filtro</h6></Button>
          </div>
        </div>
        <div className='row mt-1'>
          <div className="col-md-3">
            <label><h5>Instituto:</h5></label>
            <select name="buscainstituto" value={buscainstituto} onChange={handleFilterChange} className="form-control">
              <option value="">Todos</option>
              {institutos.map((instituto, index) => (
                <option key={index} value={instituto}>{instituto}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label><h5>Pesquisador:</h5></label>
            <select name="buscapesquisador" value={buscapesquisador} onChange={handleFilterChange} className="form-control">
              <option value="">Todos</option>
              {pesquisadoresFiltrados.map(pesquisador => (
                <option key={pesquisador.id} value={pesquisador.id}>{pesquisador.nome}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label><h5>Tipo de Produção:</h5></label>
            <select name="buscatipoproducao" value={buscatipoproducao} onChange={handleFilterChange} className="form-control">
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

      {/* Estrutura do gráfico*/}
     <div className="row mt-1">
  <div className="col-md-12">
    <div className="chart-container" style={{ height: '400px' }}> {/* Ajuste a altura conforme necessário */}
      <h4>Produções por Ano</h4>
      {showBarChart && (
        <Bar
          data={chartDataBar}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true
              }
            },
            onClick: (event, elements) => handleBarClick(elements)
          }}
          height={null}
          width={null}
        />
      )}
    </div>
  </div>
</div>

      
     

      {/* Retângulos abaixo do gráfico principal */}
      <div className="row mt-1">
        <div className="col-md-3">
          <div className="info-box" onClick={() => navigate('/producao')}>
            <h5 className='mt-1'>Total Produção</h5>
            <div className="chart--container">
              <Doughnut data={chartDataPie} options={doughnutOptions} />
            </div>
           
          </div>
        </div>
        <div className="col-md-3">
          <div className="info-box" onClick={() => navigate('/instituto')}>
            <h5>Institutos</h5>
            <div className="badge text-bg-primary text-wrap"><h1>{institutos.length}</h1></div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="info-box" onClick={() => navigate('/pesquisador')}>
            <h5>Pesquisadores</h5>
            <div className="badge text-bg-primary text-wrap"><h1>{pesquisadores.length}</h1></div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="info-box" onClick={() => navigate('/grafo')}>
            <h5>Grafo</h5>
            <div className="img-container">
              <img src="https://ims.tech/wp-content/uploads/2020/06/icon_graph.svg" alt="Gráfico Indicativo" className="img-fluid" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

