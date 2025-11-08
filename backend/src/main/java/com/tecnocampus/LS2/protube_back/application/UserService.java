package com.tecnocampus.LS2.protube_back.application;

import com.tecnocampus.LS2.protube_back.application.dto.UserDTO;
import com.tecnocampus.LS2.protube_back.security.JwtTokenProvider;
import com.tecnocampus.LS2.protube_back.application.dto.UserRegistrationDTO;
import com.tecnocampus.LS2.protube_back.domain.User;
import org.springframework.stereotype.Service;
import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.BadCredentialsException;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public UserDTO registerUser(UserRegistrationDTO registrationDTO) {
        if (userRepository.findByEmail(registrationDTO.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        UserRegistrationDTO dtoWithEncodedPassword = new UserRegistrationDTO();
        dtoWithEncodedPassword.setEmail(registrationDTO.getEmail());
        dtoWithEncodedPassword.setPassword(passwordEncoder.encode(registrationDTO.getPassword()));
        dtoWithEncodedPassword.setUsername(registrationDTO.getUsername()); // Add this line

        User user = new User(dtoWithEncodedPassword);
        User savedUser = userRepository.save(user);

        UserDTO userDTO = new UserDTO(savedUser);
        userDTO.setToken(jwtTokenProvider.generateToken(savedUser.getEmail()));
        return userDTO;
    }

    public UserDTO loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .filter(u -> passwordEncoder.matches(password, u.getPassword()))
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        UserDTO userDTO = new UserDTO(user);
        userDTO.setToken(jwtTokenProvider.generateToken(user.getEmail()));
        return userDTO;
    }
}