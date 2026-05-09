package com.savir.auth.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Model (MVC) - Representa a entidade Usuário no banco de dados.
 * GRASP Expert: Esta classe é a especialista nos dados do usuário.
 */
@Document(collection = "users")
public class User {

    @Id
    private String id;
    private String name;
    private String email;
    private String login;
    private String password;
    private String profile; // "Administrador" ou "Usuário"

    public User() {}

    public User(String name, String email, String login, String password, String profile) {
        this.name = name;
        this.email = email;
        this.login = login;
        this.password = password;
        this.profile = profile;
    }

    // Getters e Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getProfile() { return profile; }
    public void setProfile(String profile) { this.profile = profile; }
}
