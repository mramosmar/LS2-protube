package com.tecnocampus.LS2.protube_back.application;

import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import com.tecnocampus.LS2.protube_back.domain.User;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Service
public class OAuth2UserService extends DefaultOAuth2UserService {
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public OAuth2UserService(UserRepository userRepository, @Lazy PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        String email = oauth2User.getAttribute("email");
        String name = oauth2User.getAttribute("name");
        String sub = oauth2User.getAttribute("sub");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(sub);
                    newUser.setEmail(email);
                    newUser.setUsername(name);
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setRole("USER");
                    return userRepository.save(newUser);
                });

        return new DefaultOAuth2User(
                Collections.singleton(() -> user.getRole()),
                oauth2User.getAttributes(),
                "email"
        );
    }
}