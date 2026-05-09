package com.savir.auth.controller;

import com.savir.auth.model.User;
import com.savir.auth.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Controller (MVC + GRASP Controller) - Centraliza as requisições de autenticação.
 * NÃO contém lógica de negócio: apenas recebe, delega ao Service e retorna.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * POST /api/auth/login
     * Recebe login e senha, delega autenticação ao UserService (GRASP Expert).
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String login = credentials.get("login");
        String password = credentials.get("password");

        Optional<User> user = userService.authenticate(login, password);

        if (user.isPresent()) {
            User u = user.get();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", Map.of(
                "id", u.getId(),
                "name", u.getName(),
                "email", u.getEmail(),
                "login", u.getLogin(),
                "profile", u.getProfile()
            ));
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(401).body(Map.of(
            "success", false,
            "message", "Login ou senha incorretos"
        ));
    }
}
