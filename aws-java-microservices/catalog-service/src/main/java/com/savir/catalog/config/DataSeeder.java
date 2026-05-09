package com.savir.catalog.config;

import com.savir.catalog.model.Client;
import com.savir.catalog.model.Product;
import com.savir.catalog.repository.ClientRepository;
import com.savir.catalog.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final ClientRepository clientRepo;
    private final ProductRepository productRepo;

    public DataSeeder(ClientRepository clientRepo, ProductRepository productRepo) {
        this.clientRepo = clientRepo;
        this.productRepo = productRepo;
    }

    @Override
    public void run(String... args) {
        if (clientRepo.count() == 0) {
            System.out.println("🌱 Populando clientes...");
            clientRepo.save(new Client("Empresa ABC Ltda", "contato@empresaabc.com", "11987654321", "Av. Paulista, 1000 - São Paulo, SP", null));
            clientRepo.save(new Client("Comércio XYZ ME", "vendas@comercioxyz.com", "21912345678", "Rua do Comércio, 500 - Rio de Janeiro, RJ", null));
            System.out.println("✅ 2 clientes criados!");
        }
        if (productRepo.count() == 0) {
            System.out.println("🌱 Populando produtos...");
            productRepo.save(new Product("Notebook Dell Inspiron", "Notebook 15.6 polegadas, 8GB RAM, 256GB SSD", 3499.90, 15, null));
            productRepo.save(new Product("Mouse Logitech MX Master", "Mouse sem fio ergonômico", 449.90, 30, null));
            System.out.println("✅ 2 produtos criados!");
        }
    }
}
