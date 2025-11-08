package com.tecnocampus.LS2.protube_back.application.dto;

import com.tecnocampus.LS2.protube_back.domain.User;

public class UserDTO {
    private String id;
    private String email;
    private String token;

    public UserDTO(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
    }

    // Getters
    public String getId() { return id; }
    public String getEmail() { return email; }
    public String getToken() { return token; }

    // Setter for token only
    public void setToken(String token) { this.token = token; }
}