package com.financehub.service;

import com.financehub.dto.UpdateUserRequest;
import com.financehub.dto.UserResponse;
import com.financehub.exception.DuplicateUserException;
import com.financehub.exception.ResourceNotFoundException;
import com.financehub.model.Role;
import com.financehub.model.User;
import com.financehub.repository.RoleRepository;
import com.financehub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserResponse getById(Long id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public UserResponse updateProfile(Long id, UpdateUserRequest request) {
        User user = findUser(id);

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new DuplicateUserException("Email already in use: " + request.getEmail());
            }
            user.setEmail(request.getEmail());
        }
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        return toResponse(userRepository.save(user));
    }

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(UserService::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deactivate(Long id) {
        User user = findUser(id);
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateRole(Long id, String roleName) {
        User user = findUser(id);
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        user.setRole(role);
        return toResponse(userRepository.save(user));
    }

    private User findUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public static UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().getRoleName() : null)
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
