package dev.java10x.cadastrodeninja.Ninjas;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class NinjaService {

    private NinjaRepository ninjaRepository;

    public NinjaService(NinjaRepository ninjaRepository) {
        this.ninjaRepository = ninjaRepository;
    }

    //LISTAR TODOS OS NINJAS
    public List<NinjaModel> listarNinjas() {
        return ninjaRepository.findAll();

    }

    //Listar todos os ninjas por ID
    public NinjaModel listarNinjaId(Long id){
        Optional<NinjaModel> ninjaId = ninjaRepository.findById(id);
        return ninjaId.orElse(null);
    }

}
