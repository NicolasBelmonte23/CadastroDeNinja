package dev.java10x.cadastrodeninja.Missoes;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MissoesService {

    private MissoesRepository missoesRepository;

    public MissoesService(MissoesRepository missoesRepository) {
        this.missoesRepository = missoesRepository;
    }

    //LISTAR TODOS as missoes
    public List<MissoesModel> listaMissoes(){
        return missoesRepository.findAll();
    }

    //Listar ninjas por id
    public MissoesModel listarMissoesId(Long id){
        Optional<MissoesModel> missoesId = missoesRepository.findById(id);
        return missoesId.orElse(null);
    }
}
