package dev.java10x.cadastrodeninja.Ninjas;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("ninjas")
public class NinjaController {

    private final NinjaService ninjaService;

    public NinjaController(NinjaService ninjaService) {
        this.ninjaService = ninjaService;
    }

    @GetMapping("/boasVindas")
    @Operation(summary = "Mensagem de boas vindas", description = "Essa rota da mensagem de boas vindas para quem acessa ela")
    public String boasVindass(){
        return "Essa é minha primeira mensagem nessa rota";
    }

    //Adicionar Ninja( CREATE)
    @PostMapping("/criar")
    @Operation(summary = "Cria um novo ninja", description = "Rota cria um novo ninja e aloca no bando de dados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description ="Ninja criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Erro na criação do ninja")
    })
    public ResponseEntity<String> criarNinja(@RequestBody NinjaDTO ninja){
        NinjaDTO ninjaNovo = ninjaService.criarNinja(ninja);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(" Ninja criado com sucesso " +  ninjaNovo.getNome() + " (ID)" +  ninjaNovo.getId());

    }

    //Mostrar Ninjas por ID (READ)
    @GetMapping("/listar/{id}")
    @Operation(summary = "Lista Ninja por ID", description = "Rota lista um ninja por id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description ="Ninja encontrado"),
            @ApiResponse(responseCode = "404", description = "Erro na busca do ninja")
    })
    public ResponseEntity<?> listarNinjaId(@PathVariable Long id){
        NinjaDTO listId = ninjaService.listarNinjaId(id);
        if(listId != null){
            return  ResponseEntity.ok(listId);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ninja com ID " + id + " não existe nos nossos registros");

    }

    //Mostrar todos os ninjas (READ)
    @GetMapping("/listar")
    public ResponseEntity<List<NinjaDTO>> listarNinjas(){
        List<NinjaDTO> list = ninjaService.listarNinjas();
        return ResponseEntity.ok(list);

    }

    //Alterar dados dos Ninjas (UPDATE)
    @PutMapping("/alterar/{id}")
    @Operation(summary = "Altera os dados do ninja", description = "Rota que altera os dados dos ninjas por id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description ="Ninja alterado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Erro na alteração do ninja")
    })
    public ResponseEntity<?> updateNinjaid(
        @Parameter(description = "Usuario manda o id no caminho da requisisão")
        @PathVariable Long id,
        @Parameter(description = "Usuario manda o dados do ninja a ser atualizado no corpo da requisisão")
        @RequestBody NinjaDTO ninjaAtualizado){

        NinjaDTO ninja = ninjaService.atualizarNinja(id, ninjaAtualizado);
        if(ninjaAtualizado != null){
            return ResponseEntity.ok(ninja);
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Ninja com esse id " + id + " não encontrado");
        }
    }

    //Deletar Ninja (DELETE)
    @DeleteMapping("/deletar/{id}")
    public ResponseEntity<String> deleteNinjaid(@PathVariable Long id){

        if(ninjaService.listarNinjaId(id) !=null){
            ninjaService.deletarNinjaId(id);
            return ResponseEntity.ok("Ninja com ID" + id + " deletado com sucesso");
        }else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("O ninja com id" + id + " não encontrado");
        }
    }



}
