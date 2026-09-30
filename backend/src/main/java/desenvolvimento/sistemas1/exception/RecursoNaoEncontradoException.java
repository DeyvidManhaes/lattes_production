package desenvolvimento.sistemas1.exception;

/** Recurso (instituto, pesquisador, arquivo XML...) inexistente. Vira HTTP 404. */
public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
