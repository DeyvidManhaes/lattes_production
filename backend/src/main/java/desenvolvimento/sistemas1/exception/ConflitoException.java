package desenvolvimento.sistemas1.exception;

/** Operacao que conflita com o estado atual dos dados. Vira HTTP 409. */
public class ConflitoException extends RuntimeException {
    public ConflitoException(String mensagem) {
        super(mensagem);
    }
}
