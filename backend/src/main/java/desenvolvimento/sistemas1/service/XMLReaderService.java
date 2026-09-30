package desenvolvimento.sistemas1.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;

import desenvolvimento.sistemas1.exception.RecursoNaoEncontradoException;
import desenvolvimento.sistemas1.exception.RequisicaoInvalidaException;
import desenvolvimento.sistemas1.model.Pesquisador;
import desenvolvimento.sistemas1.model.Trabalho;

/**
 * Le um curriculo Lattes (XML) e devolve o pesquisador e suas producoes
 * bibliograficas (artigos, livros e capitulos de livros).
 *
 * O servico nao guarda estado entre chamadas: cada leitura devolve um
 * {@link CurriculoLattes} independente, o que evita misturar dados de
 * requisicoes concorrentes.
 */
@Service
public class XMLReaderService {

    private static final Logger logger = LoggerFactory.getLogger(XMLReaderService.class);
    private static final int TAMANHO_MAXIMO_CITACOES = 5000;

    public enum TipoProducao {
        ARTIGO, LIVRO
    }

    /** Trabalho extraido junto com os nomes de citacao dos seus autores. */
    public record TrabalhoExtraido(Trabalho trabalho, String nomesCitacao, TipoProducao tipo) {
    }

    /** Resultado da leitura de um curriculo. */
    public record CurriculoLattes(Pesquisador pesquisador, List<TrabalhoExtraido> trabalhos, int ignorados) {
    }

    /** Acumula os itens extraidos e a quantidade de itens descartados. */
    private static class Coletor {
        final List<TrabalhoExtraido> itens = new ArrayList<>();
        int ignorados = 0;
    }

    @Value("${lattes.curriculos-dir:./curriculos_xml}")
    private String curriculosDir;

    public CurriculoLattes lerCurriculo(String arquivoId) {
        Path arquivo = localizarArquivo(arquivoId);
        Document doc = parse(arquivo);
        Element root = doc.getDocumentElement();

        Pesquisador pesquisador = extrairPesquisador(root, arquivoId);
        Coletor coletor = new Coletor();
        extrairTrabalhos(root, coletor);

        logger.info("Curriculo {} lido: {} trabalhos importaveis, {} ignorados", arquivoId, coletor.itens.size(),
                coletor.ignorados);
        return new CurriculoLattes(pesquisador, coletor.itens, coletor.ignorados);
    }

    // ------------------------------------------------------------------
    // Arquivo e parser
    // ------------------------------------------------------------------

    private Path localizarArquivo(String arquivoId) {
        // Somente digitos: impede caracteres de caminho (../) na montagem do nome do arquivo.
        if (arquivoId == null || !arquivoId.matches("\\d{1,16}")) {
            throw new RequisicaoInvalidaException(
                    "O identificador do curriculo deve conter apenas digitos (ate 16), por exemplo 0348923590713594.");
        }
        Path base = Paths.get(curriculosDir).toAbsolutePath().normalize();
        Path arquivo = base.resolve(arquivoId + ".xml").normalize();
        if (!arquivo.startsWith(base) || !Files.isRegularFile(arquivo)) {
            throw new RecursoNaoEncontradoException(
                    "Curriculo XML nao encontrado: " + arquivoId + ".xml (pasta configurada: " + base + ")");
        }
        return arquivo;
    }

