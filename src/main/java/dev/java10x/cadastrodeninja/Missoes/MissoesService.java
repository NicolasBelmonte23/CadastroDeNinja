package dev.java10x.cadastrodeninja.Missoes;

import org.springframework.stereotype.Service;

import java.util.List;

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
}
