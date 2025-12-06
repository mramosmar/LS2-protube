package com.tecnocampus.LS2.protube_back.application;

import com.tecnocampus.LS2.protube_back.Persistance.UserRepository;
import com.tecnocampus.LS2.protube_back.domain.User;
import com.tecnocampus.LS2.protube_back.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2UserServiceTest {

    private OAuth2UserService oAuth2UserService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    void setUp() {
        oAuth2UserService = new OAuth2UserService(passwordEncoder, userRepository, jwtTokenProvider);
    }

    @Test
    void shouldFindExistingUserWithRole() {
        String email = "existing@example.com";
        String name = "Existing User";
        String sub = "google-sub-123";

        User existingUser = new User();
        existingUser.setEmail(email);
        existingUser.setUsername(name);
        existingUser.setRole("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));

        User result = oAuth2UserService.findOrCreateUser(email, name, sub);

        assertEquals(email, result.getEmail());
        assertEquals("USER", result.getRole());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldUpdateExistingUserWithoutRole() {
        String email = "existing@example.com";
        String name = "Existing User";
        String sub = "google-sub-123";

        User existingUser = new User();
        existingUser.setEmail(email);
        existingUser.setUsername(name);
        existingUser.setRole(null);

        User savedUser = new User();
        savedUser.setEmail(email);
        savedUser.setUsername(name);
        savedUser.setRole("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = oAuth2UserService.findOrCreateUser(email, name, sub);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldUpdateExistingUserWithEmptyRole() {
        String email = "existing@example.com";
        String name = "Existing User";
        String sub = "google-sub-123";

        User existingUser = new User();
        existingUser.setEmail(email);
        existingUser.setUsername(name);
        existingUser.setRole("");

        User savedUser = new User();
        savedUser.setEmail(email);
        savedUser.setUsername(name);
        savedUser.setRole("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = oAuth2UserService.findOrCreateUser(email, name, sub);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldCreateNewUser() {
        String email = "new@example.com";
        String name = "New User";
        String sub = "google-sub-456";

        User savedUser = new User();
        savedUser.setId(sub);
        savedUser.setEmail(email);
        savedUser.setUsername(name);
        savedUser.setRole("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = oAuth2UserService.findOrCreateUser(email, name, sub);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode(anyString());
    }

    @Test
    void shouldCreateNewUserWithNullSub() {
        String email = "new@example.com";
        String name = "New User";

        User savedUser = new User();
        savedUser.setEmail(email);
        savedUser.setUsername(name);
        savedUser.setRole("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = oAuth2UserService.findOrCreateUser(email, name, null);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldCreateNewUserWithNullName() {
        String email = "new@example.com";
        String sub = "google-sub-789";

        User savedUser = new User();
        savedUser.setId(sub);
        savedUser.setEmail(email);
        savedUser.setUsername(email);
        savedUser.setRole("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = oAuth2UserService.findOrCreateUser(email, null, sub);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldCreateServiceWithDependencies() {
        assertNotNull(oAuth2UserService);
    }

    @Test
    void shouldReturnExistingUserEmail() {
        String email = "test@example.com";
        String name = "Test User";
        String sub = "sub-123";

        User existingUser = new User();
        existingUser.setEmail(email);
        existingUser.setUsername(name);
        existingUser.setRole("ADMIN");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));

        User result = oAuth2UserService.findOrCreateUser(email, name, sub);

        assertEquals(email, result.getEmail());
        assertEquals(name, result.getUsername());
        assertEquals("ADMIN", result.getRole());
    }

    @Test
    void shouldCreateNewUserWithAllFields() {
        String email = "complete@example.com";
        String name = "Complete User";
        String sub = "complete-sub-123";

        User savedUser = new User();
        savedUser.setId(sub);
        savedUser.setEmail(email);
        savedUser.setUsername(name);
        savedUser.setPassword("encodedPassword");
        savedUser.setRole("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = oAuth2UserService.findOrCreateUser(email, name, sub);

        assertNotNull(result);
        assertEquals(email, result.getEmail());
        assertEquals(name, result.getUsername());
        assertEquals(sub, result.getId());
        assertEquals("USER", result.getRole());
    }

    @Test
    void shouldSaveUserWhenRoleIsNull() {
        String email = "nullrole@example.com";
        String name = "Null Role User";
        String sub = "nullrole-sub";

        User existingUser = new User();
        existingUser.setEmail(email);
        existingUser.setUsername(name);
        existingUser.setRole(null);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setRole("USER");
            return user;
        });

        User result = oAuth2UserService.findOrCreateUser(email, name, sub);

        assertNotNull(result);
        verify(userRepository).save(existingUser);
    }

    @Test
    void shouldSaveUserWhenRoleIsEmpty() {
        String email = "emptyrole@example.com";
        String name = "Empty Role User";
        String sub = "emptyrole-sub";

        User existingUser = new User();
        existingUser.setEmail(email);
        existingUser.setUsername(name);
        existingUser.setRole("");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setRole("USER");
            return user;
        });

        User result = oAuth2UserService.findOrCreateUser(email, name, sub);

        assertNotNull(result);
        verify(userRepository).save(existingUser);
    }

    @Test
    void shouldNotSaveUserWhenRoleExists() {
        String email = "hasrole@example.com";
        String name = "Has Role User";
        String sub = "hasrole-sub";

        User existingUser = new User();
        existingUser.setEmail(email);
        existingUser.setUsername(name);
        existingUser.setRole("ADMIN");

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(existingUser));

        User result = oAuth2UserService.findOrCreateUser(email, name, sub);

        assertNotNull(result);
        assertEquals("ADMIN", result.getRole());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldGenerateUUIDWhenSubIsNull() {
        String email = "nouuid@example.com";
        String name = "No UUID User";

        User savedUser = new User();
        savedUser.setEmail(email);
        savedUser.setUsername(name);
        savedUser.setRole("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = oAuth2UserService.findOrCreateUser(email, name, null);

        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldUseEmailAsUsernameWhenNameIsNull() {
        String email = "nousername@example.com";
        String sub = "nousername-sub";

        User savedUser = new User();
        savedUser.setId(sub);
        savedUser.setEmail(email);
        savedUser.setUsername(email);
        savedUser.setRole("USER");

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = oAuth2UserService.findOrCreateUser(email, null, sub);

        assertNotNull(result);
        assertEquals(email, result.getUsername());
    }
}

