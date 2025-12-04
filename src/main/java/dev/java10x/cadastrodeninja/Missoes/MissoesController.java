package dev.java10x.cadastrodeninja.Missoes;

import dev.java10x.cadastrodeninja.Ninjas.NinjaModel;
import org.springframework.web.bind.annotation.*;

import java.util.List;

//LOCALHOST:8080
@RestController
@RequestMapping("missoes")
public class MissoesController {

    private MissoesService missoesService;
    public MissoesController(MissoesService missoesService) {
        this.missoesService = missoesService;
    }

    //GET -- mandar uma requisisao para mostrar as missoes
    @GetMapping("/listar")
    public List<MissoesModel> listarmissao(){
        return missoesService.listaMissoes();
    }

    //Listar missoes por id
    @GetMapping("/listar/{id}")
    public MissoesModel listarMissoesId(@PathVariable Long id){
        return missoesService.listarMissoesId(id);
    }

    //POST -- mandar uma requisisao para criar as missoes
    @PostMapping("/criar")
    public MissoesModel criarmissao(@RequestBody MissoesModel missoes){
        return missoesService.criarMissoes(missoes);
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
