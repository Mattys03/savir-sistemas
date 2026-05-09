package com.savir.catalog.service;

import com.savir.catalog.model.Product;
import com.savir.catalog.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> findAll() { return productRepository.findAll(); }
    public Optional<Product> findById(String id) { return productRepository.findById(id); }
    public Product create(Product product) { return productRepository.save(product); }

    public Product update(String id, Product updated) {
        return productRepository.findById(id).map(p -> {
            p.setName(updated.getName());
            p.setDescription(updated.getDescription());
            p.setPrice(updated.getPrice());
            p.setStock(updated.getStock());
            return productRepository.save(p);
        }).orElseThrow(() -> new RuntimeException("Produto não encontrado: " + id));
    }

    public void delete(String id) {
        if (!productRepository.existsById(id)) throw new RuntimeException("Produto não encontrado");
        productRepository.deleteById(id);
    }
}
