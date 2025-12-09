package dev.java10x.cadastrodeninja.Missoes;


import dev.java10x.cadastrodeninja.Ninjas.NinjaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> listarmissao(){
        List<MissoesDTO> list = missoesService.listaMissoes();
        return ResponseEntity.ok(list);
    }

    //Listar missoes por id
    @GetMapping("/listar/{id}")
    public ResponseEntity<?> listarMissoesId(@PathVariable Long id){
       MissoesDTO missoesId = missoesService.listarMissoesId(id);
       if(missoesId != null){
           return ResponseEntity.ok(missoesId);
       }
        return ResponseEntity.status(404).body("missao não encontrada " + id);
    }

    //POST -- mandar uma requisisao para criar as missoes
    @PostMapping("/criar")
    public ResponseEntity<String> criarmissao(@RequestBody MissoesDTO missoes){
        MissoesDTO missaoNova = missoesService.criarMissoes(missoes);
        return ResponseEntity.status(HttpStatus.CREATED).body("Missão criada com sucesso: " + missaoNova);
    }

    //PUT -- mandar uma requisisao para alterar as missoes
    @PutMapping("/alterar/{id}")
    public ResponseEntity<?> alterarmissao(@PathVariable Long id, @RequestBody MissoesDTO missoesAtualizada){
        MissoesDTO missao = missoesService.atualizarMissoes(id, missoesAtualizada);
        if(missao != null){
            return ResponseEntity.ok(missao);
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Missao esse id: " + id + " Não encontrada");
        }
    }

    //DELETE -- mandar uma requisisao para deletar as missoes
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<String> deletarmissao(@PathVariable Long id){
        if(missoesService.listarMissoesId(id) !=null){
            missoesService.deletarMissoesId(id);
            return ResponseEntity.ok("Ninja com ID" + id + " deletado com sucesso");
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("O ninja com id" + id + " não encontrado");
        }
}}
