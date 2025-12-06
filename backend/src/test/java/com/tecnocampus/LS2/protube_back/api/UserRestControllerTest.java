package com.tecnocampus.LS2.protube_back.api;

import com.tecnocampus.LS2.protube_back.application.UserService;
import com.tecnocampus.LS2.protube_back.application.dto.UserDTO;
import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class UserRestControllerTest {
    private MockMvc mockMvc;
    private UserService userService;
    private UserRepository userRepository;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        userService = mock(UserService.class);
        userRepository = mock(UserRepository.class);
        UserRestController controller = new UserRestController(userService, userRepository);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    void registerUser_success() throws Exception {
        UserDTO mockedDto = mock(UserDTO.class);
        when(userService.registerUser(any())).thenReturn(mockedDto);

        String requestJson = """
                {
                  "email": "test@example.com",
                  "password": "strongpass",
                  "username": "test@example.com"
                }
                """;

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
        verify(userService, times(1)).registerUser(any());
    }

    @Test
    void registerUser_badRequest() throws Exception {
        when(userService.registerUser(any())).thenThrow(new IllegalArgumentException("Email already used"));

        String requestJson = """
                {
                  "email": "exists@example.com",
                  "password": "pass",
                  "username": "Username"
                }
                """;

        mockMvc.perform(post("/api/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Email already used"));
        verify(userService, times(1)).registerUser(any());
    }

    @Test
    void loginUser_success() throws Exception {
        UserDTO mockedDto = mock(UserDTO.class);
        when(userService.loginUser(eq("test@example.com"), eq("password"))).thenReturn(mockedDto);

        String requestJson = """
                {
                  "email": "test@example.com",
                  "password": "password"
                }
                """;

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON));
        verify(userService, times(1)).loginUser("test@example.com", "password");
    }

    @Test
    void loginUser_invalidCredentials() throws Exception {
        when(userService.loginUser(any(), any())).thenThrow(new BadCredentialsException("Bad credentials"));

        String requestJson = """
                {
                  "email": "wrong@example.com",
                  "password": "wrong"
                }
                """;

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestJson))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.error").value("Invalid credentials"));
        verify(userService, times(1)).loginUser(any(), any());
    }
}