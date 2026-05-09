package com.savir.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microserviço de Autenticação e Gestão de Usuários.
 * GRASP Controller: Esta classe age como o ponto de entrada do sistema,
 * delegando responsabilidades aos componentes apropriados.
 */
@SpringBootApplication
public class AuthServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuthServiceApplication.class, args);
    }
}
