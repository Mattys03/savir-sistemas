package com.savir.catalog.repository;

import com.savir.catalog.model.Client;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ClientRepository extends MongoRepository<Client, String> {}
