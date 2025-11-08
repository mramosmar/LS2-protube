package com.tecnocampus.LS2.protube_back.security;

import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;

public class Token {
    public static void main(String[] args) {
        JwtTokenProvider jwtTokenProvider = new JwtTokenProvider();

        String email = "user@example.com";
        String token = jwtTokenProvider.generateToken(email);
        System.out.println("Generated Token: " + token);

        boolean isValid = jwtTokenProvider.validateToken(token);
        System.out.println("Is Token Valid? " + isValid);

        String subject = jwtTokenProvider.getSubject(token);
        System.out.println("Token Subject: " + subject);

        String invalidToken = token + "tampered";
        boolean isInvalidTokenValid = jwtTokenProvider.validateToken(invalidToken);
        System.out.println("Is Invalid Token Valid? " + isInvalidTokenValid);
    }
}