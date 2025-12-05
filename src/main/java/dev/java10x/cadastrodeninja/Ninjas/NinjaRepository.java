package dev.java10x.cadastrodeninja.Ninjas;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NinjaRepository extends JpaRepository<NinjaModel, Long> {
    List<NinjaModel> id(Long id);
}
