package dev.java10x.cadastrodeninja.Ninjas;

import dev.java10x.cadastrodeninja.Missoes.MissoesModel;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

//Entity ele transforma uma classe em uma entidade do DB
//JPA - Java Persistence API
@Entity
@Table(name = "tb_cadastro")
@NoArgsConstructor
@AllArgsConstructor
@Data
public class NinjaModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;

    @Column(unique = true)
    private String email;

    private int idade;

    // @ManyToOne um ninja tem uma unica missao
    @ManyToOne
    @JoinColumn(name = "missoes_id") // foreing key ou chave estrangeira
    private MissoesModel missoes;


}
