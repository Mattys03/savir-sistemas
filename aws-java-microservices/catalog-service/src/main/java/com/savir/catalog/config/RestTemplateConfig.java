package com.savir.catalog.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * GRASP Low Coupling: RestTemplate como bean gerenciado pelo Spring.
 * Desacopla a comunicação HTTP da lógica de negócio.
 */
@Configuration
public class RestTemplateConfig {
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
