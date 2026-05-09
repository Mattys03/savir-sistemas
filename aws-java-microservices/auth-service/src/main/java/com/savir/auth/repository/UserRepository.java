package com.savir.auth.repository;

import com.savir.auth.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

/**
 * Repository - Acesso a dados de Usuário via Spring Data MongoDB.
 * GRASP Low Coupling: Desacopla a lógica de negócio do acesso ao banco.
 */
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByLoginAndPassword(String login, String password);
    Optional<User> findByLogin(String login);
}
