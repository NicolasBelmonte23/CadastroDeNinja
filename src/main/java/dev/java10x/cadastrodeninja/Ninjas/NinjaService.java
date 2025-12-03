package dev.java10x.cadastrodeninja.Ninjas;

import org.springframework.stereotype.Service;

import java.util.List;

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

}
