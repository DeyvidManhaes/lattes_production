package desenvolvimento.sistemas1.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import desenvolvimento.sistemas1.dto.ImportacaoResultado;
import desenvolvimento.sistemas1.exception.ConflitoException;
import desenvolvimento.sistemas1.exception.RecursoNaoEncontradoException;
import desenvolvimento.sistemas1.exception.RequisicaoInvalidaException;
import desenvolvimento.sistemas1.model.Instituto;
import desenvolvimento.sistemas1.model.NomeCitacao;
import desenvolvimento.sistemas1.model.Pesquisador;
import desenvolvimento.sistemas1.model.PesquisadorRequest;
import desenvolvimento.sistemas1.model.Tipo;
import desenvolvimento.sistemas1.model.Trabalho;
import desenvolvimento.sistemas1.repository.InstitutoRepository;
import desenvolvimento.sistemas1.repository.NomeCitacaoRepository;
import desenvolvimento.sistemas1.repository.PesquisadorRepository;
import desenvolvimento.sistemas1.repository.TipoRepository;
import desenvolvimento.sistemas1.repository.TrabalhoRepository;
import desenvolvimento.sistemas1.service.XMLReaderService.CurriculoLattes;
import desenvolvimento.sistemas1.service.XMLReaderService.TipoProducao;
import desenvolvimento.sistemas1.service.XMLReaderService.TrabalhoExtraido;

/** Regras de importacao e exclusao de pesquisadores. Tudo ocorre em uma unica transacao. */
@Service
public class PesquisadorService {

    private final PesquisadorRepository pesquisadorRepository;
    private final InstitutoRepository institutoRepository;
    private final TrabalhoRepository trabalhoRepository;
    private final TipoRepository tipoRepository;
    private final NomeCitacaoRepository nomeCitacaoRepository;
    private final XMLReaderService xmlReaderService;

    public PesquisadorService(PesquisadorRepository pesquisadorRepository, InstitutoRepository institutoRepository,
            TrabalhoRepository trabalhoRepository, TipoRepository tipoRepository,
            NomeCitacaoRepository nomeCitacaoRepository, XMLReaderService xmlReaderService) {
        this.pesquisadorRepository = pesquisadorRepository;
        this.institutoRepository = institutoRepository;
        this.trabalhoRepository = trabalhoRepository;
        this.tipoRepository = tipoRepository;
        this.nomeCitacaoRepository = nomeCitacaoRepository;
        this.xmlReaderService = xmlReaderService;
    }

    @Transactional
    public ImportacaoResultado importar(PesquisadorRequest request) {
        if (request == null || request.getInstitutoId() == null) {
            throw new RequisicaoInvalidaException("Informe o instituto do pesquisador.");
        }
        Instituto instituto = institutoRepository.findById(request.getInstitutoId())
                .orElseThrow(() -> new RecursoNaoEncontradoException("Instituto não encontrado."));

        CurriculoLattes curriculo = xmlReaderService.lerCurriculo(request.getArquivoId());
        Pesquisador novo = curriculo.pesquisador();

        if (pesquisadorRepository.existsById(novo.getId())) {
            throw new ConflitoException("O pesquisador " + novo.getNome() + " já está cadastrado.");
        }

        Tipo artigo = buscarTipo(Tipo.ARTIGO_PUBLICADO);
        Tipo livro = buscarTipo(Tipo.LIVRO_PUBLICADO);

        novo.setInstituto(instituto);
        // O id do pesquisador e o do Lattes (atribuido), entao save() faz merge e devolve outra instancia.
        Pesquisador pesquisador = pesquisadorRepository.save(novo);

        for (TrabalhoExtraido extraido : curriculo.trabalhos()) {
            Trabalho trabalho = extraido.trabalho();
            trabalho.setPesquisador(pesquisador);
            trabalho.setTipo(extraido.tipo() == TipoProducao.ARTIGO ? artigo : livro);
            trabalho = trabalhoRepository.save(trabalho);

            NomeCitacao citacao = new NomeCitacao();
            citacao.setNome(extraido.nomesCitacao());
            citacao.setTrabalho(trabalho);
            nomeCitacaoRepository.save(citacao);
        }

        int importados = curriculo.trabalhos().size();
        String mensagem = "Pesquisador " + pesquisador.getNome() + " cadastrado com " + importados + " trabalho(s)."
                + (curriculo.ignorados() > 0
                        ? " " + curriculo.ignorados() + " item(ns) foram ignorados por dados incompletos."
                        : "");
        return new ImportacaoResultado(pesquisador.getId(), pesquisador.getNome(), importados, curriculo.ignorados(),
                mensagem);
    }

    @Transactional
    public void excluir(Long id) {
        if (!pesquisadorRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Pesquisador não encontrado.");
        }
        nomeCitacaoRepository.apagarPorPesquisadorId(id);
        trabalhoRepository.apagarPorPesquisadorId(id);
        pesquisadorRepository.deleteById(id);
    }

    private Tipo buscarTipo(String nome) {
        return tipoRepository.findFirstByNomeOrderByIdAsc(nome)
                .orElseThrow(() -> new IllegalStateException("Tipo de produção não cadastrado: " + nome));
    }
}
