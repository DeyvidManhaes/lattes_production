package desenvolvimento.sistemas1.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Trabalho {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(length = 1000)
    private String titulo;
    private Long ano;
    @Column(length = 500)
    private String local;
    @Column(length = 500)
    private String periodico;
    @Column(length = 500)
    private String editora;


    @ManyToOne
    Pesquisador pesquisador;
    
    public Pesquisador getPesquisador() {
        return pesquisador;
    }
    public void setPesquisador(Pesquisador pesquisador) {
        this.pesquisador = pesquisador;
    }
    @ManyToOne
    @JoinColumn(name = "tipo_id")
    private Tipo tipo;

    public Long getAno() {
        return ano;
    }
    public void setAno(Long ano) {
        this.ano = ano;
    }
    public String getLocal() {
        return local;
    }
    public void setLocal(String local) {
        this.local = local;
    }
    
    
    public String getPeriodico() {
        return periodico;
    }
    public void setPeriodico(String periodico) {
        this.periodico = periodico;
    }
    public String getEditora() {
        return editora;
    }
    public void setEditora(String editora) {
        this.editora = editora;
    }
 
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getTitulo() {
        return titulo;
    }
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    
    @Override
    public int hashCode() {
        final int prime = 31;
        int result = 1;
        result = prime * result + ((id == null) ? 0 : id.hashCode());
        result = prime * result + ((titulo == null) ? 0 : titulo.hashCode());
        return result;
    }
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj == null)
            return false;
        if (getClass() != obj.getClass())
            return false;
        Trabalho other = (Trabalho) obj;
        if (id == null) {
            if (other.id != null)
                return false;
        } else if (!id.equals(other.id))
            return false;
        if (titulo == null) {
            if (other.titulo != null)
                return false;
        } else if (!titulo.equals(other.titulo))
            return false;
        return true;
    }
    
    @Override
    public String toString() {
        return "Trabalho [id=" + id + ", titulo=" + titulo + "]";
    }
    public Tipo getTipo() {
        return tipo;
    }
    public void setTipo(Tipo tipo) {
        this.tipo = tipo;
    }
   
}