    private Document parse(Path arquivo) {
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
            factory.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
            factory.setFeature("http://xml.org/sax/features/external-general-entities", false);
            factory.setFeature("http://xml.org/sax/features/external-parameter-entities", false);
            factory.setXIncludeAware(false);
            factory.setExpandEntityReferences(false);

            try (InputStream in = Files.newInputStream(arquivo)) {
                Document doc = factory.newDocumentBuilder().parse(in);
                doc.getDocumentElement().normalize();
                return doc;
            }
        } catch (ParserConfigurationException | SAXException | IOException e) {
            logger.error("Erro ao ler o XML {}: {}", arquivo, e.getMessage());
            throw new RequisicaoInvalidaException("Nao foi possivel ler o XML do curriculo: " + e.getMessage());
        }
    }

    // ------------------------------------------------------------------
    // Pesquisador
    // ------------------------------------------------------------------

    private Pesquisador extrairPesquisador(Element root, String arquivoId) {
        // NUMERO-IDENTIFICADOR e atributo do elemento raiz; se faltar, usa o nome do arquivo.
        String identificador = root.getAttribute("NUMERO-IDENTIFICADOR").trim();
        if (!identificador.matches("\\d{1,18}")) {
            identificador = arquivoId;
        }

        Element dadosGerais = primeiroElemento(root, "DADOS-GERAIS");
        String nome = dadosGerais == null ? "" : dadosGerais.getAttribute("NOME-COMPLETO").trim();
        if (nome.isEmpty()) {
            throw new RequisicaoInvalidaException("O curriculo nao possui NOME-COMPLETO em DADOS-GERAIS.");
        }

        Pesquisador pesquisador = new Pesquisador();
        pesquisador.setId(Long.parseLong(identificador));
        pesquisador.setNome(nome);
        pesquisador.setEmail(extrairEmail(root, nome));
        return pesquisador;
    }

    private String extrairEmail(Element root, String nomeCompleto) {
        NodeList enderecos = root.getElementsByTagName("ENDERECO-PROFISSIONAL");
        for (int i = 0; i < enderecos.getLength(); i++) {
            String email = ((Element) enderecos.item(i)).getAttribute("E-MAIL").trim();
            if (!email.isEmpty()) {
                return email;
            }
        }
        return gerarEmail(nomeCompleto);
    }

    /**
     * A maioria dos curriculos nao traz e-mail. Nesse caso e gerado um endereco
     * ficticio (dominio reservado .invalid, que nunca pertence a ninguem) com o
     * primeiro e o ultimo nome.
     */
    static String gerarEmail(String nomeCompleto) {
        String[] partes = nomeCompleto.trim().split("\\s+");
        String base = partes.length == 1 ? partes[0] : partes[0] + partes[partes.length - 1];
        base = Normalizer.normalize(base, Normalizer.Form.NFD).replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
        return base + "@lattes.invalid";
    }

    // ------------------------------------------------------------------
    // Trabalhos
    // ------------------------------------------------------------------

    private void extrairTrabalhos(Element root, Coletor coletor) {
        Element producao = primeiroElemento(root, "PRODUCAO-BIBLIOGRAFICA");
        if (producao == null) {
            logger.warn("Curriculo sem PRODUCAO-BIBLIOGRAFICA");
            return;
        }

        extrair(producao, coletor, TipoProducao.ARTIGO, "ARTIGO-PUBLICADO", "DADOS-BASICOS-DO-ARTIGO",
                "DETALHAMENTO-DO-ARTIGO", "TITULO-DO-ARTIGO", "ANO-DO-ARTIGO", "TITULO-DO-PERIODICO-OU-REVISTA",
                "LOCAL-DE-PUBLICACAO");

        extrair(producao, coletor, TipoProducao.LIVRO, "LIVRO-PUBLICADO-OU-ORGANIZADO", "DADOS-BASICOS-DO-LIVRO",
                "DETALHAMENTO-DO-LIVRO", "TITULO-DO-LIVRO", "ANO", "NOME-DA-EDITORA", "CIDADE-DA-EDITORA");

        extrair(producao, coletor, TipoProducao.LIVRO, "CAPITULO-DE-LIVRO-PUBLICADO", "DADOS-BASICOS-DO-CAPITULO",
                "DETALHAMENTO-DO-CAPITULO", "TITULO-DO-CAPITULO-DO-LIVRO", "ANO", "NOME-DA-EDITORA",
                "CIDADE-DA-EDITORA");
    }

    private void extrair(Element producao, Coletor coletor, TipoProducao tipo, String tagItem, String tagDados,
            String tagDetalhe, String attrTitulo, String attrAno, String attrVeiculo, String attrLocal) {

        NodeList itens = producao.getElementsByTagName(tagItem);
        for (int i = 0; i < itens.getLength(); i++) {
            Element item = (Element) itens.item(i);
            Element dados = primeiroElemento(item, tagDados);
            Element detalhe = primeiroElemento(item, tagDetalhe);
            NodeList autores = item.getElementsByTagName("AUTORES");

            if (dados == null || detalhe == null || autores.getLength() == 0) {
                logger.warn("{} #{} ignorado: faltam dados basicos, detalhamento ou autores", tagItem, i);
                coletor.ignorados++;
                continue;
            }

            String titulo = dados.getAttribute(attrTitulo).trim();
            Long ano = converterAno(dados.getAttribute(attrAno));
            if (titulo.isEmpty() || ano == null) {
                logger.warn("{} #{} ignorado: titulo ou ano invalido", tagItem, i);
                coletor.ignorados++;
                continue;
            }

            Trabalho trabalho = new Trabalho();
            trabalho.setTitulo(titulo);
            trabalho.setAno(ano);
            trabalho.setLocal(valorOuPadrao(detalhe.getAttribute(attrLocal), "Não informado"));
            if (tipo == TipoProducao.ARTIGO) {
                trabalho.setPeriodico(valorOuPadrao(detalhe.getAttribute(attrVeiculo), "Não informado"));
            } else {
                trabalho.setEditora(valorOuPadrao(detalhe.getAttribute(attrVeiculo), "Não informada"));
            }

            coletor.itens.add(new TrabalhoExtraido(trabalho, extrairNomesCitacao(autores), tipo));
        }
    }

    private String extrairNomesCitacao(NodeList autores) {
        Set<String> nomes = new LinkedHashSet<>();
        for (int i = 0; i < autores.getLength(); i++) {
            String nome = ((Element) autores.item(i)).getAttribute("NOME-PARA-CITACAO").trim();
            if (!nome.isEmpty()) {
                nomes.add(nome);
            }
        }
        String resultado = String.join("; ", nomes);
        return resultado.length() > TAMANHO_MAXIMO_CITACOES ? resultado.substring(0, TAMANHO_MAXIMO_CITACOES)
                : resultado;
    }

    // ------------------------------------------------------------------
    // Utilitarios
    // ------------------------------------------------------------------

    private Element primeiroElemento(Element pai, String tag) {
        NodeList lista = pai.getElementsByTagName(tag);
        return lista.getLength() > 0 ? (Element) lista.item(0) : null;
    }

    private Long converterAno(String valor) {
        String ano = valor == null ? "" : valor.trim();
        return ano.matches("\\d{4}") ? Long.valueOf(ano) : null;
    }

    private String valorOuPadrao(String valor, String padrao) {
        return valor == null || valor.isBlank() ? padrao : valor.trim();
    }
}
