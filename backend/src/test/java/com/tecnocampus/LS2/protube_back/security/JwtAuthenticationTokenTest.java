package com.tecnocampus.LS2.protube_back.security;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Collection;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JwtAuthenticationTokenTest {

    @Test
    void shouldCreateTokenWithPrincipalAndAuthorities() {
        String principal = "test@example.com";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("USER"));

        JwtAuthenticationToken token = new JwtAuthenticationToken(principal, null, authorities);

        assertEquals(principal, token.getPrincipal());
        assertTrue(token.isAuthenticated());
    }

    @Test
    void shouldReturnNullCredentials() {
        String principal = "test@example.com";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("USER"));

        JwtAuthenticationToken token = new JwtAuthenticationToken(principal, null, authorities);

        assertNull(token.getCredentials());
    }

    @Test
    void shouldReturnPrincipal() {
        String principal = "user@test.com";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ADMIN"));

        JwtAuthenticationToken token = new JwtAuthenticationToken(principal, null, authorities);

        assertEquals(principal, token.getPrincipal());
    }

    @Test
    void shouldReturnAuthorities() {
        String principal = "test@example.com";
        List<GrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("USER"),
            new SimpleGrantedAuthority("ADMIN")
        );

        JwtAuthenticationToken token = new JwtAuthenticationToken(principal, null, authorities);

        Collection<? extends GrantedAuthority> returnedAuthorities = token.getAuthorities();
        assertEquals(2, returnedAuthorities.size());
    }

    @Test
    void shouldBeAuthenticated() {
        String principal = "test@example.com";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("USER"));

        JwtAuthenticationToken token = new JwtAuthenticationToken(principal, "credentials", authorities);

        assertTrue(token.isAuthenticated());
    }

    @Test
    void shouldHandleEmptyAuthorities() {
        String principal = "test@example.com";
        List<GrantedAuthority> authorities = List.of();

        JwtAuthenticationToken token = new JwtAuthenticationToken(principal, null, authorities);

        assertTrue(token.getAuthorities().isEmpty());
        assertEquals(principal, token.getPrincipal());
    }
}

