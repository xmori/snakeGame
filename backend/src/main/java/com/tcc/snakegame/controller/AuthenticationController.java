package com.tcc.snakegame.controller;

import com.tcc.snakegame.model.User;
import com.tcc.snakegame.repository.UserRepository;
import com.tcc.snakegame.util.JwtUtil;
import com.tcc.snakegame.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userDetailsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public AuthResponse createAuthenticationToken(@RequestBody AuthRequest authRequest) throws Exception {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw new Exception("Credenciais invÃ¡lidas", e);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequest.getUsername());
        final String jwt = jwtUtil.generateToken(userDetails);
        return new AuthResponse(jwt);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody AuthRequest authRequest) {
        if (userRepository.findByUsername(authRequest.getUsername()) != null) {
            return ResponseEntity
                    .badRequest()
                    .body("Erro: nome de usuÃ¡rio jÃ¡ existe!");
        }

        User user = new User();
        user.setUsername(authRequest.getUsername());
        user.setPassword(passwordEncoder.encode(authRequest.getPassword()));
        user.setRole("USER");

        userRepository.save(user);

        return ResponseEntity.ok("UsuÃ¡rio registrado com sucesso.");
    }

    public static class AuthRequest {
        private String username;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String u) { this.username = u; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
    }

    public static class AuthResponse {
        private String token;
        public AuthResponse(String t) { this.token = t; }
        public String getToken() { return token; }
    }
}

