package com.savir.catalog.controller;

import com.savir.catalog.model.Product;
import com.savir.catalog.service.AuthClient;
import com.savir.catalog.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;
    private final AuthClient authClient;

    public ProductController(ProductService productService, AuthClient authClient) {
        this.productService = productService;
        this.authClient = authClient;
    }

    @GetMapping
    public List<Product> getAll() { return productService.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable String id) {
        return productService.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Product product, @RequestHeader(value = "user-id", required = false) String userId) {
        product.setCreatedBy(userId);
        return ResponseEntity.ok(productService.create(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Product product) {
        try {
            return ResponseEntity.ok(productService.update(id, product));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id, @RequestHeader(value = "user-id", required = false) String userId) {
        try {
            if (userId != null) {
                boolean isAdmin = authClient.isAdministrator(userId);
                System.out.println("🔗 Comunicação com auth-service: usuário " + userId + " é admin? " + isAdmin);
            }
            productService.delete(id);
            return ResponseEntity.ok(Map.of("success", true, "message", "Produto excluído com sucesso"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
