package com.tecnocampus.LS2.protube_back.domain;

import com.tecnocampus.LS2.protube_back.application.dto.UserRegistrationDTO;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

@Entity
@Table(name = "users")
public class User {
    @Id
    private String id;

    @NotBlank
    @Email
    @Column(unique = true)
    private String email;

    @NotBlank
    private String password;

    public User() {
        this.id = UUID.randomUUID().toString();
    }

    public User(UserRegistrationDTO dto) {
        this();
        this.email = dto.getEmail();
        this.password = dto.getPassword();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}