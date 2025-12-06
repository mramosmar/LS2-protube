package com.tecnocampus.LS2.protube_back.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        jwtTokenProvider = new JwtTokenProvider();
    }

    @Test
    void shouldGenerateToken() {
        String email = "test@example.com";

        String token = jwtTokenProvider.generateToken(email);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void shouldValidateValidToken() {
        String email = "test@example.com";
        String token = jwtTokenProvider.generateToken(email);

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void shouldReturnFalseForInvalidToken() {
        String invalidToken = "invalid.token.here";

        boolean isValid = jwtTokenProvider.validateToken(invalidToken);

        assertFalse(isValid);
    }

    @Test
    void shouldReturnFalseForTamperedToken() {
        String email = "test@example.com";
        String token = jwtTokenProvider.generateToken(email);
        String tamperedToken = token + "tampered";

        boolean isValid = jwtTokenProvider.validateToken(tamperedToken);

        assertFalse(isValid);
    }

    @Test
    void shouldGetSubjectFromToken() {
        String email = "test@example.com";
        String token = jwtTokenProvider.generateToken(email);

        String subject = jwtTokenProvider.getSubject(token);

        assertEquals(email, subject);
    }

    @Test
    void shouldReturnFalseForNullToken() {
        boolean isValid = jwtTokenProvider.validateToken(null);

        assertFalse(isValid);
    }

    @Test
    void shouldReturnFalseForEmptyToken() {
        boolean isValid = jwtTokenProvider.validateToken("");

        assertFalse(isValid);
    }
}

