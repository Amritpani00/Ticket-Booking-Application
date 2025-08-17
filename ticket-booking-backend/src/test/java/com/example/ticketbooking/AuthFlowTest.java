package com.example.ticketbooking;

import com.example.ticketbooking.model.AppUser;
import com.example.ticketbooking.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.time.OffsetDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class AuthFlowTest {

	@Autowired
	UserRepository userRepository;

	@Autowired
	PasswordEncoder passwordEncoder;

	@Autowired
	AuthenticationManager authenticationManager;

	@Test
	void register_and_login_success() {
		String email = "auth_tester@example.com";
		if (!userRepository.existsByEmail(email)) {
			AppUser u = AppUser.builder()
					.name("Auth Tester")
					.email(email)
					.passwordHash(passwordEncoder.encode("secret123"))
					.createdAt(OffsetDateTime.now())
					.build();
			userRepository.save(u);
		}
		Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, "secret123"));
		assertThat(auth.isAuthenticated()).isTrue();
	}
}