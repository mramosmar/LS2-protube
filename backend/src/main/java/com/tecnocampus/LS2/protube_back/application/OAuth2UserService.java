package com.tecnocampus.LS2.protube_back.application;

import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import com.tecnocampus.LS2.protube_back.application.dto.UserDTO;
import com.tecnocampus.LS2.protube_back.domain.User;
import com.tecnocampus.LS2.protube_back.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

@Service
public class OAuth2UserService extends DefaultOAuth2UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public OAuth2UserService(PasswordEncoder passwordEncoder, UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String sub = oauth2User.getAttribute("sub");

        System.out.println("OAuth2 Login - Email: " + email + ", Name: " + name + ", Sub: " + sub);

        User user = userRepository.findByEmail(email)
                .map(existingUser -> {
                    System.out.println("Found existing user: " + existingUser.getEmail());
                    // Ensure existing user has USER role
                    if (existingUser.getRole() == null || existingUser.getRole().isEmpty()) {
                        existingUser.setRole("USER");
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    System.out.println("Creating new OAuth2 user: " + email);
                    User newUser = new User();
                    newUser.setId(sub);
                    newUser.setEmail(email);
                    newUser.setUsername(name);
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setRole("USER");
                    User savedUser = userRepository.save(newUser);
                    System.out.println("Saved new user with ID: " + savedUser.getId());
                    return savedUser;
                });

        String token = jwtTokenProvider.generateToken(user.getEmail());

        UserDTO userDTO = new UserDTO(user);
        userDTO.setToken(token);

        return new DefaultOAuth2User(
                Collections.singleton(() -> user.getRole()),
                oauth2User.getAttributes(),
                "email"
        );
    }

    @Transactional
    public User findOrCreateUser(String email, String name, String sub) {
        return userRepository.findByEmail(email)
                .map(existingUser -> {
                    if (existingUser.getRole() == null || existingUser.getRole().isEmpty()) {
                        existingUser.setRole("USER");
                        return userRepository.save(existingUser);
                    }
                    return existingUser;
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(sub != null ? sub : UUID.randomUUID().toString());
                    newUser.setEmail(email);
                    newUser.setUsername(name != null ? name : email);
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setRole("USER");
                    return userRepository.save(newUser);
                });
    }
}