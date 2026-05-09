package com.savir.auth.config;

import com.savir.auth.model.User;
import com.savir.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seed de dados iniciais — popula o banco na primeira execução.
 * GRASP Creator: responsável por criar os objetos User iniciais.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    public DataSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            System.out.println("🌱 Populando banco com usuários iniciais...");
            userRepository.save(new User("Administrador Principal", "admin@savir.com", "admin", "123", "Administrador"));
            userRepository.save(new User("João da Silva", "joao@savir.com", "joao", "123", "Usuário"));
            userRepository.save(new User("Maria Santos", "maria@savir.com", "maria", "123", "Usuário"));
            System.out.println("✅ 3 usuários criados com sucesso!");
        } else {
            System.out.println("✅ Banco já possui " + userRepository.count() + " usuários.");
        }
    }
}
