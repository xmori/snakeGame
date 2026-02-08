package com.tcc.snakegame.service;

import com.tcc.snakegame.model.User;
import com.tcc.snakegame.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if(user == null) {
            throw new UsernameNotFoundException("UsuÃ¡rio nÃ£o encontrado");
        }
        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole());
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(), user.getPassword(), Collections.singletonList(authority)
        );
    }
}

