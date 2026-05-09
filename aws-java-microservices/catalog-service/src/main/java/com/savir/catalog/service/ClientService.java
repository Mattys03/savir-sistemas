package com.savir.catalog.service;

import com.savir.catalog.model.Client;
import com.savir.catalog.repository.ClientRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * GRASP Expert: Especialista em lógica de negócio de Clientes.
 * GRASP High Cohesion: Foca exclusivamente em operações de cliente.
 */
@Service
public class ClientService {
    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> findAll() { return clientRepository.findAll(); }
    public Optional<Client> findById(String id) { return clientRepository.findById(id); }
    public Client create(Client client) { return clientRepository.save(client); }

    public Client update(String id, Client updated) {
        return clientRepository.findById(id).map(c -> {
            c.setName(updated.getName());
            c.setEmail(updated.getEmail());
            c.setPhone(updated.getPhone());
            c.setAddress(updated.getAddress());
            return clientRepository.save(c);
        }).orElseThrow(() -> new RuntimeException("Cliente não encontrado: " + id));
    }

    public void delete(String id) {
        if (!clientRepository.existsById(id)) throw new RuntimeException("Cliente não encontrado");
        clientRepository.deleteById(id);
    }
}
