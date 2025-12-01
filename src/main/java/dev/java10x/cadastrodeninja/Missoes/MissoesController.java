package dev.java10x.cadastrodeninja.Missoes;

import org.springframework.web.bind.annotation.*;

//LOCALHOST:8080
@RestController
@RequestMapping("missoes")
public class MissoesController {

    //GET -- mandar uma requisisao para mostrar as missoes
    @GetMapping("/listar")
    public String listarmissao(){
        return "lista de missoes";
    }

    //POST -- mandar uma requisisao para criar as missoes
    @PostMapping("/criar")
    public String criarmissao(){
        return "missao criada";
    }

    //PUT -- mandar uma requisisao para alterar as missoes
    @PutMapping("/alterar")
    public String alterarmissao(){
        return "missao alterada";
    }

    //DELETE -- mandar uma requisisao para deletar as missoes
    @DeleteMapping("/deletar")
    public String deletarmissao(){
        return "missao deletada";
    }
}
