package desenvolvimento.sistemas1.exception;

/** Dados de entrada invalidos. Vira HTTP 400. */
public class RequisicaoInvalidaException extends RuntimeException {
    public RequisicaoInvalidaException(String mensagem) {
        super(mensagem);
    }
}
