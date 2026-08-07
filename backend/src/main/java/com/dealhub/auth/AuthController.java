package com.dealhub.auth;

import com.dealhub.common.ApiException;
import com.dealhub.user.User;
import com.dealhub.user.UserDtos.UserProfile;
import com.dealhub.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public record SignupRequest(
            @NotBlank @Size(min = 3, max = 30)
            @Pattern(regexp = "[a-zA-Z0-9_]+", message = "letters, digits and underscore only")
            String handle,
            @NotBlank @Email String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @NotBlank @Size(max = 80) String displayName,
            boolean isPoster) {
    }

    public record LoginRequest(@NotBlank String handleOrEmail, @NotBlank String password) {
    }

    public record AuthResponse(String token, UserProfile user) {
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest req) {
        if (users.existsByHandleIgnoreCase(req.handle())) {
            throw ApiException.conflict("handle already taken");
        }
        if (users.existsByEmailIgnoreCase(req.email())) {
            throw ApiException.conflict("email already registered");
        }
        User user = users.save(new User(req.handle(), req.email(),
                passwordEncoder.encode(req.password()), req.displayName(), req.isPoster()));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(jwtService.generateToken(user), UserProfile.of(user)));
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        User user = users.findByHandleIgnoreCase(req.handleOrEmail())
                .or(() -> users.findByEmailIgnoreCase(req.handleOrEmail()))
                .filter(u -> passwordEncoder.matches(req.password(), u.getPasswordHash()))
                .orElseThrow(() -> ApiException.unauthorized("invalid credentials"));
        return new AuthResponse(jwtService.generateToken(user), UserProfile.of(user));
    }
}
