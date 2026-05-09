package com.savir.auth.service;

import com.savir.auth.model.User;
import com.savir.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * Service (GRASP Expert) - Contém a lógica de negócio de Usuários.
 * Este serviço é o ESPECIALISTA (Expert) em operações de usuário,
 * pois possui acesso direto ao repositório e conhece as regras.
 *
 * GRASP Creator: Esta classe é responsável por criar instâncias de User,
 * pois agrega e utiliza diretamente os dados de User.
 *
 * GRASP High Cohesion: Cada método lida exclusivamente com lógica de usuário.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    // GRASP Low Coupling: Injeção de dependência via construtor
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(String id) {
        return userRepository.findById(id);
    }

    /**
     * GRASP Expert: Autentica o usuário verificando login e senha.
     * O serviço é o especialista porque possui acesso ao repositório.
     */
    public Optional<User> authenticate(String login, String password) {
        return userRepository.findByLoginAndPassword(login, password);
    }

    /**
     * GRASP Creator: Cria e persiste um novo usuário.
     * Valida se o login já existe antes de criar.
     */
    public User create(User user) {
        Optional<User> existing = userRepository.findByLogin(user.getLogin());
        if (existing.isPresent()) {
            throw new RuntimeException("Login já está em uso: " + user.getLogin());
        }
        return userRepository.save(user);
    }

    public User update(String id, User updatedUser) {
        return userRepository.findById(id).map(user -> {
            user.setName(updatedUser.getName());
            user.setEmail(updatedUser.getEmail());
            if (updatedUser.getProfile() != null) {
                user.setProfile(updatedUser.getProfile());
            }
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("Usuário não encontrado: " + id));
    }

    public void delete(String id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("Usuário não encontrado: " + id);
        }
        userRepository.deleteById(id);
    }
}
