package com.dealhub.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByHandleIgnoreCase(String handle);

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByHandleIgnoreCase(String handle);

    boolean existsByEmailIgnoreCase(String email);
}
