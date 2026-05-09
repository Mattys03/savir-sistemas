package com.savir.catalog.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

/**
 * GRASP Low Coupling: Comunicação HTTP entre microserviços.
 * Este cliente se comunica com o auth-service para validar usuários,
 * sem depender diretamente do código do auth-service.
 */
@Service
public class AuthClient {

    private final RestTemplate restTemplate;
    private final String authServiceUrl;

    public AuthClient(RestTemplate restTemplate, @Value("${auth.service.url}") String authServiceUrl) {
        this.restTemplate = restTemplate;
        this.authServiceUrl = authServiceUrl;
    }

    /**
     * Busca um usuário no auth-service via HTTP GET.
     * Demonstra comunicação entre microserviços.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getUserById(String userId) {
        try {
            return restTemplate.getForObject(authServiceUrl + "/api/users/" + userId, Map.class);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Verifica se o usuário é administrador consultando o auth-service.
     */
    public boolean isAdministrator(String userId) {
        Map<String, Object> user = getUserById(userId);
        return user != null && "Administrador".equals(user.get("profile"));
    }
}
