package desenvolvimento.sistemas1.model;

public class PesquisadorRequest {
    private String arquivoId;
    private Long institutoId;

    public String getArquivoId() {
        return arquivoId;
    }

    public void setArquivoId(String arquivoId) {
        this.arquivoId = arquivoId;
    }

    public Long getInstitutoId() {
        return institutoId;
    }

    public void setInstitutoId(Long institutoId) {
        this.institutoId = institutoId;
    }
}
